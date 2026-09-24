"use client"

import Script from "next/script"

/**
 * Retell's official drop-in widget — an ALTERNATIVE to the custom launcher in
 * voice-agent-widget.tsx. It is not mounted by default.
 *
 * The custom launcher is the default because it is what makes the brand-matched
 * styling, the rotating 5-second CTA bubble and the friendly microphone-error
 * handling possible; the drop-in widget renders Retell's own chrome instead.
 *
 * To use this one instead, in app/page.tsx swap <VoiceAgentWidget /> for
 * <RetellOfficialWidget /> (the provider is then no longer required).
 *
 * Prefer the custom launcher whenever the site is hosted somewhere you control:
 * it needs only the private API key (which never leaves the server) and it is
 * brand-matched. This one exists for the case where you cannot run a server.
 *
 * NOTE: this path talks to Retell straight from the browser using the PUBLIC
 * key, so the site's domain — plus `localhost` for local testing — must be
 * listed under Allowed Domains in the Retell dashboard's Public Keys settings,
 * or the widget silently fails to load.
 */
export function RetellOfficialWidget() {
  const publicKey = process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY
  const agentId = process.env.NEXT_PUBLIC_RETELL_AGENT_ID

  if (!publicKey || !agentId) return null

  return (
    <Script
      src="https://dashboard.retellai.com/retell-widget.js"
      strategy="afterInteractive"
      id="retell-widget"
      data-public-key={publicKey}
      data-voice-agent-id={agentId}
      data-title="Talk to us"
      data-color="#b6f23e"
    />
  )
}
