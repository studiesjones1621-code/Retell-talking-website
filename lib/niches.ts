/**
 * Per-industry content. One entry here produces one fully-formed landing page
 * at `/{slug}`, its SEO tags, and the audience section of the voice agent's
 * prompt. Adding a sixth niche means adding an object to this array — no new
 * component, route or template.
 *
 * Two things deliberately differ from a generic landing-page config:
 *
 *  - `agentGuardrail` exists because the people calling *us* run these
 *    businesses; they are not the end customer. Without a per-niche guardrail
 *    the agent cheerfully tries to book a root canal for someone who called to
 *    ask about buying a receptionist.
 *
 *  - `compliance` drives what the page is allowed to claim. See the note on
 *    `ComplianceProfile` before editing that copy.
 */

import type { Testimonial, VideoConfig } from "./business"

/**
 * What the site may truthfully say about handling regulated information.
 *
 * The healthcare niches run on `HIPAA_BAA`: a Business Associate Agreement is
 * signed with the voice infrastructure provider, so protected health
 * information may lawfully flow through the agents we build for clients.
 *
 * Note what this copy deliberately does NOT say: "HIPAA compliant", flat. That
 * phrase is unverifiable, every competitor claims it, and compliance is a
 * property of the whole arrangement — our safeguards, the client's, and a BAA
 * at each hop — not of one signed agreement. The specific controls below are
 * both true and far more convincing to the person who actually evaluates this,
 * who is usually a practice administrator with a checklist.
 *
 * >>> BEFORE STRENGTHENING THIS FURTHER <<<
 * Any blanket compliance badge needs all of: BAAs executed downstream with
 * client practices, a documented Security Rule risk analysis, written policies
 * and workforce training, breach notification procedures, and a BAA with EVERY
 * subprocessor that touches PHI — the booking calendar included, since patient
 * names and visit reasons land there too.
 */
export type ComplianceProfile = {
  /** Short label on the trust strip. */
  label: string
  /** One or two sentences. Must describe what is TRUE today. */
  detail: string
  /**
   * Named, checkable controls. A vague assurance convinces nobody who has been
   * burned; a list someone can take to their compliance officer does.
   */
  controls?: { title: string; description: string }[]
}

const HIPAA_BAA: ComplianceProfile = {
  label: "PHI handled under a signed BAA",
  detail:
    "A Business Associate Agreement is in place with the voice infrastructure your agent runs on, and we sign one with your practice too. So the agent can take what it genuinely needs to book the appointment, rather than dancing around it — and you can show your compliance officer exactly where the data goes.",
  controls: [
    {
      title: "You choose what is stored",
      description:
        "Per agent: full transcripts and recordings, PII excluded, or basic call attributes only.",
    },
    {
      title: "You choose how long",
      description:
        "Retention is set per agent, anywhere from a single day to two years. Not one blanket default you inherit.",
    },
    {
      title: "Recordings are not just sitting on a URL",
      description:
        "Access to call recordings goes through signed, expiring links rather than a guessable address.",
    },
    {
      title: "A BAA with you, not just upstream",
      description:
        "We execute a Business Associate Agreement with your practice before a single call is taken.",
    },
  ],
}

const NO_LEGAL_ADVICE: ComplianceProfile = {
  label: "Never gives legal advice",
  detail:
    "The agent captures who is calling, what kind of matter it is and when they are free — then books the consultation. It does not answer substantive legal questions, quote outcomes or discuss case merits, so nothing it says can be mistaken for advice from your firm.",
  controls: [
    {
      title: "Screens, never advises",
      description:
        "Practice area, jurisdiction and timeline. No opinion on the caller's matter, under any framing.",
    },
    {
      title: "Privileged detail stays with you",
      description:
        "Intake summaries carry what your team needs to run a conflict check, and nothing it was not asked for.",
    },
  ],
}

export type NicheService = {
  name: string
  description: string
}

