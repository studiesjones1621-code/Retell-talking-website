import { NextResponse } from "next/server"

/**
 * Real open demo slots, for the sales agent to read back mid-call.
 *
 * This exists to replace Retell's built-in `check_availability_cal`. That tool
 * type is deprecated — Retell stops accepting it, and the integration meant to
 * replace it can only be attached from their dashboard. A custom tool pointed
 * at this route has no deprecation clock and keeps the Cal.com key server-side,
 * so rotating the key is one environment variable rather than an edit inside
 * Retell.
 *
 * Failures return HTTP 200 with ok:false and a sentence the agent can act on.
 * A non-2xx reaches the agent as a tool error, and an agent looking at an error
 * improvises far more readily than one handed a plain explanation.
 */

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TZ = "America/New_York"

export async function POST(req: Request) {
  const key = process.env.CAL_API_KEY
  const eventTypeId = process.env.CAL_EVENT_TYPE_ID
  if (!key || !eventTypeId) {
    return NextResponse.json({
      ok: false,
      message: "Scheduling is not configured. Take their name and email instead.",
    })
  }

  let date: string | undefined
  try {
    date = (await req.json())?.date
  } catch {
    /* an empty body just means "whatever is next" */
  }

  const start = date ?? new Date().toISOString().slice(0, 10)
  // Cal's window excludes the end date, so ask for the next day as well or the
  // requested day comes back short.
  const end = new Date(new Date(`${start}T00:00:00Z`).getTime() + 864e5)
    .toISOString()
    .slice(0, 10)

  try {
    const r = await fetch(
      `https://api.cal.com/v2/slots?eventTypeId=${eventTypeId}` +
        `&start=${start}&end=${end}&timeZone=${encodeURIComponent(TZ)}`,
      {
        headers: { Authorization: `Bearer ${key}`, "cal-api-version": "2024-09-04" },
        cache: "no-store",
      },
    )
    if (!r.ok) {
      return NextResponse.json({
        ok: false,
        message: "Could not reach the scheduler. Offer to email them instead.",
      })
    }

    const byDay: Record<string, { start: string }[]> = (await r.json())?.data ?? {}

    // Cal interprets the start/end window in UTC, so asking for the 29th also
    // returns the 28th at 8pm Eastern. Keep only slots whose New York calendar
    // date is the one actually asked for, or the agent offers the wrong evening.
    const localDate = (iso: string) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(iso))

    const all = Object.values(byDay)
      .flat()
      .map((s) => s.start)
      .filter((iso) => localDate(iso) === start)
      .sort()

    // Spread the options out. Three slots twenty minutes apart are useless read
    // aloud — the caller cannot tell them apart and picks none.
    const spaced = all.filter((_, i) => i % 6 === 0).slice(0, 3)
    const offered = spaced.length ? spaced : all.slice(0, 3)

    return NextResponse.json({
      ok: true,
      date: start,
      timezone: TZ,
      slots: offered.map((iso) => ({
        start: iso,
        spoken: new Date(iso).toLocaleString("en-US", {
          timeZone: TZ,
          weekday: "long",
          hour: "numeric",
          minute: "2-digit",
        }),
      })),
      message: offered.length
        ? "Read at most these three back and let them choose one."
        : "Nothing open that day. Offer another date.",
    })
  } catch {
    return NextResponse.json({
      ok: false,
      message: "Could not reach the scheduler. Offer to email them instead.",
    })
  }
}
