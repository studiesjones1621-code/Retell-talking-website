import { NextResponse } from "next/server"

import { provisionAgent } from "@/lib/provision"

/**
 * Creates the Retell agent from the browser, so the site can be set up without
 * a terminal. Runs on the hosting platform, which — unlike a locked-down build
 * sandbox — can reach api.retellai.com and api.cal.com.
 *
 * Guarded by SETUP_SECRET: without that variable set the route does not exist,
 * so a deployed site never exposes an unprotected "create things on my Retell
 * account" button.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function authorize(request: Request) {
  const secret = process.env.SETUP_SECRET

  if (!secret) {
    return NextResponse.json(
      {
        error: "setup_disabled",
        message:
          "Setup is turned off. Add a SETUP_SECRET environment variable to enable this page.",
      },
      { status: 404 },
    )
  }

  const provided = new URL(request.url).searchParams.get("key")
  if (provided !== secret) {
    return NextResponse.json(
      { error: "unauthorized", message: "Wrong setup key." },
      { status: 401 },
    )
  }

  return null
}

/** Reports what is configured, without ever returning a key. */
export async function GET(request: Request) {
  const denied = authorize(request)
  if (denied) return denied

  return NextResponse.json({
    hasRetellKey: Boolean(process.env.RETELL_API_KEY),
    hasCalKey: Boolean((process.env.CAL_API_KEY ?? "").trim()),
    agentId: process.env.NEXT_PUBLIC_RETELL_AGENT_ID || null,
  })
}

export async function POST(request: Request) {
  const denied = authorize(request)
  if (denied) return denied

  const retellApiKey = process.env.RETELL_API_KEY
  if (!retellApiKey) {
    return NextResponse.json(
      {
        error: "missing_key",
        message:
          "RETELL_API_KEY is not set. Add it in your hosting environment variables and redeploy.",
      },
      { status: 400 },
    )
  }

  try {
    const result = await provisionAgent({
      retellApiKey,
      calApiKey: process.env.CAL_API_KEY,
      existingAgentId: process.env.NEXT_PUBLIC_RETELL_AGENT_ID || undefined,
      existingLlmId: process.env.RETELL_LLM_ID || undefined,
    })

    return NextResponse.json({
      agentId: result.agentId,
      llmId: result.llmId,
      voiceId: result.voiceId,
      bookingEnabled: result.bookingEnabled,
      calEventTitle: result.calEvent?.title ?? null,
      log: result.log,
    })
  } catch (err) {
    console.error("Agent provisioning failed", err)
    return NextResponse.json(
      { error: "provision_failed", message: (err as Error).message },
      { status: 502 },
    )
  }
}
