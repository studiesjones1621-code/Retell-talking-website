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
  type: "AI Receptionist for HVAC Contractors",
  tagline: "Never miss another service call.",
  /** One sentence. Used for the meta description and the agent's self-introduction. */
  shortDescription:
    "OnDuty Agent is an AI receptionist built for HVAC contractors — it answers every service call, books jobs into your dispatch calendar and captures leads 24 hours a day.",

  /**
   * Who the voice agent is actually talking to. Callers here are prospective
   * customers (contractors), not the homeowners their own techs serve.
   */
  audience:
    "HVAC business owners, general managers and office managers evaluating an answering service for their own company",

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
  serviceArea: "Serving HVAC contractors across the United States",

  // -------------------------------------------------------------------- hours
  hours: [
    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 2:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ] as DayHours[],

  /** The whole point of the product: the AI never closes. */
  afterHoursNote:
    "Your AI receptionist answers 24/7 — nights, weekends, holidays and cold snaps.",

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
      name: "24/7 Call Answering",
      description: "Every service call answered in one ring. No voicemail, no lost job.",
      price: "$297",
      priceNote: "per month",
    },
    {
      name: "Job Booking",
      description: "Checks your dispatch calendar, offers real windows, books the job on the call.",
      price: "$397",
      priceNote: "per month",
    },
    {
      name: "Emergency Triage",
      description: "Sorts no-heat and no-cool emergencies from routine calls. Escalates fast.",
      price: "$447",
      priceNote: "per month",
    },
    {
      name: "After-Hours Overflow",
      description: "Picks up when your CSRs go home. Voicemail sends that homeowner to a competitor.",
      price: "$197",
      priceNote: "per month",
    },
    {
      name: "Talking Website",
      description: "A voice agent on your site. Homeowners talk, it answers, it books the visit.",
      price: "$1,497",
      priceNote: "one-time build",
    },
    {
      name: "Custom Voice Agent",
      description: "Built around your service areas, dispatch software and pricing. Live in two weeks.",
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
      title: "Books into dispatch",
      description: "Real calendar access, not a callback promise.",
    },
    {
      title: "Speaks HVAC",
      description: "Knows no-heat calls, tune-ups and maintenance plans.",
    },
    {
      title: "Live in two weeks",
      description: "On your existing number. No new hardware.",
    },
  ],

  // -------------------------------------------------------------- testimonials
  /**
   * Kept per the owner's instruction. Quotes are unattributed role-level
   * summaries rather than named customers — swap in named, verifiable reviews
   * when you have permission to publish them.
   */
  testimonials: [
    {
      quote: "We stopped losing after-hours calls in week one. It books straight into our calendar.",
      name: "Operations Manager",
      role: "Residential HVAC company",
    },
    {
      quote: "Callers genuinely cannot tell. It handles pricing questions better than our old service.",
      name: "Owner",
      role: "Heating & cooling contractor",
    },
    {
      quote: "Setup took days, not months. It paid for itself in the first month of bookings.",
      name: "Founder",
      role: "HVAC service company",
    },
  ] as Testimonial[],

  // --------------------------------------------------------------------- video
  /**
   * Demo video shown on the home page. Paste any normal YouTube link —
   * `youtu.be/ID`, `watch?v=ID`, `/embed/ID` and `/shorts/ID` all parse.
   * Set `url` to an empty string and the whole section disappears.
   */
  video: {
    url: "https://youtu.be/oTjgAVIQ1nE",
    eyebrow: "See it work",
    heading: "Watch the agent take a call.",
    subheading:
      "Two minutes. A real conversation, start to booked job — no slides, no script reading.",
    /** Shown to screen readers and used as the iframe title. */
    title: "OnDuty Agent demo",
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

// -------------------------------------------------------------------- video

/**
 * Pull the 11-character video id out of any common YouTube URL shape:
 * `youtu.be/ID`, `watch?v=ID`, `/embed/ID`, `/live/ID`, `/shorts/ID`.
 * Returns null for anything it does not recognise, which switches the
 * video section off rather than rendering a broken player.
 */
export function youTubeId(url: string): string | null {
  const match = url
    .trim()
    .match(/(?:youtu\.be\/|(?:v|vi|e|embed|shorts|live)\/|[?&]v=)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : null
}

export const videoId = youTubeId(business.video.url)
export const hasVideo = videoId !== null

/** youtube-nocookie keeps the tracking cookie off the page until playback starts. */
export const videoEmbedSrc = videoId
  ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
  : null

export const videoWatchHref = videoId ? `https://www.youtube.com/watch?v=${videoId}` : null

/** maxres is not generated for every upload — the component falls back to hq on error. */
export const videoThumbnails = videoId
  ? {
      max: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      fallback: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    }
  : null
