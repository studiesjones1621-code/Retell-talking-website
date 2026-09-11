"use client"

import { CalendarCheck, Mic, Phone } from "lucide-react"

import { business, hasBooking, hasPhone, phoneHref, phoneLabel } from "@/lib/business"
import { useVoiceAgent } from "@/components/voice-agent/voice-agent-provider"
import { cn } from "@/lib/utils"

/**
 * Every CTA on the site is a book-a-call CTA — no prices are published, so the
 * booking is the only next step.
 *
 * The primary action degrades in order of what is actually configured: a real
 * booking link if there is one, otherwise the voice agent (which can book), and
 * a phone number is offered alongside whenever one exists. We never render a
 * dead tel: link or an empty booking href.
 */
export function CtaButtons({
  className,
  align = "start",
  /** Overrides the primary button label, e.g. "Get a free SEO look". */
  primaryLabel,
}: {
  className?: string
  align?: "start" | "center"
  primaryLabel?: string
}) {
  const { open } = useVoiceAgent()

  const primary = hasBooking ? (
    <a
      href={business.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-7 py-4 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90"
    >
      <CalendarCheck className="h-4 w-4" />
      {primaryLabel ?? business.cta.label}
    </a>
  ) : (
    <button
      onClick={open}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-7 py-4 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90"
    >
      <Mic className="h-4 w-4" />
      Talk to our assistant
    </button>
  )

  const secondary = hasBooking ? (
    <button
      onClick={open}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      <Mic className="h-4 w-4" />
      Talk to our assistant
    </button>
  ) : hasPhone && phoneHref ? (
    <a
      href={phoneHref}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      <Phone className="h-4 w-4" />
      Call {phoneLabel}
    </a>
  ) : (
    <a
      href={`mailto:${business.email}`}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      {business.cta.label}
    </a>
  )

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row",
        align === "center"
          ? "items-stretch sm:items-center sm:justify-center"
          : "items-stretch sm:items-start",
        className,
      )}
    >
      {primary}
      {secondary}
    </div>
  )
}
