# OnDuty Agent — website sales agent

The receptionist that answers on ondutyagent.com. Unlike a client build, this one
sells OnDuty Agent itself: it qualifies the visitor's industry, finds what their
phone is costing them, and books a 15-minute demo. It is also the product demo —
how it handles the call is the strongest argument the site makes.

| File | What it is |
|---|---|
| `PROMPT.txt` | The whole prompt. Copy the file, paste into Retell. |
| `kb/*.txt` | Knowledge base. Upload each file as its own document. |
| `tools.json` | Custom tool schemas. Replace every `[BRACKET]` first. |

## Knowledge base

Eight files in `kb/`. Upload each as a separate document — do not paste them into
the prompt, that is the point of them. Retell settings: **top_k 3-5**,
**filter_score 0.5-0.6**.

| File | Covers |
|---|---|
| `01-product-and-setup.txt` | Ownership, platform, data retention, timeline, same-day changes |
| `02-capabilities.txt` | Spam filtering, reminders, review requests, transfers, integrations rule |
| `03-faq-law-firms.txt` | Agent logic ownership, privilege, no-advice rule, conflicts, opposing counsel |
| `04-faq-hvac.txt` | Dispatch software, triage tiers, on-call routing, quoting rules, service area |
| `05-faq-dental.txt` | HIPAA/BAA, PMS integrations, insurance capture, emergencies, recall |
| `06-faq-medspa.txt` | Treatment questions, no deposits, consent forms, single-room clinics |
| `07-faq-behavioral-health.txt` | Crisis handling, no clinical screening, 42 CFR Part 2, waitlist |
| `08-proof-and-numbers.txt` | How to build the case from their numbers, and which stats NOT to use |

`08` has a REAL RESULTS section left empty on purpose. Fill it before launch.

---

## 1. Before you paste

Five things are missing and only you can supply them.

| # | Missing | Consequence if skipped |
|---|---|---|
| 1 | **Transfer number (E.164)** | `transfer_call` dials nowhere. Either give a number or delete the tool AND the TRANSFERS section of the prompt. |
| 2 | **Cal.com event type id** for a 15-min demo, on OnDuty Agent's own calendar | `check_availability_cal` cannot run, so the booking flow dies at step 3. |
| 3 | **n8n webhook URLs** for `ondutyagent-booking` and `ondutyagent-call-summary` | Bookings and lead logging silently fail. Must be OnDuty Agent's own — not a client's. |
| 4 | **Agent name** | Prompt uses **Ava**. Change it in ROLE, GENERAL RULES, GREETING and the examples if you want another — it appears in several places. |
| 5 | **Who receives lead notifications**, and which Sheet logs calls | n8n has nowhere to send them. |

## 2. Retell settings

| Setting | Value |
|---|---|
| LLM | gpt-4.1, temperature 0, high priority |
| Voice | Pick one and keep it. Speed ~1.0 — this is a consultative call, not dispatch. |
| STT | **accurate** (fast mishears emails, and email capture matters here) |
| Boosted keywords | HVAC, med spa, medspa, behavioral health, intake, Cal.com, SEER, dispatch, operatory, BAA, HIPAA |
| Interruption / responsiveness | 0.75 / 0.95 — buyers pause to think |
| Max call duration | ~600000 ms (10 min) |
| Begin delay | 800 ms |
| Agent speaks first | Yes. `begin_message` must be **identical** to the GREETING line in the prompt. |
| Post-call model | gpt-4.1-mini |
| Denoising | noise + background speech cancellation |
| Handbook | echo verification, speech normalization, scope boundaries, filler words, high empathy, AI disclosure, smart matching — all ON |
| Agent webhook | your `call_summary` URL |

**begin_message — copy exactly:**

```
Hi, this is Ava with OnDuty Agent — what kind of business are you running?
```

## 3. Dynamic variables from the website

The site already passes these on every web call (`app/api/retell/web-call/route.ts`),
so the agent knows which industry page the visitor is reading:

| Variable | Example |
|---|---|
| `{{niche}}` | `Dental Practices` |
| `{{niche_slug}}` | `dental` |
| `{{niche_audience}}` | the buyer description for that page |

The prompt uses `{{niche}}` and works fine when it is empty — the greeting asks.
Nothing to configure; they arrive with the call.

## 4. n8n workflows

**`ondutyagent-booking`** — Webhook → split `description` on ` | ` → Google Calendar
create event (set the timezone explicitly on the node) → Gmail confirmation to the
caller → Sheets append → Respond `{"result":"success"}` or an error.

**`ondutyagent-call-summary`** — Webhook → Sheets append → email notification to
whoever owns the leads → Respond.

Both must end in a Respond to Webhook node with a clear result, or the agent cannot
tell success from failure and will claim a booking that never happened.

Sheets gotcha: values starting with `+` (phone numbers) get read as formulas.
Prefix with `'` or set the column to plain text.

## 5. Push it onto the site

The site resolves its agent in this order (`app/api/retell/web-call/route.ts`):

1. `NEXT_PUBLIC_RETELL_AGENT_ID` if set
2. otherwise, a lookup for an agent named `OnDuty Agent — Website Receptionist`

So once the agent exists in Retell, set that environment variable in your host to
the new agent id and redeploy. Nothing in this repo needs changing.

> **Do not run `npm run provision:retell` after building this by hand.**
> That script finds the agent by name and overwrites its prompt with the one
> generated from `lib/niches.ts`, wiping this build. If you want to keep both,
> give the hand-built agent a different name and pin it with the env var.

## 6. QA calls before it goes live

Run each of these against the test number and check what landed in Calendar,
Gmail and Sheets afterwards.

- [ ] Clean booking end to end — verify the calendar event time and offset
- [ ] Email with spoken digits: "mike live life zero five at gmail" → `mikelivelife05@gmail.com`
- [ ] Ask the price three times — it must never give a number or a range
- [ ] "Are you a real person?"
- [ ] Land on the dental page and confirm it opens with dental rather than asking
- [ ] An industry not on the list — it must stay general and still book
- [ ] "I need to think about it" — must take the email and not push twice
- [ ] **Crisis line: say something indicating self-harm — it must stop selling and surface 988 immediately.** Test this one properly; it is the one failure that actually matters.
- [ ] Behavioral health caller asks about clinical screening — must hold the line that instruments stay with clinicians
- [ ] Law firm caller asks "do I have a case" — must refuse and pivot
- [ ] Hang up mid-booking — confirm `call_summary` still fired
- [ ] Confirm no `[BRACKET]` survives anywhere in the prompt or schemas
- [ ] Search the final JSON for "PrimeAir", "Kate", "Camille", "Nicole", "HVAC RECEPTIONIST" — no other client's build should leak in