export type Niche = {
  /** URL segment. Keep it keyword-shaped — it is the page's strongest SEO signal. */
  slug: string
  /** Full audience name, e.g. "HVAC Contractors". Used in headings and schema. */
  name: string
  /** Short form for nav and chips, e.g. "HVAC". */
  shortName: string

  // ------------------------------------------------------------------- hero
  eyebrow: string
  /** The h1. Make it about their pain, not your product. */
  headline: string
  subcopy: string
  proofPoints: [string, string, string]

  // ---------------------------------------------------------------- sections
  servicesHeading: string
  servicesSubcopy: string
  services: NicheService[]

  differentiatorsHeading: string
  differentiatorsSubcopy: string
  differentiators: { title: string; description: string }[]

  ctaHeading: string
  ctaSubcopy: string

  /** Null until real, attributable reviews exist. Section hides itself when empty. */
  testimonials: Testimonial[]

  /** Null when no video has been shot for this niche — the section disappears. */
  video: VideoConfig | null

  /**
   * Optional hero photograph, as a path under `public/` (e.g.
   * "/images/hero-dental.jpg"). Null falls back to the gradient-and-grid
   * treatment, so a niche without a photo still looks deliberate rather than
   * unfinished. The image is darkened and the text sits on a scrim, so choose
   * for composition and mood rather than detail — anything busy behind the
   * headline will fight it.
   */
  heroImage: string | null

  /** Null for unregulated niches. Renders a trust strip when present. */
  compliance: ComplianceProfile | null

  // ------------------------------------------------------------- voice agent
  /** Who the agent is talking to on this page. */
  audience: string
  /** Who the caller is NOT, and what to do if the wrong person calls. */
  agentGuardrail: string

  // -------------------------------------------------------------------- seo
  metaTitle: string
  metaDescription: string
  keywords: string[]
}

