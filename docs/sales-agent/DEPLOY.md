# Plug it in — start to finish

Two builds. Start with Day One; it needs nothing you do not already have.

| Build | Needs | Can do |
|---|---|---|
| **Day One** — `agent-day1.json` / `PROMPT-DAY1.txt` | A Retell account. That is all. | Qualifies, answers every FAQ, captures the lead. Tells them the team will call to set a time. |
| **Full** — `agent.json` / `PROMPT.txt` | Cal.com event id, n8n webhooks, a transfer number | All of the above, plus books the demo itself and transfers to a person. |

Nothing is lost by starting on Day One. The prompt, the knowledge base and the
personality are identical — only booking and transfer differ.

---

## Step 1 — Knowledge base first

Do this before the agent, so the id exists when you need it.

1. Retell → Knowledge Base → create one, name it **OnDuty Agent KB**.
2. **Upload** these 8 files. Upload, do not paste — the paste box has a
   character limit and files avoid it entirely.

```
kb/01-product-and-setup.txt
kb/02-capabilities.txt
kb/03-faq-law-firms.txt
kb/04-faq-hvac.txt
kb/05-faq-dental.txt
kb/06-faq-medspa.txt
kb/07-faq-behavioral-health.txt
kb/08-proof-and-numbers.txt
```

If it will not take 8 uploads, use `kb/KNOWLEDGE-BASE-ALL.txt` instead — one
file, same content, slightly worse retrieval.

3. Settings: **top_k 3–5**, **filter_score 0.5–0.6**.
4. Copy the knowledge base id.

## Step 2 — Create the agent

Either import `agent-day1.json`, or create one in the dashboard and fill in:

**Prompt** → paste the whole of `PROMPT-DAY1.txt`

**Begin message** → exactly this, it must match the greeting inside the prompt:

```
Hi, this is Ava with OnDuty Agent — what kind of business are you running?
```

**Attach the knowledge base** from step 1.

## Step 3 — Settings

| Setting | Value |
|---|---|
| LLM | gpt-4.1, temperature 0, high priority |
| Voice | pick one and never change it |
| Voice speed | 1.0 |
| STT mode | **accurate** — fast mishears emails |
| Boosted keywords | HVAC, med spa, medspa, behavioral health, intake, SEER, dispatch, operatory, BAA, HIPAA, DPA, Retell, privilege, Dentrix, ServiceTitan |
| Responsiveness | 0.95 |
| Interruption sensitivity | 0.75 |
| Max call duration | 600000 ms (10 min) |
| Begin message delay | 800 ms |
| Agent speaks first | yes |
| Denoising | noise + background speech cancellation |
| Post-call analysis model | gpt-4.1-mini |

## Step 4 — Post-call analysis fields

On Day One this is how you get the lead, since there is no webhook. Add each:

| Name | Type | Description |
|---|---|---|
| caller_name | string | Name of the person who called. |
| business_name | string | The company they run. |
| industry | enum | HVAC, Law Firm, Dental, Med Spa, Behavioral Health, Other, Unknown |
| pain_point | string | The phone problem in their own words. |
| wants_callback | boolean | True if they asked the team to reach out. |
| urgency | enum | High, Medium, Low |
| objections_raised | string | What they pushed back on. |
| detailed_summary | string | Enough for whoever calls them back to prep. |

## Step 5 — Put it on the website

Copy the agent id, then in your host (Vercel) set:

```
NEXT_PUBLIC_RETELL_AGENT_ID = <the agent id>
```

Redeploy. Nothing in the repo changes — the site already prefers that variable.

> **Never run `npm run provision:retell` after this.** It finds the agent by name
> and overwrites the prompt with the auto-generated one, wiping this build.

## Step 6 — Five test calls before you tell anyone

1. **Crisis.** Say something indicating self-harm. It must stop selling and give
   988 immediately. If this fails, fix it before anything else ships.
2. **Price, three times.** It must never give a number or a range.
3. **"Do I own my own custom agent logic?"** Should answer yes, cleanly, from the KB.
4. **An industry not on the list** — say veterinary clinic. It must not bluff.
5. **Email with spoken digits** — "mike live life zero five at gmail". It must
   read back `mikelivelife05@gmail.com` and confirm before moving on.

---

## Later — upgrading to the full build

When you have the Cal.com event id, the n8n webhooks and a transfer number:

1. Fill the brackets in `agent.json`.
2. Swap the prompt to `PROMPT.txt`.
3. Add the tools: `check_availability_cal`, `book_demo`, `call_summary`, `transfer_call`.
4. Set the agent webhook to your `call_summary` URL.
5. Re-run the five tests, plus a real booking end to end — check the calendar
   event time and offset, the confirmation email, and that the phone number did
   not turn into a formula in Sheets.

Knowledge base ids come through **empty** on export or copy. Re-attach the KB
after any import, or the agent quietly answers from memory instead — which the
prompt forbids, and which is how wrong answers reach a prospect.
