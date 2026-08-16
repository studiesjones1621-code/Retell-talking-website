import { NextResponse } from "next/server"

/**
 * Mints a short-lived Retell web-call access token.
 *
 * The Retell *private* API key never leaves the server — the browser only ever
 * receives the per-call access token that the SDK needs to join the room.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  const apiKey = process.env.RETELL_API_KEY
  const agentId = process.env.NEXT_PUBLIC_RETELL_AGENT_ID

  // Setup gaps are a developer problem, so the detail goes to the server log and
  // the visitor gets a message that makes sense to them. This matters because the
  // site can legitimately be deployed before `npm run provision:retell` has run.
  if (!apiKey || !agentId) {
    console.error(
      `Retell not configured: missing ${!apiKey ? "RETELL_API_KEY" : "NEXT_PUBLIC_RETELL_AGENT_ID"}.` +
        " Run `npm run provision:retell`, then set the value in your hosting environment.",
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
