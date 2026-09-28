"use client"

import React, { useEffect } from "react"

import { business } from "@/lib/business"

/**
 * Booking as a popup, opened from any CTA on the site.
 *
 * Every CTA used to fall through to a mailto: link — "compose an email and
 * wait" is the highest-friction ending possible for a site whose whole argument
 * is that waiting loses business. Now the button opens a calendar over the page
 * and the visitor picks a slot without leaving.
 *
 * Availability comes from Google Calendar through Cal.com, so a busy slot is
 * never offered and nothing is kept in sync by hand.
 *
 * A popup rather than an embedded section, deliberately: a calendar sitting
 * open on the homepage asks people to commit before they have read anything,
 * and it takes a screenful of space on every page it appears on.
 */

const NS = "onduty"
const SRC = "https://app.cal.com/embed/embed.js"

type CalFn = ((...a: unknown[]) => void) & {
  q?: unknown[]
  ns?: Record<string, (...a: unknown[]) => void>
  loaded?: boolean
}

/**
 * Mount once, near the root. It installs Cal's loader and theme; after that any
 * element carrying `data-cal-link` opens the popup when clicked.
 */
export function CalPopupProvider() {
  useEffect(() => {
    const w = window as unknown as { Cal?: CalFn }

    // Cal's loader has to exist as a queueing stub BEFORE the script arrives,
    // because the script drains that queue on load. Appending the script first
    // and calling Cal() in onload leaves the init calls with nothing to queue
    // into, and the popup silently never opens.
    if (!w.Cal) {
      const push = (t: { q?: unknown[] }, args: unknown) => {
        t.q = t.q || []
        t.q.push(args)
      }
      w.Cal = function (...args: unknown[]) {
        const c = w.Cal!
        if (!c.loaded) {
          c.ns = {}
          c.q = c.q || []
          const el = document.createElement("script")
          el.src = SRC
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
      } as CalFn
    }

    const Cal = w.Cal!
    Cal("init", { origin: "https://app.cal.com" })
    Cal("ui", {
      theme: "dark",
      hideEventTypeDetails: false,
      layout: "month_view",
      cssVarsPerTheme: {
        dark: { "cal-brand": "#b6f23e" },
        light: { "cal-brand": "#5f8a12" },
      },
    })
  }, [])

  return null
}

/**
 * Props that turn any anchor into a popup trigger.
 *
 * Cal ships a delegated click handler for `data-cal-link`, but it does not fire
 * reliably here, so the modal is opened explicitly. The `data-cal-link` stays
 * on the element anyway — harmless, and it keeps working if their delegation
 * starts binding.
 *
 * The href is the real booking page, not "#". preventDefault only happens once
 * window.Cal exists, so a visitor whose script was blocked or who is offline
 * still gets taken somewhere they can book instead of clicking a dead button.
 */
export const calTriggerProps = {
  href: business.bookingUrl,
  "data-cal-link": business.calLink,
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
    const Cal = (window as unknown as { Cal?: CalFn }).Cal
    if (!Cal || !Cal.loaded) return
    e.preventDefault()
    Cal("modal", {
      calLink: business.calLink,
      // Theme has to ride on the modal's own config; the Cal("ui") call above
      // applies to embeds declared up front, not one opened on click.
      config: { layout: "month_view", theme: "dark" },
    })
  },
} as const
