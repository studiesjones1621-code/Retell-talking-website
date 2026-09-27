"use client"

import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import { business } from "@/lib/business"

const AGENT_ID = process.env.NEXT_PUBLIC_RETELL_AGENT_ID
const PUBLIC_KEY = process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY

/** The line the bubble cycles through. First one is the CTA. */
const MESSAGES = [
  "Would you like to book a free pickup?",
  "Ask me what it costs — takes a second.",
  "Need a 4-hour turnaround today?",
]

/**
 * Retell's own widget handles the call. Two things are layered on top:
 *
 * 1. A rotating prompt bubble. The widget's built-in popup
 *    (data-show-ai-popup) fires once and stays, so it is switched off and this
 *    drives the 5s-on / 5s-off cycle instead.
 * 2. A microphone pre-flight. Without it a visitor with no mic, or one who has
 *    blocked the permission, gets a runtime error inside the widget with no
 *    explanation and no way to reach the business.
 */
export function VoiceWidget() {
  const [bubble, setBubble] = useState<string | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const index = useRef(0)
  const dismissed = useRef(false)

  useEffect(() => {
    if (!AGENT_ID || !PUBLIC_KEY) return

    let onTimer: ReturnType<typeof setTimeout>
    let offTimer: ReturnType<typeof setTimeout>

    // 5s after load the bubble appears, stays 5s, hides 5s, repeats.
    const show = () => {
      if (dismissed.current) return
      setBubble(MESSAGES[index.current % MESSAGES.length])
      index.current += 1
      offTimer = setTimeout(() => {
        setBubble(null)
        onTimer = setTimeout(show, 5000)
      }, 5000)
    }
    onTimer = setTimeout(show, 5000)

    return () => {
      clearTimeout(onTimer)
      clearTimeout(offTimer)
    }
  }, [])

  /** Find Retell's floating button, including inside its shadow DOM. */
  function findLauncher(): HTMLElement | null {
    const direct = document.querySelector<HTMLElement>(
      "[class*='retell'] button, #retell-widget-container button",
    )
    if (direct) return direct
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("*"))) {
      const root = (el as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot
      const btn = root?.querySelector?.("button")
      if (btn) return btn as HTMLElement
    }
    return null
  }

  async function openAssistant() {
    dismissed.current = true
    setBubble(null)
    setMicError(null)

    // Ask for the microphone before handing over to the widget, so a refusal
    // becomes a sentence with a phone number in it rather than a console error.
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw Object.assign(new Error("unsupported"), { name: "NotSupportedError" })
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch (err) {
      const name = (err as DOMException)?.name
      setMicError(
        name === "NotFoundError" || name === "NotSupportedError"
          ? `No microphone found. Check your mic and try again, or text us at ${business.textLine}.`
          : `We need microphone access to talk. Allow it in your browser, or text us at ${business.textLine}.`,
      )
      return
    }

    findLauncher()?.click()
  }

  if (!AGENT_ID || !PUBLIC_KEY) return null

  return (
    <>
      <Script
        id="retell-widget"
        src="https://dashboard.retellai.com/retell-widget-v2.js"
        type="module"
        strategy="afterInteractive"
        data-voice-public-key={PUBLIC_KEY}
        data-voice-agent-id={AGENT_ID}
        data-title="Clean Rite Center"
        data-bot-name="Rita"
        data-fab-text="Talk to us"
        data-theme-color="#0F3A8D"
        data-component-color="#F8E451"
        data-logo-url="/crc/logo.png"
        // Switched off deliberately — the rotating bubble below replaces it.
        data-show-ai-popup="false"
        data-auto-open="false"
      />

      <div className="pointer-events-none fixed bottom-24 right-5 z-50 flex max-w-[min(20rem,calc(100vw-2.5rem))] flex-col items-end gap-2">
        {micError && (
          <div className="pointer-events-auto rounded-2xl bg-white px-4 py-3 text-sm leading-snug text-foreground shadow-xl ring-1 ring-black/10">
            {micError}
            <button
              onClick={() => setMicError(null)}
              className="mt-2 block text-xs font-semibold text-brand hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {bubble && !micError && (
          <button
            onClick={openAssistant}
            className="pointer-events-auto animate-in fade-in slide-in-from-bottom-2 rounded-2xl rounded-br-sm bg-white px-4 py-3 text-left text-sm font-semibold leading-snug text-brand-deep shadow-xl ring-1 ring-black/10 transition-transform hover:scale-[1.02]"
          >
            {bubble}
            <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
              Tap to talk to Rita
            </span>
          </button>
        )}
      </div>
    </>
  )
}
