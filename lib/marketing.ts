/**
 * The marketing side of the business.
 *
 * Deliberately positioned as the step *after* the receptionist rather than a
 * separate offering: the receptionist proves it can catch demand, and marketing
 * is how you create more of it. That order matters — a visitor who has already
 * decided to fix their phone is a far warmer lead for a website or SEO
 * engagement than a stranger arriving at an agency page.
 */

export type MarketingService = {
  name: string
  /** The problem, in the client's words. */
  problem: string
  description: string
  /** Concrete deliverables. Vague agency copy is why nobody trusts agencies. */
  includes: string[]
}

export const marketing = {
  eyebrow: "Marketing",
  heading: "Once the phone is handled, fill it.",
  subcopy:
    "An AI receptionist catches every call you already get. These are how you get more of them. Same team, same accountability — and because we built your phone system, we can prove which marketing actually produced a booking.",

  /** Why buying both from one place is genuinely better, not just convenient. */
  synergy: {
    heading: "The advantage of buying both.",
    points: [
      {
        title: "We can see the whole funnel",
        description:
          "Most agencies hand you a traffic report and hope. We answer the phone at the other end, so we can tell you which campaign produced a booked appointment — not just a click.",
      },
      {
        title: "No finger-pointing",
        description:
          "When leads are slow, the agency blames the phones and the answering service blames the ads. One team means one answer.",
      },
      {
        title: "Your site can talk",
        description:
          "Every site we build can carry the same voice agent that answers your phone, so a visitor at midnight gets a conversation instead of a contact form.",
      },
    ],
  },

  services: [
    {
      name: "Website Design & Build",
      problem: "Your site looks like it was built in 2014 and it doesn't book anyone.",
      description:
        "A fast, modern site built to turn visitors into booked appointments — not to win design awards. Optionally with the voice agent built in, so the site answers questions and books at any hour.",
      includes: [
        "Custom design, built mobile-first",
        "Booking flow wired to your calendar",
        "Optional embedded voice agent",
        "Technical SEO correct from day one",
        "Analytics and call tracking",
      ],
    },
    {
      name: "Local SEO & Google Business Profile",
      problem: "You're invisible in the map pack while your competitor sits at the top.",
      description:
        "The highest-intent channel there is: someone searching for what you do, near where you are, right now. We get you into the local three-pack and keep you there.",
      includes: [
        "Google Business Profile optimisation",
        "Local keyword and competitor research",
        "On-page SEO and service-area pages",
        "Citation cleanup and consistency",
        "Review generation strategy",
        "Monthly ranking and call reporting",
      ],
    },
  ] as MarketingService[],

  ctaHeading: "Let's look at your numbers first.",
  ctaSubcopy:
    "No pitch deck. We'll look at what you rank for, what your site does with the traffic it already gets, and whether marketing is even your bottleneck — sometimes it isn't.",

  metaTitle: "Website Design & Local SEO for Service Businesses | OnDuty Agent",
  metaDescription:
    "Websites that book appointments and local SEO that puts you in the map pack — from the team that also answers your phone, so we can prove which marketing produced a booking.",
  keywords: [
    "local SEO services",
    "website design for contractors",
    "Google Business Profile optimization",
    "website design for dentists",
    "local SEO for law firms",
    "service business marketing",
  ],
}