export const niches: Niche[] = [
  // ------------------------------------------------------------------- HVAC
  {
    slug: "hvac",
    name: "HVAC Contractors",
    shortName: "HVAC",
    eyebrow: "For HVAC contractors",
    headline: "A missed call is a lost job.",
    subcopy:
      "Your AI receptionist answers every service call in one ring, sorts the no-heat emergencies from the tune-ups, and books the job into dispatch — at 2 a.m. on a Sunday if that is when the furnace dies.",
    proofPoints: ["Answers in one ring", "Books into dispatch", "Live in two weeks"],

    servicesHeading: "Every service call handled.",
    servicesSubcopy:
      "Most contractors miss a third of their calls. Here is what stops happening once the agent is on.",
    services: [
      {
        name: "24/7 Call Answering",
        description:
          "Every service call answered on the first ring. No voicemail, no hold music, no homeowner dialing the next contractor on the list.",
      },
      {
        name: "Job Booking",
        description:
          "Checks your dispatch calendar, offers real arrival windows and books the job while the homeowner is still on the phone.",
      },
      {
        name: "Emergency Triage",
        description:
          "Separates a no-heat call in January from a routine maintenance request, and escalates the ones that cannot wait until morning.",
      },
      {
        name: "After-Hours Overflow",
        description:
          "Picks up the moment your CSRs go home. Every call that would have hit voicemail becomes a booked job instead.",
      },
      {
        name: "Live Transfer When It Matters",
        description:
          "Trained on your roster, so it knows who handles what. A gas smell, a commercial account down, a callback on a job already open — it puts those straight through to whoever is on call instead of taking a message.",
      },
      {
        name: "The Job Sheet, Filled Out For You",
        description:
          "Captures make, model, symptom, history and access notes on the call, then sends a completed write-up to dispatch and the assigned tech. They roll knowing what they are walking into, instead of phoning the customer back to ask.",
      },
    ],

    differentiatorsHeading: "Built for how HVAC actually runs.",
    differentiatorsSubcopy:
      "Generic answering services take a message. This one does the job your front desk does.",
    differentiators: [
      { title: "Speaks HVAC", description: "Knows no-heat calls, tune-ups, SEER ratings and maintenance plans." },
      { title: "Books into dispatch", description: "Real calendar access, not a callback promise." },
      { title: "Handles the 2 a.m. call", description: "Peak season does not have office hours." },
      { title: "Live in two weeks", description: "On your existing number. No new hardware." },
    ],

    ctaHeading: "Stop missing jobs today.",
    ctaSubcopy:
      "Talk to the agent on this page — it is the same one that would answer your phone.",

    testimonials: [],

    heroImage: null,
    video: {
      url: "https://youtu.be/oTjgAVIQ1nE",
      eyebrow: "See it work",
      heading: "Watch the agent take a call.",
      subheading:
        "A real conversation, start to booked job — no slides, no script reading.",
      title: "OnDuty Agent — HVAC demo",
    },

    compliance: null,

    audience:
      "HVAC business owners, general managers and office managers evaluating an answering service for their own company",
    agentGuardrail:
      "Callers run HVAC companies — they are not homeowners with a broken furnace. If someone calls with an actual heating or cooling problem at their home, tell them warmly that you are the assistant for a company that provides answering services *to* HVAC contractors, and that they will want to call their own local contractor.",

    metaTitle: "AI Receptionist for HVAC Contractors | 24/7 Call Answering & Job Booking",
    metaDescription:
      "An AI receptionist built for HVAC companies. Answers every service call in one ring, triages no-heat emergencies and books jobs into your dispatch calendar — 24/7.",
    keywords: [
      "HVAC answering service",
      "AI receptionist for HVAC",
      "HVAC call answering",
      "HVAC virtual receptionist",
      "after hours HVAC answering service",
      "HVAC dispatch booking",
    ],
  },

  // -------------------------------------------------------------- law firms
  {
    slug: "law-firms",
    name: "Law Firms",
    shortName: "Law Firms",
    eyebrow: "For law firms",
    headline: "The case goes to whoever answers.",
    subcopy:
      "Potential clients call three firms and retain the first one that picks up. Your AI receptionist answers every one of them, screens the matter, and books the consultation before your competitor's voicemail beeps.",
    proofPoints: ["Answers every intake call", "Screens by practice area", "Books the consultation"],

    servicesHeading: "Intake that never goes to voicemail.",
    servicesSubcopy:
      "The average firm misses a third of its intake calls. Each one was a signed matter somewhere else.",
    services: [
      {
        name: "24/7 Intake",
        description:
          "Accident calls come in at night and on weekends. The agent answers all of them with the same patience as your best intake coordinator.",
      },
      {
        name: "Matter Screening",
        description:
          "Qualifies by practice area, jurisdiction and timeline, so partners only see the calls that are actually worth their hour.",
      },
      {
        name: "Consultation Booking",
        description:
          "Checks the attorney's calendar and books the consult on the call — while the caller is still motivated.",
      },
      {
        name: "Conflict-Check Prep",
        description:
          "Captures opposing-party and matter details in a clean summary so your team can run the conflict check before the meeting.",
      },
      {
        name: "Transfers to the Right Person",
        description:
          "Trained on who does what at your firm. Urgent matters and existing clients go straight to the attorney or intake coordinator you nominate, rather than into a callback queue.",
      },
      {
        name: "A Completed Intake, Not a Message",
        description:
          "Works through your intake questions on the call — contact details, matter type, key dates, opposing parties, how they found you — and routes the finished sheet to the attorney or coordinator who should see it. They return the call already knowing the matter.",
      },
    ],

    differentiatorsHeading: "Careful about what it says.",
    differentiatorsSubcopy:
      "An intake line for a law firm has to be disciplined. This one is built that way on purpose.",
    differentiators: [
      { title: "Never gives legal advice", description: "It captures and books. It does not opine on your caller's matter." },
      { title: "Screens before it books", description: "Wrong jurisdiction and wrong practice area get filtered out early." },
      { title: "Calm with distressed callers", description: "People call lawyers on the worst day of their year." },
      { title: "Clean intake summaries", description: "Every call arrives written up, not as a two-line message." },
    ],

    ctaHeading: "Stop losing cases to voicemail.",
    ctaSubcopy:
      "Talk to the agent on this page — it is the same one that would handle your intake.",

    testimonials: [],
    heroImage: null,
    video: null,
    compliance: NO_LEGAL_ADVICE,

    audience:
      "managing partners, attorneys and firm administrators evaluating an intake and answering service for their own firm",
    agentGuardrail:
      "Callers run or work at law firms — they are not people seeking a lawyer. If someone calls needing legal help, tell them warmly that you are the assistant for a company that builds intake services *for* law firms, and that they will want to contact a firm directly. Never give legal advice of any kind, to anyone, under any framing.",

    metaTitle: "AI Receptionist for Law Firms | 24/7 Legal Intake & Consultation Booking",
    metaDescription:
      "An AI intake receptionist built for law firms. Answers every potential-client call, screens by practice area and jurisdiction, and books consultations 24/7. Never gives legal advice.",
    keywords: [
      "legal intake service",
      "AI receptionist for law firms",
      "law firm answering service",
      "24/7 legal intake",
      "attorney virtual receptionist",
      "law firm call answering",
    ],
  },

  // ----------------------------------------------------------------- dental
  {
    slug: "dental",
    name: "Dental Practices",
    shortName: "Dental",
    eyebrow: "For dental practices",
    headline: "Your front desk is already busy.",
    subcopy:
      "Every call that rings out while your team is chairside is a new patient who books somewhere else. Your AI receptionist answers all of them, fills the cancellation, and books the appointment straight into your schedule.",
    proofPoints: ["Answers while you're chairside", "Fills cancellations", "Books 24/7"],

    servicesHeading: "Every call answered, every chair filled.",
    servicesSubcopy:
      "Front desks miss calls for good reasons. The schedule does not care about the reason.",
    services: [
      {
        name: "24/7 Appointment Booking",
        description:
          "Checks your practice-management schedule and books the appointment on the call, including evenings and weekends.",
      },
      {
        name: "New Patient Capture",
        description:
          "Takes a name, a callback number and the reason for the visit, then books — the highest-value call your practice gets, never sent to voicemail.",
      },
      {
        name: "Recall & Rescheduling",
        description:
          "Handles the reschedule calls that eat your front desk's morning, and offers the open slot a cancellation just created.",
      },
      {
        name: "After-Hours Emergency Routing",
        description:
          "Recognises a dental emergency and follows your on-call protocol instead of leaving a message nobody hears until Monday.",
      },
      {
        name: "Transfers to Your Team",
        description:
          "Trained on your staff and who covers what. An anxious patient, a question only the doctor can answer, a case that needs the treatment coordinator — the agent hands the call over rather than taking a message.",
      },
      {
        name: "New Patient Forms, Already Filled In",
        description:
          "Takes the new-patient details on the call — contact, carrier and plan, reason for the visit — and hands your front desk a completed record rather than a name on a message pad. Remaining forms go out by text straight after.",
      },
    ],

    differentiatorsHeading: "Designed around a busy operatory.",
    differentiatorsSubcopy: "It does the front-desk job, without adding to the front desk's workload.",
    differentiators: [
      { title: "Never puts a patient on hold", description: "Every caller gets a person-shaped answer immediately." },
      { title: "Books into your schedule", description: "Real availability, not a callback promise." },
      { title: "Handles PHI properly", description: "Under a signed BAA, with retention and storage set by you." },
      { title: "Works past closing", description: "Most new-patient calls come in outside office hours." },
    ],

    ctaHeading: "Stop sending new patients to voicemail.",
    ctaSubcopy: "Talk to the agent on this page — it is the same one that would answer your front desk.",

    testimonials: [],
    heroImage: null,
    video: null,
    compliance: HIPAA_BAA,

    audience:
      "dentists, practice owners and office managers evaluating a receptionist service for their own practice",
    agentGuardrail:
      "Callers run dental practices — they are not patients with toothache. If someone calls needing dental treatment, tell them warmly that you are the assistant for a company that provides receptionist services *to* dental practices, and that they should contact their own dentist. Never collect or discuss any caller's medical or dental history.",

    metaTitle: "AI Receptionist for Dental Practices | 24/7 Appointment Booking",
    metaDescription:
      "An AI receptionist built for dental practices. Answers every call while your team is chairside, fills cancellations and books new patients 24/7 — without collecting PHI.",
    keywords: [
      "dental answering service",
      "AI receptionist for dentists",
      "dental appointment booking service",
      "dental office virtual receptionist",
      "24/7 dental call answering",
      "new patient phone calls dental",
    ],
  },

  // ---------------------------------------------------------------- med spa
  {
    slug: "medspa",
    name: "Med Spas",
    shortName: "Med Spas",
    eyebrow: "For med spas & aesthetic clinics",
    headline: "They booked at 11 p.m. Someone had to answer.",
    subcopy:
      "Aesthetic enquiries arrive late, from a phone, on impulse — and go cold by morning. Your AI receptionist answers in that moment, talks them through your treatment menu, and books the consultation before the impulse fades.",
    proofPoints: ["Answers the 11 p.m. enquiry", "Knows your treatment menu", "Books the consult"],

    servicesHeading: "Catch the enquiry while it's warm.",
    servicesSubcopy:
      "Aesthetic demand is impulsive. A callback tomorrow is a booking you already lost.",
    services: [
      {
        name: "Consultation Booking",
        description:
          "Books the consult directly into your calendar at the moment of interest, day or night.",
      },
      {
        name: "Treatment Enquiries",
        description:
          "Answers questions about the treatments you offer, what is involved and what to expect — straight from your own service menu.",
      },
      {
        name: "After-Hours Capture",
        description:
          "The majority of aesthetic enquiries land outside business hours. The agent treats 11 p.m. exactly like 11 a.m.",
      },
      {
        name: "Rebooking & No-Show Recovery",
        description:
          "Follows up on cancellations and gaps so an empty room becomes a filled appointment.",
      },
      {
        name: "Transfers to Your Team",
        description:
          "Trained on your providers and what each one treats. Clinical questions about a treatment go to a person who can actually answer them, never to an agent guessing.",
      },
      {
        name: "The Consult Sheet, Ready Before They Arrive",
        description:
          "Collects what the consult needs on the call — what they are interested in, what they have had done, carrier details where relevant — and routes it to the provider. Consent forms, which need a signature, go out by text straight after.",
      },
    ],

    differentiatorsHeading: "It sounds like your clinic.",
    differentiatorsSubcopy: "Aesthetics is a discretionary purchase. The first impression is the sale.",
    differentiators: [
      { title: "Warm, never pushy", description: "Discretionary purchases do not respond to pressure." },
      { title: "Knows your menu", description: "Trained on the treatments you actually offer." },
      { title: "Discreet by design", description: "Asks what the booking needs, nothing more — and stores only what you allow." },
      { title: "Always awake", description: "Impulse enquiries do not wait for opening time." },
    ],

    ctaHeading: "Stop losing the late-night enquiry.",
    ctaSubcopy: "Talk to the agent on this page — it is the same one that would answer your clinic.",

    testimonials: [],
    heroImage: null,
    video: null,
    compliance: HIPAA_BAA,

    audience:
      "med spa owners, clinic directors and practice managers evaluating a receptionist service for their own clinic",
    agentGuardrail:
      "Callers run med spas or aesthetic clinics — they are not clients seeking treatment. If someone calls asking about getting a treatment themselves, tell them warmly that you are the assistant for a company that provides receptionist services *to* clinics, and that they should contact a clinic directly. Never give medical or cosmetic treatment advice.",

    metaTitle: "AI Receptionist for Med Spas | 24/7 Consultation Booking",
    metaDescription:
      "An AI receptionist built for med spas and aesthetic clinics. Answers late-night enquiries, explains your treatment menu and books consultations 24/7.",
    keywords: [
      "med spa answering service",
      "AI receptionist for med spa",
      "aesthetic clinic booking service",
      "medspa virtual receptionist",
      "24/7 med spa call answering",
      "medical spa lead capture",
    ],
  },

  // ----------------------------------------------------- behavioral health
  {
    slug: "behavioral-health",
    name: "Behavioral Health Providers",
    shortName: "Behavioral Health",
    eyebrow: "For behavioral health providers",
    headline: "Someone finally worked up the courage to call.",
    subcopy:
      "It can take months for a person to make that call, and one voicemail to undo it. Your AI receptionist answers with patience every time, recognises a crisis when it hears one, and books the intake appointment.",
    proofPoints: ["Answers with patience", "Crisis-aware routing", "Books the intake"],

    servicesHeading: "Answer the call that took months to make.",
    servicesSubcopy:
      "In behavioral health, the cost of a missed call is not a lost booking. It is a person who does not try again.",
    services: [
      {
        name: "24/7 Intake Line",
        description:
          "Answers every call with the same unhurried patience, at any hour, without the caller ever hitting a queue.",
      },
      {
        name: "Crisis Recognition & Routing",
        description:
          "Trained to notice crisis language and respond immediately — surfacing the 988 Suicide & Crisis Lifeline and following your on-call protocol rather than continuing a booking flow.",
      },
      {
        name: "New Client Scheduling",
        description:
          "Books the intake appointment into your calendar while the person is still on the phone and still ready.",
      },
      {
        name: "Availability & Insurance Questions",
        description:
          "Answers general questions about whether you are accepting clients and which plans you take — without collecting clinical detail.",
      },
      {
        name: "Warm Transfer to Your On-Call Clinician",
        description:
          "Trained on your team and your escalation protocol. When that protocol says a person should take this call, the agent hands it over warmly and stays on the line until someone picks up — no queue, no callback promise, no starting over.",
      },
      {
        name: "A Completed Intake, Before the Callback",
        description:
          "Works through your intake questions on the call — contact details, carrier and plan, what is going on in general terms, when they are free, who referred them — and routes the finished intake to the clinician or coordinator who should see it. They call back already knowing who this is and whether you take the plan, instead of starting from a name and number. Formal screening instruments still belong to your clinicians.",
      },
    ],

    differentiatorsHeading: "Built with the stakes in mind.",
    differentiatorsSubcopy:
      "This is the niche where a generic answering bot is genuinely the wrong tool. Here is what is different.",
    differentiators: [
      { title: "Crisis protocol first", description: "Distress signals stop the booking flow and surface 988 immediately." },
      { title: "Never rushes a caller", description: "No hold music, no queue, no scripted pace." },
      { title: "You set the collection line", description: "Take an intake or take a name — and clinical depth still waits for a clinician." },
      { title: "Warm handoff to on-call", description: "Follows your escalation protocol, not a generic one." },
    ],

    ctaHeading: "Make sure the next call gets answered.",
    ctaSubcopy: "Talk to the agent on this page — it is the same one that would answer your line.",

    testimonials: [],
    heroImage: null,
    video: null,
    compliance: HIPAA_BAA,

    audience:
      "practice owners, clinical directors and office managers at behavioral health practices evaluating an intake service for their own practice",
    agentGuardrail:
      "Callers run behavioral health practices — they are not people seeking care. If someone calls seeking treatment for themselves, respond with warmth, tell them you are the assistant for a company that provides intake services *to* practices, and point them toward their provider or the 988 Suicide & Crisis Lifeline. Never provide clinical advice, never attempt to counsel, and never collect clinical detail.",

    metaTitle: "AI Receptionist for Behavioral Health | 24/7 Intake & Crisis-Aware Routing",
    metaDescription:
      "An AI intake receptionist built for behavioral health providers. Answers every call with patience, recognises crisis language and routes to 988, and books intake appointments 24/7.",
    keywords: [
      "behavioral health answering service",
      "mental health practice intake service",
      "AI receptionist for therapists",
      "therapy practice virtual receptionist",
      "24/7 behavioral health intake",
      "counseling practice call answering",
    ],
  },
]

// ------------------------------------------------------------------ helpers

export const nicheSlugs = niches.map((n) => n.slug)

export function getNiche(slug: string): Niche | undefined {
  return niches.find((n) => n.slug === slug)
}
