import { NextResponse } from "next/server"

import { business } from "@/lib/business"
import { findExistingAgent } from "@/lib/provision"
import { getNiche } from "@/lib/niches"

/**
 * Mints a short-lived Retell web-call access token.
 *
 * The Retell *private* API key never leaves the server — the browser only ever
 * receives the per-call access token that the SDK needs to join the room.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Cached across requests in a warm instance so discovery costs one lookup. */
let discoveredAgentId: string | null = null

/** Hosting dashboards happily store "  " or a leftover placeholder. */
function envAgentId(): string | null {
  const raw = (process.env.NEXT_PUBLIC_RETELL_AGENT_ID ?? "").trim()
  return raw.length > 0 ? raw : null
}

/** The agent committed in lib/business.ts, if one has been set there. */
function committedAgentId(): string | null {
  const raw = business.retellAgentId.trim()
  return raw.length > 0 ? raw : null
}

/**
 * Resolution order:
 *   1. NEXT_PUBLIC_RETELL_AGENT_ID — per-environment override, e.g. staging
 *   2. business.retellAgentId — the live agent, committed to the repo
 *   3. a lookup by agent name — only when neither of the above is set, which
 *      is what lets the /setup page work end to end on a fresh install
 */
async function resolveAgentId(apiKey: string): Promise<string | null> {
  const pinned = envAgentId() ?? committedAgentId()
  if (pinned) return pinned

  if (discoveredAgentId) return discoveredAgentId

  discoveredAgentId = await findExistingAgent(apiKey)
  return discoveredAgentId
}

/**
 * Dynamic variables are substituted into the agent prompt at call time, which
 * is how one agent serves five industry pages. The prompt is written to work
 * with an empty `niche` too (it just asks), so a rejected or ignored variable
 * degrades to a slightly more generic call rather than a broken one.
 */
function dynamicVariables(niche: string | null) {
  const matched = niche ? getNiche(niche) : undefined
  if (!matched) return { niche: "" }

  return {
    niche: matched.name,
    niche_slug: matched.slug,
    niche_audience: matched.audience,
  }
}

/**
 * `withVariables: false` drops `retell_llm_dynamic_variables` from the body.
 *
 * That field is specific to Retell-LLM agents. An agent built with Retell's
 * conversation-flow builder can reject a body carrying it, which fails the call
 * outright — so a refusal is retried without it. The niche is then unknown to
 * the agent, and the prompt handles that by simply asking, which is why losing
 * the variables costs a question rather than the call.
 */
async function createWebCall(
  apiKey: string,
  agentId: string,
  niche: string | null,
  withVariables = true,
) {
  return fetch("https://api.retellai.com/v2/create-web-call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: agentId,
      ...(withVariables ? { retell_llm_dynamic_variables: dynamicVariables(niche) } : {}),
    }),
  })
}

/** The body is optional — an older cached client may post nothing at all. */
async function readNiche(request: Request): Promise<string | null> {
  try {
    const body = (await request.json()) as { niche?: unknown }
    return typeof body?.niche === "string" ? body.niche : null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.RETELL_API_KEY
  const niche = await readNiche(request)
  const agentId = apiKey ? await resolveAgentId(apiKey) : null

  // Setup gaps are a developer problem, so the detail goes to the server log and
  // the visitor gets a message that makes sense to them. This matters because the
  // site can legitimately be deployed before `npm run provision:retell` has run.
  if (!apiKey || !agentId) {
    console.error(
      !apiKey
        ? "Retell not configured: RETELL_API_KEY is missing from the environment."
        : "Retell not configured: no agent found. Visit /setup to create one, or run `npm run provision:retell`.",
    )
    return NextResponse.json(
      {
        error: "not_configured",
        message: "Our assistant is finishing setup and isn't taking calls just yet.",
      },
      { status: 503 },
    )
  }

  try {
    let res = await createWebCall(apiKey, agentId, niche)

    // An ID pasted into a hosting dashboard can be stale or mistyped, so a
    // rejected env override retries via name lookup. A committed ID gets no
    // such retry: it is authoritative, and quietly swapping to a differently
    // named older agent would answer callers with the wrong receptionist,
    // which is worse than failing loudly.
    if (!res.ok && envAgentId()) {
      console.error(
        `create-web-call rejected agent "${agentId}" (${res.status}); retrying with a looked-up agent.`,
      )
      const fallbackId = await findExistingAgent(apiKey)
      if (fallbackId && fallbackId !== agentId) {
        res = await createWebCall(apiKey, fallbackId, niche)
      }
    }

    // A body Retell will not accept is retried without the dynamic variables,
    // which is the only part of it that depends on the agent's response engine.
    if (!res.ok && (res.status === 400 || res.status === 422)) {
      console.error(
        `create-web-call rejected with ${res.status}; retrying without dynamic variables.`,
      )
      const retried = await createWebCall(apiKey, agentId, niche, false)
      if (retried.ok) {
        console.error(
          "Retry succeeded — this agent does not accept retell_llm_dynamic_variables, " +
            "so the niche is not being passed and the agent will ask instead.",
        )
        res = retried
      }
    }

    if (!res.ok) {
      const detail = await res.text()
      console.error("Retell create-web-call failed", res.status, detail, `agent=${agentId}`)

      /*
       * "Please try again" is the right thing to tell a visitor and the wrong
       * thing to tell the person who has to fix it — a retry never helps when
       * the agent id is wrong. Retell's status says which it is, so map the
       * ones with distinct causes. The upstream body stays in the server log;
       * only the status reaches the browser.
       */
      const diagnosis =
        res.status === 401 || res.status === 403
          ? "the API key was rejected, or it belongs to a different Retell workspace than the agent"
          : res.status === 404
            ? `no agent with id ${agentId} exists on this Retell account`
            : res.status === 400 || res.status === 422
              ? "Retell rejected the request body — most often an agent that is still a draft, or one whose response engine does not accept dynamic variables"
              : `Retell returned ${res.status}`

      return NextResponse.json(
        {
          error: "retell_error",
          message: "Could not start the call. Please try again.",
          diagnosis,
          upstreamStatus: res.status,
        },
        { status: 502 },
      )
    }

    const data = (await res.json()) as { access_token?: string; call_id?: string }

    if (!data.access_token) {
      return NextResponse.json(
        { error: "retell_error", message: "Retell did not return an access token." },
        { status: 502 },
      )
    }

    return NextResponse.json({ accessToken: data.access_token, callId: data.call_id })
  } catch (err) {
    console.error("Retell create-web-call threw", err)
    return NextResponse.json(
      { error: "network_error", message: "Could not reach the voice service." },
      { status: 502 },
    )
  }
}
