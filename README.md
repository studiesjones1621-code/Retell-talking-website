# OnDuty Agent — Talking Website

A one-page site for OnDuty Agent with an embedded Retell voice agent that answers
visitor questions and drives the booking CTA.

Built with Next.js 16, React 19, Tailwind v4 and `retell-client-js-sdk`.

---

## 1. Everything starts in one file

`lib/business.ts` is the single source of truth. The page copy, SEO tags,
click-to-call links, LocalBusiness schema **and the voice agent's system prompt**
are all generated from it. Change a price there and the site and the agent both
update.

Fields marked `VERIFY` in that file could not be confirmed automatically —
`ondutyagent.com` was unreachable from the build environment, so those values are
professional defaults inferred from the business type. **Confirm them before
launch**, in particular:

| Field | Why it matters |
|---|---|
| `phone` / `phoneDisplay` | Empty by design. No fabricated number is shipped — while blank, every CTA falls back to "Talk to our assistant" rather than rendering a dead `tel:` link. |
| `address` | Empty by design. While `street` is blank the Location card renders a service-area block; fill it in and an embedded Google Map plus address schema appear automatically. |
| `services` / prices | Inferred defaults. |
| `testimonials` | Placeholder attributions. Replace with real, attributable reviews — publishing invented testimonials is a legal and trust risk. |

---

## 2. Run it locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

---

## 3. Provision the voice agent

Secrets live in `.env.local` (git-ignored; `.env.example` documents the shape).

```bash
npm run provision:retell
```

This script:

1. Reads the business facts from `lib/business.ts`.
2. Looks up your Cal.com event types and picks the one matching the CTA.
3. Writes a system prompt for this specific business — services, prices, hours,
   location, voice-appropriate response style, and a soft background objective of
   booking a demo.
4. Creates a Retell LLM + Agent (`gpt-4.1`, ElevenLabs voice, backchanneling on).
5. Attaches `check_availability_cal` and `book_appointment_cal` tools when a
   Cal.com key is present, so the agent books on the calendar during the call.
   Without one it falls back to lead capture (name, phone, preferred time).
6. Writes `NEXT_PUBLIC_RETELL_AGENT_ID` and `RETELL_LLM_ID` back into `.env.local`.

Re-running it **updates** the existing agent instead of creating duplicates.

Then restart `npm run dev`.

> This must be run from a machine with outbound access to `api.retellai.com` and
> `api.cal.com`. It was not run during the build because the build sandbox blocks
> both hosts at the network egress proxy.

---

## 4. How the voice widget works

`components/voice-agent/` contains the custom launcher:

- **`voice-agent-provider.tsx`** — call state machine and Retell SDK wiring.
- **`voice-agent-widget.tsx`** — the floating launcher, rotating CTA bubble and call panel.

**Microphone handling.** Permission is requested *before* the call starts, so a
missing or blocked mic surfaces as a friendly in-page message ("Mic not found —
check your microphone and try again", plus the phone number when one is set)
instead of an SDK runtime error. Denied permission, a mic in use by another app,
an insecure (non-https) origin and unsupported browsers each get their own message.

**Auto-popup.** The bubble appears 5s after load, stays 5s, hides 5s, then repeats
with the next message — starting with the CTA, "Would you like to book a demo?".
It stops permanently once the visitor opens or dismisses it.

**Security.** The private Retell key never reaches the browser. The client calls
`/api/retell/web-call`, which mints a short-lived access token server-side.

### Official drop-in widget (alternative)

`components/voice-agent/retell-official-widget.tsx` wraps Retell's own widget
script. It is **not** mounted by default — the custom launcher is used instead
because it is what makes the brand-matched styling, the rotating bubble and the
mic error handling possible. To switch, swap `<VoiceAgentWidget />` for
`<RetellOfficialWidget />` in `app/page.tsx`.

> ⚠️ **If you use the official widget**, add your production domain **and
> `localhost`** to the allowed-domains list under **Public Keys** in the Retell
> dashboard, or the widget will silently fail to load. The default custom
> launcher does not have this requirement, since it authenticates server-side.

---

## 5. Imagery

The hero and section backgrounds use layered CSS gradient + grid treatments — no
image files, nothing to break, and fast.

To generate photographic artwork with Gemini (Nano Banana):

```bash
npm run generate:images
```

This was not run during the build: the supplied Gemini key returned HTTP 429
(free-tier quota exhausted) for every image model. Retry once quota resets.

---

## 6. Deploy free on Vercel (no command line)

1. Push this branch to GitHub (already done).
2. Go to **[vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
3. Click **Import** next to the `retell-talking-website` repository.
4. Under **Environment Variables**, add each of these (values are in your local
   `.env.local`):
   - `RETELL_API_KEY`
   - `NEXT_PUBLIC_RETELL_AGENT_ID`
   - `CAL_API_KEY`
   - `NEXT_PUBLIC_RETELL_PUBLIC_KEY`
   - `RETELL_LLM_ID`
5. Leave the framework preset as **Next.js** and click **Deploy**.
6. When it finishes, open **Settings → Domains** and add `ondutyagent.com`, then
   update the DNS records Vercel shows you at your registrar.

To deploy the `claude/ondutyagent-talking-website-ev0b71` branch as production,
set it as the Production Branch under **Settings → Git**, or merge it into `main`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server on :3000 |
| `npm run build` | Production build |
| `npm run provision:retell` | Create/update the Retell agent from `lib/business.ts` |
| `npm run generate:images` | Generate hero/section imagery with Gemini |
