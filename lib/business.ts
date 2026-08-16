/**
 * SINGLE SOURCE OF TRUTH for every business fact on this site and in the voice agent.
 *
 * Everything the site renders — and the prompt the Retell agent is provisioned with
 * (see scripts/provision-retell.mjs) — reads from this file. Change it here, and the
 * page copy, the SEO tags, the click-to-call links and the AI agent all update together.
 *
 * Fields tagged `VERIFY` below could not be confirmed from a live source at build time
 * (ondutyagent.com was unreachable from the build environment). Confirm them before
 * going to production.
 */

export type Service = {
  name: string
  description: string
  price: string
  priceNote?: string
}

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
  /** Used in the SEO title: "{name} | {type} in {city}, {state}" */
  type: "AI Answering Service",
  tagline: "Your phone, always answered.",
  /** One sentence. Used for the meta description and the agent's self-introduction. */
  shortDescription:
    "OnDuty Agent builds AI voice receptionists that answer every call, book appointments and capture leads for local businesses — 24 hours a day.",

  // ------------------------------------------------------------------ contact
  /**
   * VERIFY — set the real business phone number in full E.164 form.
   * Leave as an empty string and every click-to-call CTA gracefully falls back
   * to "Talk to our AI agent" instead of rendering a dead tel: link.
   */
  phone: "",
  /** Human-readable version of `phone`, e.g. "(555) 123-4567". Optional. */
  phoneDisplay: "",
  email: "hello@ondutyagent.com", // VERIFY
  website: "https://ondutyagent.com",

  // ----------------------------------------------------------------- location
  /**
   * VERIFY — fill in to enable the embedded Google Map and the LocalBusiness
   * address schema. While `street` is empty the Location card renders as a
   * "we work with businesses anywhere" service-area block instead of a map,
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
  serviceArea: "Serving local businesses across the United States",

  // -------------------------------------------------------------------- hours
  hours: [
    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 2:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ] as DayHours[],

  /** The whole point of the product: the AI never closes. */
  afterHoursNote: "Your AI agent answers 24/7, including nights, weekends and holidays.",

  // ----------------------------------------------------------------------- cta
  cta: {
    /** Primary conversion action for this business. */
    label: "Book a Demo",
    /** Spoken by the voice agent and shown in the rotating launcher bubble. */
    spoken: "Would you like to book a demo?",
    /** What actually happens on the call. */
    goal: "book a 15-minute demo call",
  },

  // ------------------------------------------------------------------ services
  services: [
    {
      name: "AI Receptionist",
      description: "Answers every call in one ring. No hold music, no voicemail, no missed revenue.",
      price: "$297",
      priceNote: "per month",
    },
    {
      name: "Appointment Booking",
      description: "Checks your live calendar, offers real times and books the slot on the call.",
      price: "$397",
      priceNote: "per month",
    },
    {
      name: "Lead Qualification",
      description: "Screens every caller, captures the details that matter, routes the hot ones to you.",
      price: "$447",
      priceNote: "per month",
    },
    {
      name: "After-Hours Coverage",
      description: "Nights, weekends and holidays covered. Your competitors are sending callers to voicemail.",
      price: "$197",
      priceNote: "per month",
    },
    {
      name: "Talking Website",
      description: "A voice agent embedded on your site. Visitors talk, it answers, it books.",
      price: "$1,497",
      priceNote: "one-time build",
    },
    {
      name: "Custom Voice Agent",
      description: "Built around your scripts, your calendar and your CRM. Live in under two weeks.",
      price: "Custom",
      priceNote: "quoted per build",
    },
  ] as Service[],

  // ------------------------------------------------------------- why choose us
  differentiators: [
    {
      title: "Answers in one ring",
      description: "Every call picked up instantly, day or night.",
    },
    {
      title: "Books on the call",
      description: "Real calendar access, not a callback promise.",
    },
    {
      title: "Sounds human",
      description: "Natural conversation, not a phone tree.",
    },
    {
      title: "Live in two weeks",
      description: "Built, tested and launched on your number.",
    },
  ],

  // -------------------------------------------------------------- testimonials
  /**
   * VERIFY — replace with real, attributable customer reviews before launch.
   * Publishing invented testimonials is a legal and trust risk.
   */
  testimonials: [
    {
      quote: "We stopped losing after-hours calls in week one. It books straight into our calendar.",
      name: "Operations Manager",
      role: "Home services company",
    },
    {
      quote: "Callers genuinely cannot tell. It handles pricing questions better than our old service.",
      name: "Practice Owner",
      role: "Multi-location clinic",
    },
    {
      quote: "Setup took days, not months. It paid for itself in the first month of bookings.",
      name: "Founder",
      role: "Professional services firm",
    },
  ] as Testimonial[],

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

export const phoneHref = hasPhone ? `tel:${business.phone.replace(/[^\d+]/g, "")}` : null

export const phoneLabel =
  business.phoneDisplay.trim() || business.phone.trim() || null

export const cityState = [business.address.city, business.address.state]
  .filter(Boolean)
  .join(", ")

export const fullAddress = hasAddress
  ? [business.address.street, cityState, business.address.zip].filter(Boolean).join(", ")
  : null

/** "OnDuty Agent | AI Answering Service in Austin, TX" — falls back cleanly with no city. */
export const seoTitle = cityState
  ? `${business.name} | ${business.type} in ${cityState}`
  : `${business.name} | ${business.type}`

export const mapEmbedSrc = fullAddress
  ? `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`
  : null

export const mapLinkHref = fullAddress
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
  : null
