"use client"

import { Mic, X } from "lucide-react"
import { useState } from "react"

/**
 * Launcher backed by Retell's hosted orb page in an iframe.
 *
 * This is the path that needs nothing but a share link: no API key on the
 * server, no agent-type constraint, no token minted per call. Retell's page
 * handles the microphone and the call; we supply the button and the panel so it
 * still looks like the site rather than a bolted-on widget.
 *
 * It renders only when NEXT_PUBLIC_RETELL_ORB_URL is set, so the API-backed
 * launcher stays the default wherever that is working.
 */
export function OrbLauncher({ url }: { url: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-brand-900 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">OnDuty Agent</p>
              <p className="text-xs text-white/45">Answers instantly, 24/7</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe
            src={url}
            title="Talk to OnDuty Agent"
            allow="microphone; autoplay"
            className="h-[420px] w-full border-0 bg-brand-950"
          />
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-brand-accent px-5 py-3.5 text-sm font-semibold text-brand-950 shadow-lg shadow-brand-accent/30 transition-transform hover:scale-105"
      >
        <Mic className="h-4 w-4" />
        {open ? "Close" : "Talk to us"}
      </button>
    </>
  )
}
