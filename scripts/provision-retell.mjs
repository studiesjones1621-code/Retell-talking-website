#!/usr/bin/env node
/**
 * Provisions the Retell voice agent for this site.
 *
 *   npm run provision:retell
 *
 * Creates (or updates) a Retell LLM + Agent built from lib/business.ts, wires
 * Cal.com booking when CAL_API_KEY is set, and writes the resulting IDs back
 * into .env.local so the site picks them up on the next dev/build.
 *
 * Safe to re-run: if RETELL_LLM_ID / NEXT_PUBLIC_RETELL_AGENT_ID already exist
 * in .env.local, the existing resources are updated in place instead of
 * creating duplicates.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { business, hasPhone, fullAddress, cityState } from "../lib/business.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ENV_PATH = resolve(ROOT, ".env.local")
const RETELL_BASE = "https://api.retellai.com"

/** Voice preference order — the first one Retell actually offers wins. */
const PREFERRED_VOICES = [
  "11labs-Adrian",
  "11labs-Anna",
  "11labs-Marissa",
  "openai-Alloy",
]

// ------------------------------------------------------------------ env helpers

function parseEnvFile(path) {
  if (!existsSync(path)) return {}
  const out = {}
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function upsertEnv(updates) {
  const lines = existsSync(ENV_PATH)
    ? readFileSync(ENV_PATH, "utf8").split("\n")
    : []

  for (const [key, value] of Object.entries(updates)) {
    const idx = lines.findIndex((l) => l.trim().startsWith(`${key}=`))
    if (idx === -1) lines.push(`${key}=${value}`)
    else lines[idx] = `${key}=${value}`
  }

  writeFileSync(ENV_PATH, lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n")
}

const fileEnv = parseEnvFile(ENV_PATH)
const env = { ...fileEnv, ...process.env }

const RETELL_API_KEY = env.RETELL_API_KEY
const CAL_API_KEY = (env.CAL_API_KEY ?? "").trim()

if (!RETELL_API_KEY) {
  console.error("✗ RETELL_API_KEY is missing. Add it to .env.local and re-run.")
  process.exit(1)
}

// --------------------------------------------------------------- http helpers

async function retell(path, { method = "GET", body } = {}) {
  const res = await fetch(`${RETELL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${RETELL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Retell ${method} ${path} → ${res.status}\n${text}`)
  }
  return text ? JSON.parse(text) : null
}

// ------------------------------------------------------------------- cal.com

/**
 * Finds the event type the agent should book into. Tries Cal.com API v2 first,
 * then falls back to v1. Prefers an event type whose title mentions the CTA
 * (e.g. "demo"), otherwise takes the shortest one, otherwise the only one.
 */
async function resolveCalEventType() {
  if (!CAL_API_KEY || CAL_API_KEY.toUpperCase() === "SKIP") return null

  const attempts = [
    {
      label: "v2",
      url: "https://api.cal.com/v2/event-types",
      headers: {
        Authorization: `Bearer ${CAL_API_KEY}`,
        "cal-api-version": "2024-06-14",
      },
      extract: (json) => {
        const groups = json?.data?.eventTypeGroups
        if (Array.isArray(groups)) return groups.flatMap((g) => g.eventTypes ?? [])
        if (Array.isArray(json?.data)) return json.data
        return []
      },
    },
    {
      label: "v1",
      url: `https://api.cal.com/v1/event-types?apiKey=${encodeURIComponent(CAL_API_KEY)}`,
      headers: {},
      extract: (json) => json?.event_types ?? [],
    },
  ]

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, { headers: attempt.headers })
      if (!res.ok) {
        console.warn(`  · Cal.com ${attempt.label} responded ${res.status}, trying next…`)
        continue
      }
      const json = await res.json()
      const eventTypes = attempt.extract(json).filter((e) => e && e.id)

      if (eventTypes.length === 0) {
        console.warn(`  · Cal.com ${attempt.label} returned no event types.`)
        continue
      }

      const ctaWords = business.cta.goal.toLowerCase().split(/\s+/)
      const scored = eventTypes
        .map((e) => {
          const title = String(e.title ?? e.slug ?? "").toLowerCase()
          const keywordHit = ctaWords.some((w) => w.length > 3 && title.includes(w))
          return { event: e, score: (keywordHit ? 100 : 0) - (e.length ?? 60) / 1000 }
        })
        .sort((a, b) => b.score - a.score)

      const chosen = scored[0].event
      console.log(
        `  · Cal.com (${attempt.label}): ${eventTypes.length} event type(s), using "${chosen.title ?? chosen.slug}" (id ${chosen.id})`,
      )
      return { id: Number(chosen.id), title: chosen.title ?? chosen.slug ?? "appointment" }
    } catch (err) {
      console.warn(`  · Cal.com ${attempt.label} failed: ${err.message}`)
    }
  }

  return null
}

