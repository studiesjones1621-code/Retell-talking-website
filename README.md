# OnDuty Agent — Talking Website

> **Just want the voice agent on the website you already have?**
> Read **[docs/START-HERE.md](docs/START-HERE.md)** instead — a click-by-click
> walkthrough that keeps your current site and adds the agent with one line of
> code. You can ignore the rest of this README.

---


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

## Images: where they come from matters

Each niche can carry a hero photograph — set `heroImage` in `lib/niches.ts` to a
path under `public/`, e.g. `"/images/hero-dental.jpg"`. Leave it `null` and the
hero falls back to the gradient treatment, which is a finished look, not a
placeholder. So niches can get photos one at a time.

**Do not use images from a Google Images search.** Search results are not a
stock library — the overwhelming majority are somebody's copyrighted work, and
using one on a commercial site is infringement regardless of whether a credit is
given or the file was "publicly available". Stock agencies run automated reverse
image searches and send invoices; a single found photo routinely costs more than
a year of legitimate stock.

Three sources that are actually safe here:

| Source | Cost | Notes |
|---|---|---|
| `npm run generate:images` | Gemini API usage | Generates one hero per niche, already prompted for this site's palette and composition. Output is yours to use commercially. |
| Unsplash / Pexels | Free | Explicitly licensed for commercial use. Check the licence on the individual photo, not just the site. |
| Your own photos | Free | Best option by far. Real shots of real work out-convert stock every time. |

If a photo shows an identifiable person, a client's premises, or a patient
setting, get written permission before it goes up — a licence covers the
photographer's rights, not the subject's.

---

## 2. Run it locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

---

## 3. Create the voice agent

### The easy way — one button, no terminal

1. Deploy to Vercel first (section 6 below). When you add the environment
   variables, include **`SETUP_SECRET`** and make up any random word for it —
   `hvac-setup-2026` is fine. It just stops strangers from using this page.
2. Once deployed, visit **`https://your-site.vercel.app/setup?key=hvac-setup-2026`**
   (swap in whatever word you chose).
3. The page confirms it can see your Retell and Cal.com keys. Click
   **Create my agent**.
4. Done. Go to your home page and click **Talk to us** — it works immediately.
   Nothing to copy, nothing to paste, no redeploy.

The page tells you which mode you got: real Cal.com booking, or lead capture.

Running it again updates the same agent rather than creating a second one.

> If `SETUP_SECRET` is not set, `/setup` returns 404 — the page simply does not
> exist. That is deliberate: a live site should never expose an unprotected
> button that creates things on your Retell account. Once your agent is working,
> you can delete `SETUP_SECRET` from Vercel to switch the page off for good.

### The terminal way

**Step by step, from a fresh clone:**

1. Install [Node.js](https://nodejs.org) (version 22 or newer) if you don't have it.
2. Open Terminal (macOS) or PowerShell (Windows) and `cd` into this folder.
3. `npm install`
4. `npm run provision:retell` — the first run creates `.env.local` for you and stops.
5. Open `.env.local` in any text editor and paste in your `RETELL_API_KEY` and
   `CAL_API_KEY`. Save it.
6. `npm run provision:retell` again. It prints your **Agent ID** and writes it into
   `.env.local` automatically.
7. `npm run dev` → open http://localhost:3000 and click **Talk to us**.

Prefer not to touch a terminal at all? `docs/agent-prompt.md` walks through building
the same agent by hand in the Retell dashboard, and contains the exact system prompt
to paste. You still need to copy the resulting Agent ID into Vercel.

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

**You can deploy before the agent exists.** The agent ID is just an environment
variable, so the order is up to you:

- *Deploy first:* the site goes live and the launcher politely says the assistant
  is finishing setup. Later, run `npm run provision:retell`, paste the resulting
  `NEXT_PUBLIC_RETELL_AGENT_ID` into Vercel, and redeploy — the voice agent turns on
  with no code changes.
- *Provision first:* run the script, confirm the agent works locally, then deploy
  once with everything already set.

Steps:

1. Push this branch to GitHub (already done).
2. Go to **[vercel.com/new](https://vercel.com/new)** and sign in with GitHub.
3. Click **Import** next to the `retell-talking-website` repository.
4. Under **Environment Variables**, add:
   - `RETELL_API_KEY` — your Retell private key
   - `CAL_API_KEY` — your Cal.com key (skip for lead-capture mode)
   - `SETUP_SECRET` — any random word you invent, for the `/setup` page
   - `NEXT_PUBLIC_RETELL_PUBLIC_KEY` — only if you switch to the official widget

   You do **not** need `NEXT_PUBLIC_RETELL_AGENT_ID`. If it is absent, the site
   looks up the agent this project created on your Retell account, which is what
   lets the `/setup` page work without a redeploy. Setting it explicitly is
   slightly faster and still supported.
5. Leave the framework preset as **Next.js** and click **Deploy**.
6. When it finishes, open **Settings → Domains** and add `ondutyagent.com`, then
   update the DNS records Vercel shows you at your registrar.

> Whenever you add or change an environment variable in Vercel, redeploy for it to
> take effect: **Deployments → ⋯ on the latest one → Redeploy**. Saving the variable
> alone does not update the running site.

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
