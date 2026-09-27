import { NextResponse } from "next/server"

/**
 * Called by the voice agent mid-conversation to get real open pickup slots.
 *
 * The Cal.com key stays on the server: Retell only ever sees this URL, so
 * rotating the key means changing one environment variable rather than editing
 * a tool inside Retell.
 */

const TZ = "America/New_York"

export async function POST(req: Request) {
  const key = process.env.CAL_API_KEY
  const eventTypeId = process.env.CAL_EVENT_TYPE_ID
  if (!key || !eventTypeId) {
    return NextResponse.json(
      { ok: false, message: "Scheduling is not configured yet." },
      { status: 200 },
    )
  }

  let date: string | undefined
  try {
    date = (await req.json())?.date
  } catch {
    /* an empty body just means "next available" */
  }

  const start = date ?? new Date().toISOString().slice(0, 10)
  // Cal's window is exclusive of the end date, so ask for the following day too
  // and the caller still gets a full day of slots for `start`.
  const end = new Date(new Date(`${start}T00:00:00Z`).getTime() + 864e5)
    .toISOString()
    .slice(0, 10)

  const url =
    `https://api.cal.com/v2/slots?eventTypeId=${eventTypeId}` +
    `&start=${start}&end=${end}&timeZone=${encodeURIComponent(TZ)}`

  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${key}`, "cal-api-version": "2024-09-04" },
      cache: "no-store",
    })
    const j = await r.json()
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, message: "Could not reach the scheduler." },
        { status: 200 },
      )
    }

    const byDay: Record<string, { start: string }[]> = j?.data ?? {}

    // Cal's start/end window is interpreted in UTC, so a request for the 29th
    // comes back including the 28th at 8pm Eastern. Keep only slots whose
    // New York calendar date is the one that was actually asked for, or the
    // agent offers the customer the wrong evening.
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

    // Space the options out rather than handing back four slots fifteen minutes
    // apart — the agent reads these aloud and near-identical times are useless.
    const spaced = all.filter((_, i) => i % 8 === 0).slice(0, 3)
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
        ? "Read these times back to the customer and let them pick one."
        : "No open slots on that date. Offer another day.",
    })
  } catch {
    return NextResponse.json(
      { ok: false, message: "Could not reach the scheduler." },
      { status: 200 },
    )
  }
}
