import { NextResponse } from "next/server"

/**
 * Books the pickup on the real Cal.com calendar.
 *
 * Every failure returns HTTP 200 with ok:false and a plain-language message.
 * A non-2xx would surface to the agent as a tool error, and an agent that sees
 * an error is far more likely to improvise a confirmation than one that is
 * handed a sentence explaining what went wrong.
 */

const TZ = "America/New_York"

export async function POST(req: Request) {
  const key = process.env.CAL_API_KEY
  const eventTypeId = process.env.CAL_EVENT_TYPE_ID
  if (!key || !eventTypeId) {
    return NextResponse.json({ ok: false, message: "Booking is not configured yet." })
  }

  let body: Record<string, string> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: "No booking details received." })
  }

  const { start, name, email, phone, address } = body
  if (!start || !name || !email) {
    return NextResponse.json({
      ok: false,
      message: "Still need the time, the customer's name and their email before booking.",
    })
  }

  try {
    const r = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "cal-api-version": "2024-08-13",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        start,
        eventTypeId: Number(eventTypeId),
        attendee: { name, email, timeZone: TZ, phoneNumber: phone, language: "en" },
        metadata: {
          source: "Clean Rite website voice assistant",
          pickupAddress: address ?? "",
          phone: phone ?? "",
        },
      }),
      cache: "no-store",
    })

    const j = await r.json()
    if (!r.ok) {
      const reason = j?.error?.message ?? j?.message ?? "the calendar rejected it"
      return NextResponse.json({
        ok: false,
        message: `That slot could not be booked — ${reason}. Offer another time.`,
      })
    }

    const booked = j?.data?.start ?? start
    return NextResponse.json({
      ok: true,
      bookingId: j?.data?.uid ?? j?.data?.id ?? null,
      message: `Booked for ${new Date(booked).toLocaleString("en-US", {
        timeZone: TZ,
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}. Confirm this back to the customer.`,
    })
  } catch {
    return NextResponse.json({
      ok: false,
      message: "Could not reach the scheduler. Do not tell the customer it is booked.",
    })
  }
}
