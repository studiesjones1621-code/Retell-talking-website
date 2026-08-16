/**
 * Shared agent-provisioning logic.
 *
 * Used by two front doors:
 *   - scripts/provision-retell.mjs  (command line)
 *   - app/api/setup/route.ts        (the one-button /setup page)
 *
 * Both call `provisionAgent()`, so the agent is identical either way.
 * Server-side only — this file handles private API keys and must never be
 * imported into a client component.
 */

import { business, cityState, fullAddress, hasPhone } from "./business.ts"

const RETELL_BASE = "https://api.retellai.com"

/** Voice preference order — the first one Retell actually offers wins. */
const PREFERRED_VOICES = ["11labs-Adrian", "11labs-Anna", "11labs-Marissa", "openai-Alloy"]

/** Lets the site find an agent this project created when no ID is configured. */
export const AGENT_NAME = `${business.name} — Website Receptionist`

export type CalEvent = { id: number; title: string }

export type ProvisionResult = {
  agentId: string
  llmId: string
  voiceId: string
  bookingEnabled: boolean
  calEvent: CalEvent | null
  /** Human-readable notes about what happened, surfaced in the UI and CLI. */
  log: string[]
}

export type ProvisionInput = {
  retellApiKey: string
  calApiKey?: string
  /** Update these instead of creating new resources, when known. */
  existingAgentId?: string
  existingLlmId?: string
}

// --------------------------------------------------------------------- retell

async function retell(
  apiKey: string,
  path: string,
  init: { method?: string; body?: unknown } = {},
) {
  const { method = "GET", body } = init
  const res = await fetch(`${RETELL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  if (!res.ok) {
    // Keep the status but never echo the key back out.
    throw new Error(`Retell ${method} ${path} failed (${res.status}): ${text.slice(0, 300)}`)
  }
  return text ? JSON.parse(text) : null
}

// -------------------------------------------------------------------- cal.com

/**
 * Finds the event type the agent should book into. Tries Cal.com API v2 first,
 * then falls back to v1. Prefers an event type whose title mentions the CTA
 * (e.g. "demo"), otherwise the shortest one.
 */
export async function resolveCalEventType(
  calApiKey: string | undefined,
  log: string[],
): Promise<CalEvent | null> {
  const key = (calApiKey ?? "").trim()
  if (!key || key.toUpperCase() === "SKIP") {
    log.push("No Cal.com key supplied — lead-capture mode.")
    return null
  }

  const attempts = [
    {
      label: "v2",
      url: "https://api.cal.com/v2/event-types",
      headers: { Authorization: `Bearer ${key}`, "cal-api-version": "2024-06-14" },
      extract: (json: any) => {
        const groups = json?.data?.eventTypeGroups
        if (Array.isArray(groups)) return groups.flatMap((g: any) => g.eventTypes ?? [])
        if (Array.isArray(json?.data)) return json.data
        return []
      },
    },
    {
      label: "v1",
      url: `https://api.cal.com/v1/event-types?apiKey=${encodeURIComponent(key)}`,
      headers: {} as Record<string, string>,
      extract: (json: any) => json?.event_types ?? [],
    },
  ]

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, { headers: attempt.headers })
      if (!res.ok) {
        log.push(`Cal.com ${attempt.label} responded ${res.status}.`)
        continue
      }

      const eventTypes = attempt.extract(await res.json()).filter((e: any) => e?.id)
      if (eventTypes.length === 0) {
        log.push(`Cal.com ${attempt.label} returned no event types.`)
        continue
      }

      const ctaWords = business.cta.goal.toLowerCase().split(/\s+/)
      const chosen = eventTypes
        .map((e: any) => {
          const title = String(e.title ?? e.slug ?? "").toLowerCase()
          const hit = ctaWords.some((w) => w.length > 3 && title.includes(w))
          return { event: e, score: (hit ? 100 : 0) - (e.length ?? 60) / 1000 }
        })
        .sort((a: any, b: any) => b.score - a.score)[0].event

      const title = String(chosen.title ?? chosen.slug ?? "appointment")
      log.push(
        `Cal.com: found ${eventTypes.length} event type(s), booking into "${title}" (id ${chosen.id}).`,
      )
      return { id: Number(chosen.id), title }
    } catch (err) {
      log.push(`Cal.com ${attempt.label} failed: ${(err as Error).message}`)
    }
  }

  log.push("Could not read Cal.com event types — falling back to lead capture.")
  return null
}

