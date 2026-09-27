# Clean Rite Center — talking website

One-page site for the NYC laundromat chain, with a Retell voice assistant
("Rita") that answers questions and books real pickups on Cal.com.

```
site/          the Next.js site
provision.mjs  creates/updates the Retell agent
genimg.mjs     Gemini image generation (currently quota-blocked on this key)
assets-src/    original images pulled from cleanritecenter.com
.env           secrets — gitignored, never commit
```

## Run it

```bash
cd site && npm install --legacy-peer-deps && npm run dev
```

## Where the content came from

Everything in `site/lib/business.ts` was taken from cleanritecenter.com — the
pricing ($29.99 first 15 lbs, +$2.19/lb), the 3-mile free delivery radius, the
4-hour rapid turnaround, the amenities, and the three testimonials. Nothing is
invented. The voice agent's prompt is written from the same facts, so the site
and the agent cannot quote different numbers.

Two things worth knowing about the source data:

- **(929) 357-1728 is a text line for active orders**, not a sales phone. The
  site labels it "Text us" for that reason — a customer who calls it expecting
  a person gets nothing.
- **This is a chain, not one storefront.** There is no single address to put on
  a map, so the location section embeds a Google Maps *search* for their stores
  and links to their own locator. The corporate address in the footer is an
  office, not a laundromat.

## The voice agent

| | |
|---|---|
| Agent | `agent_a0e686c747f8088c00f2970ffa` |
| LLM | `llm_5b4429070cd192dd94f5647cb01a` |
| Voice | `11labs-Marissa` |
| Name | Rita |

Booking runs through this site's own `/api/cal/availability` and `/api/cal/book`
rather than Retell's built-in Cal.com tools. Those tool types
(`check_availability_cal`, `book_appointment_cal`) are **deprecated — the Retell
API stops accepting them on 09/30/2026**, and the integration that replaces them
can only be attached to an agent from the Retell dashboard. Custom tools hitting
our own endpoints avoid both problems and keep the Cal.com key server-side, so
rotating it means changing one environment variable.

Re-run `provision.mjs` after editing the prompt. Set `SITE_URL` first so the
tools point at the deployed domain:

```bash
set -a; . .env; set +a
SITE_URL=https://your-domain.vercel.app node provision.mjs
```

### Booking only works once deployed

Retell calls the tool URLs from its own servers, so it cannot reach
`localhost`. On the dev server the agent will talk, answer questions and try to
book — and the booking call will fail. That is expected until the site is live.

## Deploy on Vercel

1. Push this repo to GitHub.
2. At [vercel.com/new](https://vercel.com/new), import the repo. Set **Root
   Directory** to `clients/cleanrite/site`.
3. Add these environment variables (Settings → Environment Variables):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_RETELL_AGENT_ID` | `agent_a0e686c747f8088c00f2970ffa` |
   | `NEXT_PUBLIC_RETELL_PUBLIC_KEY` | your Retell public key |
   | `CAL_API_KEY` | your Cal.com API key |
   | `CAL_EVENT_TYPE_ID` | `5286070` |

4. Deploy, then re-run `provision.mjs` with `SITE_URL` set to the live domain so
   the agent's booking tools point at it.
5. In Retell → **Public Keys**, add the Vercel domain and `localhost` to the
   allowed domains, or the widget will not load.

## Known gaps

- **Gemini images**: the supplied key is over its image-generation quota, so no
  AI imagery was produced. The site uses their real photos plus typographic
  tiles where no usable photo existed.
- **Cal.com event type**: booking is wired to the existing "15 min meeting"
  (`5286070`). A dedicated "Laundry Pickup" event type would read better on the
  customer's confirmation email.
