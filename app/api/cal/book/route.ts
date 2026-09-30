import { NextResponse } from "next/server"

/**
 * Books the demo on the real Cal.com calendar.
 *
 * Replaces Retell's built-in `book_appointment_cal` for the same reason as the
 * availability route beside this one: that tool type is deprecated, and a
 * custom tool pointed here keeps the Cal.com key on the server.
 *
 * Every failure is HTTP 200 with ok:false and a sentence telling the agent what
 * to do next, including an explicit instruction not to claim success. An agent
 * handed a bare error is the one that invents a confirmation.
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
      message: "Booking is not configured. Take their details; do not say it is booked.",
    })
  }

  let body: Record<string, string> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: "No booking details received." })
  }

  const { start, name, email, phone, business_name, industry, notes } = body
  if (!start || !name || !email) {
    return NextResponse.json({
      ok: false,
      message: "Still need the time, their name and their email before booking.",
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
        // Whoever takes the call wants the context on the invite itself, not in
        // a separate log they have to go and find.
        metadata: {
          source: "ondutyagent.com voice agent",
          business: business_name ?? "",
          industry: industry ?? "",
          phone: phone ?? "",
          notes: notes ?? "",
        },
      }),
      cache: "no-store",
    })

    const j = await r.json()
    if (!r.ok) {
      const reason = j?.error?.message ?? j?.message ?? "the calendar rejected it"
      return NextResponse.json({
        ok: false,
        message: `That slot could not be booked — ${reason}. Offer another time. Do not say it is booked.`,
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
      })}. Confirm that back to them in plain words.`,
    })
  } catch {
    return NextResponse.json({
      ok: false,
      message: "Could not reach the scheduler. Take their details; do not say it is booked.",
    })
  }
}
