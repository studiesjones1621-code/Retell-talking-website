"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarCheck, ExternalLink } from "lucide-react"

import { business } from "@/lib/business"

/**
 * Real availability, on the page.
 *
 * Every CTA used to fall through to a mailto: link, which asks the visitor to
 * compose an email and wait — the highest-friction ending possible for a site
 * whose whole argument is that waiting loses business. This embeds the live
 * calendar so they pick a time and are done.
 *
 * Availability comes from Google Calendar via Cal.com, so a busy slot is never
 * offered and nothing needs syncing by hand.
 */
export function BookingSection({
  heading = "Grab fifteen minutes.",
  subcopy = "Pick a time that works. We will talk through how your calls come in today and what an agent would do with them.",
}: {
  heading?: string
  subcopy?: string
}) {
  const mounted = useRef(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    // Cal's loader has to define window.Cal as a queueing stub BEFORE the
    // script arrives; the script then drains that queue. Appending the script
    // first and calling Cal() in onload leaves the init calls with nothing to
    // queue into, which is why the embed silently never mounts.
    const w = window as unknown as {
      Cal?: ((...a: unknown[]) => void) & { q?: unknown[]; ns?: Record<string, (...a: unknown[]) => void>; loaded?: boolean }
    }

    const SRC = "https://app.cal.com/embed/embed.js"
    const NS = "onduty"

    if (!w.Cal) {
      const push = (target: { q?: unknown[] }, args: unknown) => {
        target.q = target.q || []
        target.q.push(args)
      }
      const cal = function (...args: unknown[]) {
        const c = w.Cal!
        if (!c.loaded) {
          c.ns = {}
          c.q = c.q || []
          const el = document.createElement("script")
          el.src = SRC
          el.onerror = () => setFailed(true)
          document.head.appendChild(el)
          c.loaded = true
        }
        if (args[0] === "init") {
          const api = function (...inner: unknown[]) {
            push(api as unknown as { q?: unknown[] }, inner)
          } as ((...a: unknown[]) => void) & { q?: unknown[] }
          const namespace = args[1]
          if (typeof namespace === "string") {
            c.ns![namespace] = c.ns![namespace] || api
            push(c.ns![namespace] as unknown as { q?: unknown[] }, args)
            push(c as unknown as { q?: unknown[] }, ["initNamespace", namespace])
          } else {
            push(c as unknown as { q?: unknown[] }, args)
          }
          return
        }
        push(c as unknown as { q?: unknown[] }, args)
      } as NonNullable<typeof w.Cal>
      w.Cal = cal
    }

    const Cal = w.Cal!
    Cal("init", NS, { origin: "https://app.cal.com" })
    const ns = Cal.ns![NS]
    ns("inline", {
      elementOrSelector: "#onduty-cal",
      config: { layout: "month_view" },
      calLink: business.calLink,
    })
    ns("ui", {
      theme: "dark",
      hideEventTypeDetails: false,
      layout: "month_view",
      cssVarsPerTheme: {
        dark: { "cal-brand": "#b6f23e" },
        light: { "cal-brand": "#5f8a12" },
      },
    })

    // If nothing has mounted after a reasonable wait, show the fallback rather
    // than leaving an empty box on the page.
    const timer = setTimeout(() => {
      if (!document.querySelector("#onduty-cal iframe")) setFailed(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="book" className="scroll-mt-20 bg-brand-950 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">
          <CalendarCheck className="h-3.5 w-3.5" />
          Book a call
        </p>
        <h2 className="max-w-xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">{subcopy}</p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-brand-900">
          {failed ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm text-white/70">
                The calendar did not load. You can still book here:
              </p>
              <a
                href={business.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-3 text-sm font-semibold text-brand-950"
              >
                Open the booking page
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <div id="onduty-cal" className="min-h-[38rem] w-full" />
          )}
        </div>

        <p className="mt-5 text-xs text-white/40">
          Rather not use the calendar?{" "}
          <a href={`mailto:${business.email}`} className="underline hover:text-white/70">
            Email us
          </a>{" "}
          or talk to the agent on this page.
        </p>
      </div>
    </section>
  )
}