// --------------------------------------------------------------------- prompt

export function buildPrompt({
  bookingEnabled,
  eventTitle,
}: {
  bookingEnabled: boolean
  eventTitle: string
}): string {
  const servicesBlock = business.services
    .map((s) => `- ${s.name} — ${s.price}${s.priceNote ? ` ${s.priceNote}` : ""}. ${s.description}`)
    .join("\n")

  const hoursBlock = business.hours.map((h) => `- ${h.day}: ${h.hours}`).join("\n")

  const locationLine = fullAddress
    ? `Address: ${fullAddress}.`
    : `Service area: ${business.serviceArea}. There is no walk-in location.`

  const phoneLine = hasPhone
    ? `Phone: ${business.phone}.`
    : `The business does not publish a direct phone line — direct callers to ${business.email} if they want a human.`

  const bookingBlock = bookingEnabled
    ? `## Booking (you can book for real)
You have live calendar access.
1. When the caller shows interest, offer to ${business.cta.goal}.
2. Call \`check_availability\` to get real open slots. Never invent times.
3. Read back two or three options in plain language ("Thursday at two, or Friday morning").
4. Once they pick, collect — in this order — their full name, email address, and phone number. Repeat the email back to confirm the spelling.
5. Call \`book_appointment\` with those details for the "${eventTitle}" event type.
6. Confirm out loud: the day, the time, and that a confirmation email is on its way.
If the tool returns an error, apologise once, take their name and number, and say the team will confirm shortly.`
    : `## Booking (lead capture)
You cannot access the calendar directly.
1. When the caller shows interest, offer to ${business.cta.goal}.
2. Collect their full name, phone number, and preferred day and time.
3. Confirm the details back to them.
4. Tell them the office will call to confirm shortly. Do not promise a specific confirmed slot.`

  return `You are the virtual receptionist for ${business.name}${cityState ? `, serving ${cityState}` : ""}.
${business.shortDescription}

## Who you are talking to
Callers are ${business.audience}. They run HVAC companies — they are not homeowners with a broken furnace. If someone calls with an actual heating or cooling problem at their home, tell them warmly that you are the assistant for ${business.name}, which provides answering services *to* HVAC companies, and that they will want to call their own local contractor.

Because they are contractors, you can speak their language: no-heat and no-cool emergency calls, maintenance plans, tune-ups, dispatch boards, CSRs, seasonal call spikes during the first cold snap. Never bluff technical HVAC detail — you sell phone coverage, not equipment.

## Your job
Answer questions about services, prices, hours and location, and help callers ${business.cta.goal}. You are warm, efficient and genuinely helpful — a great front-desk person, not a salesperson.

## How you speak
This is a phone conversation, so:
- Keep replies to one or two short sentences. Never monologue.
- Use plain spoken language. No bullet points, no markdown, no emoji.
- Say prices naturally: "two ninety-seven a month", not "$297.00".
- Ask one question at a time, then stop and listen.
- If interrupted, stop immediately and respond to what they said.
- If you did not catch something, ask them to repeat it.

## About ${business.name}
Tagline: "${business.tagline}"
${locationLine}
${phoneLine}
Email: ${business.email}
Website: ${business.website}

## Services and prices
${servicesBlock}

## Office hours
${hoursBlock}
Note: ${business.afterHoursNote}

## Why customers choose us
${business.differentiators.map((d) => `- ${d.title}: ${d.description}`).join("\n")}

${bookingBlock}

## Your background objective
Every conversation should move gently toward the goal: ${business.cta.goal}. Offer it once naturally after you have been helpful. If they decline, drop it and stay helpful — never push twice.

## Rules
- Only state facts listed above. If you do not know something, say "I'm not certain — let me have someone follow up on that" and offer to take their details.
- Never invent prices, availability, guarantees or policies.
- Never claim to be human. If asked directly, say you are ${business.name}'s AI assistant.
- If the caller is upset or asks for a person, apologise, take their name and number, and promise a callback.
- End the call politely once their question is answered and there is nothing else they need.`
}

// ----------------------------------------------------------------------- main

async function pickVoice(apiKey: string, log: string[]): Promise<string> {
  try {
    const voices = await retell(apiKey, "/list-voices")
    const ids = new Set(voices.map((v: any) => v.voice_id))
    for (const preferred of PREFERRED_VOICES) {
      if (ids.has(preferred)) return preferred
    }
    if (voices[0]?.voice_id) {
      log.push(`Preferred voices unavailable, using "${voices[0].voice_id}".`)
      return voices[0].voice_id
    }
  } catch (err) {
    log.push(`Could not list voices (${(err as Error).message}). Using 11labs-Adrian.`)
  }
  return "11labs-Adrian"
}

