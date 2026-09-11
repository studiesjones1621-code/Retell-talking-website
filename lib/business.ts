/**
 * SHARED brand facts — the things that are true no matter which niche page a
 * visitor lands on.
 *
 * Anything that changes per industry (headline, services, proof, video, and the
 * voice agent's audience) lives in `lib/niches.ts` instead. Marketing-side
 * services live in `lib/marketing.ts`. Between the three, every word on the site
 * and every line of the agent prompt is editable without touching a component.
 *
 * Fields tagged `VERIFY` could not be confirmed from a live source at build time
 * (ondutyagent.com was unreachable from the build environment). Confirm them
 * before going to production.
 */

export type Testimonial = {
  quote: string
  name: string
  role: string
}

export type DayHours = {
  day: string
  hours: string
}

export const business = {
  // ---------------------------------------------------------------- identity
  name: "OnDuty Agent",
  legalName: "OnDuty Agent",
  /** Used in the SEO title on the general pages. Niche pages set their own. */
  type: "AI Receptionist & Growth Partner for Local Business",
  tagline: "Never miss another call.",
  /** One sentence. Meta description for the general pages. */
  shortDescription:
    "OnDuty Agent builds AI receptionists that answer every call, book the appointment and capture the lead 24 hours a day — for HVAC companies, law firms, dental practices, med spas and behavioral health providers.",

  // ------------------------------------------------------------------ contact
  /**
   * VERIFY — set the real business phone in full E.164 form.
   * Left empty, every click-to-call CTA falls back to the voice agent rather
   * than rendering a dead tel: link.
   */
  phone: "",
  /** Human-readable version of `phone`, e.g. "(555) 123-4567". Optional. */
  phoneDisplay: "",
  email: "hello@ondutyagent.com", // VERIFY
  website: "https://ondutyagent.com",

  /**
   * VERIFY — public booking link (Cal.com, Calendly, etc). Every CTA on the site
   * is a book-a-call CTA, so this is the single highest-value field in this file.
   * While it is empty the buttons fall back to opening the voice agent, which
   * can still book — but a direct link converts better for visitors who would
   * rather not talk.
   */
  bookingUrl: "",

  // ----------------------------------------------------------------- location
  /**
   * VERIFY — fill in to enable the embedded map and the address schema. While
   * `street` is empty the Location card renders a service-area block instead,
   * so nothing ever points at the wrong pin.
   */
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
    /** IANA timezone — used by the agent when quoting and booking times. */
    timezone: "America/New_York",
  },

  /** Shown when no street address is set. */
  serviceArea: "Working with practices and contractors across the United States",

  // -------------------------------------------------------------------- hours
  hours: [
    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 2:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ] as DayHours[],

  /** The whole point of the product: the AI never closes. */
  afterHoursNote:
    "Those are our office hours. Your AI receptionist keeps its own — 24/7, nights, weekends and holidays included.",

  // ----------------------------------------------------------------------- cta
  cta: {
    label: "Book a Demo",
    /** Spoken by the voice agent and shown in the rotating launcher bubble. */
    spoken: "Would you like to book a demo?",
    goal: "book a 15-minute demo call",
  },

  // --------------------------------------------------------------------- brand
  social: {
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
  },
} as const

// ----------------------------------------------------------------- derived helpers

export const hasPhone = business.phone.trim().length > 0
export const hasAddress = business.address.street.trim().length > 0
export const hasBooking = business.bookingUrl.trim().length > 0

export const phoneHref = hasPhone ? `tel:${business.phone.replace(/[^\d+]/g, "")}` : null

export const phoneLabel = business.phoneDisplay.trim() || business.phone.trim() || null

export const cityState = [business.address.city, business.address.state]
  .filter(Boolean)
  .join(", ")

export const fullAddress = hasAddress
  ? [business.address.street, cityState, business.address.zip].filter(Boolean).join(", ")
  : null

/** Falls back cleanly with no city configured. */
export const seoTitle = cityState
  ? `${business.name} | ${business.type} in ${cityState}`
  : `${business.name} | ${business.type}`

export const mapEmbedSrc = fullAddress
  ? `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`
  : null

export const mapLinkHref = fullAddress
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
  : null

// -------------------------------------------------------------------- video

export type VideoConfig = {
  url: string
  eyebrow: string
  heading: string
  subheading: string
  /** Read to screen readers and used as the iframe title. */
  title: string
}

/**
 * Pull the 11-character video id out of any common YouTube URL shape:
 * `youtu.be/ID`, `watch?v=ID`, `/embed/ID`, `/live/ID`, `/shorts/ID`.
 * Returns null for anything unrecognised, which switches the video section
 * off rather than rendering a broken player.
 */
export function youTubeId(url: string): string | null {
  const match = url
    .trim()
    .match(/(?:youtu\.be\/|(?:v|vi|e|embed|shorts|live)\/|[?&]v=)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : null
}

/** youtube-nocookie keeps the tracking cookie off the page until playback starts. */
export function videoEmbedSrc(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
}

export function videoWatchHref(id: string) {
  return `https://www.youtube.com/watch?v=${id}`
}

/** maxres is not generated for every upload — the player falls back to hq on error. */
export function videoThumbnails(id: string) {
  return {
    max: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    fallback: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  }
}
