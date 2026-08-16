"use client"

import { Mic, Phone } from "lucide-react"

import { business, hasPhone, phoneHref, phoneLabel } from "@/lib/business"
import { useVoiceAgent } from "@/components/voice-agent/voice-agent-provider"
import { cn } from "@/lib/utils"

/**
 * The site's only two actions: click-to-call, and talk to the AI agent.
 * When no phone number is configured the agent becomes the primary action,
 * so we never render a dead tel: link.
 */
export function CtaButtons({
  className,
  align = "start",
}: {
  className?: string
  align?: "start" | "center"
}) {
  const { open } = useVoiceAgent()

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row",
        align === "center" ? "items-stretch sm:items-center sm:justify-center" : "items-stretch sm:items-start",
        className,
      )}
    >
      {hasPhone && phoneHref ? (
        <>
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-7 py-4 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90"
          >
            <Phone className="h-4 w-4" />
            Call {phoneLabel}
          </a>
          <button
            onClick={open}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Mic className="h-4 w-4" />
            Talk to our assistant
          </button>
        </>
      ) : (
        <>
          <button
            onClick={open}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-7 py-4 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90"
          >
            <Mic className="h-4 w-4" />
            Talk to our assistant
          </button>
          <a
            href={`mailto:${business.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {business.cta.label}
          </a>
        </>
      )}
    </div>
  )
}