// -------------------------------------------------------------------- prompt

function buildPrompt({ bookingEnabled, eventTitle }) {
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

  return `You are the virtual receptionist for ${business.name}, an ${business.type.toLowerCase()}${cityState ? ` serving ${cityState}` : ""}.

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
${business.shortDescription}
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

// ---------------------------------------------------------------------- main

async function pickVoice() {
  try {
    const voices = await retell("/list-voices")
    const ids = new Set(voices.map((v) => v.voice_id))
    for (const preferred of PREFERRED_VOICES) {
      if (ids.has(preferred)) return preferred
    }
    const fallback = voices[0]?.voice_id
    if (fallback) {
      console.log(`  · Preferred voices unavailable, using "${fallback}".`)
      return fallback
    }
  } catch (err) {
    console.warn(`  · Could not list voices (${err.message}). Falling back to 11labs-Adrian.`)
  }
  return "11labs-Adrian"
}

async function main() {
  console.log(`\nProvisioning Retell agent for ${business.name}…\n`)

  console.log("→ Resolving Cal.com booking…")
  const calEvent = await resolveCalEventType()
  const bookingEnabled = Boolean(calEvent)
  console.log(
    bookingEnabled
      ? `  ✓ Real booking enabled (event type ${calEvent.id}).`
      : "  ○ No Cal.com event type available — agent will run in lead-capture mode.",
  )

  console.log("→ Selecting a voice…")
  const voiceId = await pickVoice()
  console.log(`  ✓ Voice: ${voiceId}`)

  const generalTools = [
    {
      type: "end_call",
      name: "end_call",
      description:
        "End the call once the caller's questions are answered and they have nothing further.",
    },
  ]

  if (bookingEnabled) {
    generalTools.push(
      {
        type: "check_availability_cal",
        name: "check_availability",
        description:
          "Check real open appointment slots on the calendar. Always call this before offering any times.",
        cal_api_key: CAL_API_KEY,
        event_type_id: calEvent.id,
        timezone: business.address.timezone,
      },
      {
        type: "book_appointment_cal",
        name: "book_appointment",
        description:
          "Book the appointment once the caller has picked a slot and given their name, email and phone number.",
        cal_api_key: CAL_API_KEY,
        event_type_id: calEvent.id,
        timezone: business.address.timezone,
      },
    )
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

  console.log("→ Creating Retell LLM…")
  let llmId = fileEnv.RETELL_LLM_ID
  if (llmId) {
    await retell(`/update-retell-llm/${llmId}`, { method: "PATCH", body: llmPayload })
    console.log(`  ✓ Updated existing LLM ${llmId}`)
  } else {
    const llm = await retell("/create-retell-llm", { method: "POST", body: llmPayload })
    llmId = llm.llm_id
    console.log(`  ✓ Created LLM ${llmId}`)
  }

  const agentPayload = {
    agent_name: `${business.name} — Website Receptionist`,
    response_engine: { type: "retell-llm", llm_id: llmId },
    voice_id: voiceId,
    language: "en-US",
    voice_speed: 1.02,
    interruption_sensitivity: 0.9,
    responsiveness: 1,
    enable_backchannel: true,
    backchannel_frequency: 0.7,
    ambient_sound: null,
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

  console.log("→ Creating Retell agent…")
  let agentId = fileEnv.NEXT_PUBLIC_RETELL_AGENT_ID
  if (agentId) {
    await retell(`/update-agent/${agentId}`, { method: "PATCH", body: agentPayload })
    console.log(`  ✓ Updated existing agent ${agentId}`)
  } else {
    const agent = await retell("/create-agent", { method: "POST", body: agentPayload })
    agentId = agent.agent_id
    console.log(`  ✓ Created agent ${agentId}`)
  }

  upsertEnv({
    RETELL_LLM_ID: llmId,
    NEXT_PUBLIC_RETELL_AGENT_ID: agentId,
  })

  console.log(`
──────────────────────────────────────────────
  Agent ID : ${agentId}
  LLM ID   : ${llmId}
  Voice    : ${voiceId}
  Booking  : ${bookingEnabled ? `Cal.com event type ${calEvent.id}` : "lead capture only"}

  Written to .env.local. Restart the dev server.
──────────────────────────────────────────────
`)
}

main().catch((err) => {
  console.error(`\n✗ Provisioning failed:\n${err.message}\n`)
  process.exit(1)
})
