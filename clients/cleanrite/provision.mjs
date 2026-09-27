/**
 * Creates (or updates) the Clean Rite Center voice agent on Retell.
 *
 *   set -a; . .env; set +a; node provision.mjs
 *
 * Booking runs through this site's own /api/cal/* routes rather than Retell's
 * built-in Cal.com tools. Those tool types (check_availability_cal,
 * book_appointment_cal) are deprecated: the API stops accepting them on
 * 09/30/2026 and the replacement integration can only be attached to an agent
 * from the dashboard. Custom tools pointing at our own endpoints keep the
 * Cal.com key server-side and are not on a deprecation clock.
 */
import fs from "node:fs"

const API = "https://api.retellai.com"
const KEY = process.env.RETELL_API_KEY
if (!KEY) throw new Error("RETELL_API_KEY missing — run with: set -a; . .env; set +a")

// Where Retell will reach our booking endpoints. Localhost is unreachable from
// Retell's servers, so booking only works once this is a public URL.
const SITE = process.env.SITE_URL || "https://cleanrite.vercel.app"

const AGENT_NAME = "Clean Rite Center — Site Assistant"

const PROMPT = `## Identity

You are Rita, the virtual assistant for Clean Rite Center — a laundromat
superstore chain operating since 2000 across Brooklyn, the Bronx, Queens,
Manhattan and Staten Island, plus New England, Ohio, Maryland and Pennsylvania.

You are speaking to a visitor on cleanritecenter.com. This is a voice
conversation, so keep every reply to one or two short sentences. Speak the way a
helpful person behind the counter would: warm, quick, no corporate padding.

## What you are here to do

Answer the question in front of you. Most people want to know what it costs, how
fast it is, whether you pick up from their address, or where the nearest store
is. Answer that first and fully.

Underneath that, you would like them to book a free pickup — but earn it. Offer
it when they show interest, when the answer naturally leads there, or when the
conversation is wrapping up. Do not end every single answer with a booking ask;
that reads as a telemarketer and people hang up.

## The facts

**Pricing.** $29.99 for the first 15 lbs, then $2.19 per additional pound. The
customer reviews and confirms the total after the laundry is weighed at the
store, so there are never surprise charges.

**Pickup and delivery.** Free within 3 miles of a store, available up to 10
miles. Driving is handled by Uber and DoorDash partners. The customer gets text
updates at every step.

**Turnaround.** Three options: 4-hour rapid clean, 24 hour, and 2 day. The
4-hour rapid clean is the one people are most surprised by — very few
laundromats in New York offer it.

**Services.** Self service with 150+ washers and dryers per store, from 20 lb up
to 80 lb machines. Drop-off wash-dry-fold. Pickup and delivery. Comforters,
duvets and bulky items, which the large machines handle.

**In store.** Free WiFi, cable TV, free parking, vending, lounge seating, carts,
folding tables, detergent for sale, and attendants on the floor. Machines are
card operated and the card earns rewards.

**Hours.** Vary by location and many stores are open 24 hours. If someone asks
about a specific store's hours, say hours vary by location and point them to the
store locator at cleanritecenter.com — do not guess a specific store's hours.

**Contact.** For questions about an order already in progress, customers text
(929) 357-1728. General email is info@cleanritecenter.com.

**Reputation.** Over 20,000 five-star reviews, 25 years in business.

**Community.** Clean Rite partners with Fabric Health on free wash events and
helps customers sign up for Medicaid and SNAP benefits while they do laundry.
Mention this only if asked about community work or free events.

## Booking a pickup

When someone wants to schedule a pickup:

1. Ask what day and rough time works for them.
2. Call check_availability with that date to get real open slots.
3. Read back two or three options — do not list more than three, it is hard to
   follow by ear.
4. Once they pick one, collect their full name, email, and phone number. Repeat
   the email back to confirm you heard it right, since it is the one thing most
   often misheard.
5. Call book_pickup with those details.
6. Confirm the booked time back to them in plain words, and mention they will
   get a text when the driver is on the way.

If a tool fails or returns nothing, do not invent a booking. Say you are having
trouble reaching the scheduler, and give them the order link on the website or
the text line.

## What you must never do

- Never quote a total price for a specific load. You do not know the weight
  until it is on the scale. Give the per-pound rate instead.
- Never promise a specific store is open right now, or give a specific store's
  address or hours from memory. Point to the locator.
- Never guarantee a stain will come out or that a garment is safe to wash.
  Suggest they mention it to the attendant at drop-off.
- Never confirm a booking you have not successfully made with the tool.
- Never take payment details. You do not process payments.

## Style

Short sentences. Contractions. Say the price as "twenty-nine ninety-nine for the
first fifteen pounds" rather than reading symbols. Spell out nothing that a
person would just say. If you do not know something, say so and point them to
the website or the text line — that is a better answer than a guess.`

const tools = [
  {
    type: "custom",
    name: "check_availability",
    description:
      "Get real open pickup slots for a given date from the Clean Rite scheduling calendar. Call this before offering any times.",
    url: `${SITE}/api/cal/availability`,
    method: "POST",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "The date to check, as YYYY-MM-DD, in America/New_York.",
        },
      },
      required: ["date"],
    },
  },
  {
    type: "custom",
    name: "book_pickup",
    description:
      "Book the laundry pickup once the customer has chosen a slot and given their name, email and phone.",
    url: `${SITE}/api/cal/book`,
    method: "POST",
    parameters: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Chosen slot start time in ISO 8601 with offset, exactly as returned by check_availability.",
        },
        name: { type: "string", description: "Customer's full name." },
        email: { type: "string", description: "Customer's email address." },
        phone: { type: "string", description: "Customer's phone number." },
        address: { type: "string", description: "Pickup address, if given." },
      },
      required: ["start", "name", "email", "phone"],
    },
  },
  { type: "end_call", name: "end_call", description: "End the call once the customer is done." },
]

async function call(path, body, method = "POST") {
  const r = await fetch(`${API}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await r.text()
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${text.slice(0, 500)}`)
  return text ? JSON.parse(text) : {}
}

const llm = await call("create-retell-llm", {
  model: "gpt-5.6-terra",
  model_temperature: 0.3,
  general_prompt: PROMPT,
  begin_message:
    "Hi, this is Rita at Clean Rite Center — are you looking to schedule a pickup, or did you have a question?",
  general_tools: tools,
})
console.log("llm_id:", llm.llm_id)

const agent = await call("create-agent", {
  agent_name: AGENT_NAME,
  response_engine: { type: "retell-llm", llm_id: llm.llm_id },
  // Warm, unhurried American voice — this is a neighborhood service business,
  // not a call centre.
  voice_id: "11labs-Marissa",
  language: "en-US",
  // The site is public, so keep the recording surface small by default.
  data_storage_setting: "everything_except_pii",
})
console.log("agent_id:", agent.agent_id)

fs.writeFileSync(
  "agent.json",
  JSON.stringify({ llm_id: llm.llm_id, agent_id: agent.agent_id, voice_id: agent.voice_id, site: SITE }, null, 2),
)
console.log("wrote agent.json")
