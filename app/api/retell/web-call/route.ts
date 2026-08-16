import { NextResponse } from "next/server"

import { findExistingAgent } from "@/lib/provision"

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

/**
 * Prefers the configured agent ID, but falls back to looking up the agent this
 * project created. That fallback is what lets the /setup page work end to end:
 * the agent starts answering immediately, with no environment variable to paste
 * and no redeploy.
 */
async function resolveAgentId(apiKey: string): Promise<string | null> {
  const configured = process.env.NEXT_PUBLIC_RETELL_AGENT_ID
  if (configured) return configured

  if (discoveredAgentId) return discoveredAgentId

  discoveredAgentId = await findExistingAgent(apiKey)
  return discoveredAgentId
}

export async function POST() {
  const apiKey = process.env.RETELL_API_KEY
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
    const res = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent_id: agentId }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error("Retell create-web-call failed", res.status, detail)
      return NextResponse.json(
        { error: "retell_error", message: "Could not start the call. Please try again." },
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