/**
 * Looks for an agent this project previously created, so re-running setup
 * updates it instead of piling up duplicates on the account.
 */
export async function findExistingAgent(apiKey: string): Promise<string | null> {
  try {
    const agents = await retell(apiKey, "/list-agents")
    const match = agents?.find((a: any) => a.agent_name === AGENT_NAME)
    return match?.agent_id ?? null
  } catch {
    return null
  }
}

export async function provisionAgent({
  retellApiKey,
  calApiKey,
  existingAgentId,
  existingLlmId,
}: ProvisionInput): Promise<ProvisionResult> {
  const log: string[] = []

  const calEvent = await resolveCalEventType(calApiKey, log)
  const bookingEnabled = Boolean(calEvent)

  const voiceId = await pickVoice(retellApiKey, log)
  log.push(`Voice: ${voiceId}.`)

  const generalTools: Record<string, unknown>[] = [
    {
      type: "end_call",
      name: "end_call",
      description:
        "End the call once the caller's questions are answered and they have nothing further.",
    },
  ]

  if (bookingEnabled && calEvent) {
    for (const [type, name, description] of [
      [
        "check_availability_cal",
        "check_availability",
        "Check real open appointment slots on the calendar. Always call this before offering any times.",
      ],
      [
        "book_appointment_cal",
        "book_appointment",
        "Book the appointment once the caller has picked a slot and given their name, email and phone number.",
      ],
    ]) {
      generalTools.push({
        type,
        name,
        description,
        cal_api_key: (calApiKey ?? "").trim(),
        event_type_id: calEvent.id,
        timezone: business.address.timezone,
      })
    }
  }

  const llmPayload = {
    model: "gpt-4.1",
    model_temperature: 0.3,
    general_prompt: buildPrompt({
      bookingEnabled,
      eventTitle: calEvent?.title ?? "appointment",
    }),
    begin_message: `Thanks for calling ${business.name}, this is the virtual assistant. How can I help you today?`,
    general_tools: generalTools,
    start_speaker: "agent",
  }

  let llmId = existingLlmId
  if (llmId) {
    await retell(retellApiKey, `/update-retell-llm/${llmId}`, {
      method: "PATCH",
      body: llmPayload,
    })
    log.push(`Updated existing LLM ${llmId}.`)
  } else {
    const llm = await retell(retellApiKey, "/create-retell-llm", {
      method: "POST",
      body: llmPayload,
    })
    llmId = llm.llm_id as string
    log.push(`Created LLM ${llmId}.`)
  }

  const agentPayload = {
    agent_name: AGENT_NAME,
    response_engine: { type: "retell-llm", llm_id: llmId },
    voice_id: voiceId,
    language: "en-US",
    voice_speed: 1.02,
    interruption_sensitivity: 0.9,
    responsiveness: 1,
    enable_backchannel: true,
    backchannel_frequency: 0.7,
    max_call_duration_ms: 600000,
    end_call_after_silence_ms: 30000,
    ...(business.address.timezone ? { timezone: business.address.timezone } : {}),
    post_call_analysis_data: [
      {
        type: "string",
        name: "caller_name",
        description: "The caller's full name, if given.",
        examples: ["Jordan Reyes"],
      },
      {
        type: "string",
        name: "caller_phone",
        description: "The caller's phone number, if given.",
        examples: ["555-0142"],
      },
      {
        type: "boolean",
        name: "appointment_booked",
        description: "True if an appointment was actually booked on the call.",
      },
    ],
  }

  const targetAgentId = existingAgentId ?? (await findExistingAgent(retellApiKey))

  let agentId: string
  if (targetAgentId) {
    await retell(retellApiKey, `/update-agent/${targetAgentId}`, {
      method: "PATCH",
      body: agentPayload,
    })
    agentId = targetAgentId
    log.push(`Updated existing agent ${agentId}.`)
  } else {
    const agent = await retell(retellApiKey, "/create-agent", {
      method: "POST",
      body: agentPayload,
    })
    agentId = agent.agent_id as string
    log.push(`Created agent ${agentId}.`)
  }

  return { agentId, llmId: llmId!, voiceId, bookingEnabled, calEvent, log }
}
