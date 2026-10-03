"use client"

import { CalendarCheck, Mic } from "lucide-react"

import { calTriggerProps } from "@/components/booking-section"
import { useVoiceAgent } from "@/components/voice-agent/voice-agent-provider"

/**
 * The two interactive cards on the contact page.
 *
 * They live here rather than in the page because the page is a server
 * component, and `calTriggerProps` carries an onClick. Spreading it from a
 * server component drops the whole object — including `data-cal-link` — with
 * no error and no warning, which left a Book a demo card that rendered
 * perfectly and did nothing at all when clicked.
 */

const card =
  "flex w-full items-start gap-4 rounded-2xl border p-6 text-left transition-colors"

export function BookCard() {
  return (
    <a
      {...calTriggerProps}
      className={`${card} border-brand-accent/30 bg-brand-accent/[0.07] hover:bg-brand-accent/[0.12]`}
    >
      <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
      <span>
        <span className="block font-semibold text-white">Book a demo</span>
        <span className="mt-1 block text-sm text-white/55">
          Twenty minutes. We look at how your calls come in today and what should
          happen to them instead. Nothing to prepare.
        </span>
      </span>
    </a>
  )
}

export function TalkCard() {
  const { open } = useVoiceAgent()

  return (
    <button onClick={open} className={`${card} border-white/10 hover:border-white/25`}>
      <Mic className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
      <span>
        <span className="block font-semibold text-white">Talk to the agent</span>
        <span className="mt-1 block text-sm text-white/55">
          Tap here and it answers. Ask what it costs, or tell it what you run and see
          whether it keeps up — it is the same technology we would put on your phone.
        </span>
      </span>
    </button>
  )
}
