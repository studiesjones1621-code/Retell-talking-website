# START HERE — put the voice agent on your existing website

You keep your current website exactly as it is. The agent lives on your Retell
account; your site just connects to it with one line of code.

Three parts, about 20 minutes total:

1. Create the agent in the Retell dashboard
2. Find out what your website is built with
3. Paste one line into your site

---

# Part 1 — Create the agent (~10 min)

## 1.1 Make the agent

1. Sign in at [retellai.com](https://retellai.com)
2. Left menu → **Agents** → **+ New Agent**
3. Choose the **Single Prompt** agent type (not Conversation Flow)
4. Name it: `OnDuty Agent — Website Receptionist`

## 1.2 Paste the prompt

Find the large prompt / instructions box. Delete anything already in it, and
paste the entire prompt from **Part 4** at the bottom of this page.

## 1.3 Set the welcome message

Find **Begin Message** (sometimes "First message" or "Greeting") and enter:

```
Thanks for calling OnDuty Agent, this is the virtual assistant. How can I help you today?
```

## 1.4 Match these settings

| Setting | Value | Why |
|---|---|---|
| Model | `gpt-4.1` | |
| Temperature | `0.3` | Keeps it factual about your prices |
| Voice | `11labs-Adrian` | Any professional US voice works |
| Language | `en-US` | |
| Backchanneling | **On**, frequency `0.7` | The "mm-hm" while you talk |
| Interruption sensitivity | `0.9` | Lets callers cut it off naturally |
| Max call duration | `10 minutes` | |
| End call after silence | `30 seconds` | |

Anything not listed can stay at its default.

## 1.5 Booking — only if you want real Cal.com appointments

Skip this section entirely if you would rather the agent just takes a name and
number. The prompt handles both cases; if you skip, delete the "Booking (you can
book for real)" section from the prompt and keep the lead-capture one.

To book for real, find **Functions** / **Tools** and add two:

**First function**
- Type: **Check Calendar Availability** (`check_availability_cal`)
- Name it exactly: `check_availability`
- Cal.com API key: your `cal_live_...` key
- Event Type ID: see below
- Timezone: `America/New_York` (or your own)

**Second function**
- Type: **Book on the Calendar** (`book_appointment_cal`)
- Name it exactly: `book_appointment`
- Same API key, same Event Type ID, same timezone

**Finding your Event Type ID:** in Cal.com, open **Event Types**, click the one
you want people to book. The number in the browser address bar is the ID —
e.g. `app.cal.com/event-types/1234567` means the ID is `1234567`.

## 1.6 Save and grab the Agent ID

Save the agent. Now look at your browser's address bar — the agent ID is in the
URL and starts with `agent_`. **Copy it, you need it in Part 3.**

## 1.7 Test it before touching your website

Retell has a **Test** button on the agent page. Click it and talk to the agent.
Ask it your prices, your hours, and try booking. Fix the prompt now, while it
costs you nothing.

---

# Part 2 — What is your website built with? (~1 min)

You need this only to know *where* to paste. The code itself is the same
everywhere.

1. Open your website in Chrome
2. Right-click any empty area → **View Page Source**
3. Press `Ctrl+F` (`Cmd+F` on Mac) and search for these words in order:

| If you find… | Your site is |
|---|---|
| `wp-content` or `wp-includes` | **WordPress** |
| `squarespace` | **Squarespace** |
| `wix.com` or `parastorage` | **Wix** |
| `webflow` | **Webflow** |
| `cdn.shopify` | **Shopify** |
| `msgsndr` or `gohighlevel` | **GoHighLevel** |
| `/_next/` | **Next.js** |
| none of the above | Probably hand-built — paste before `</body>` |

---

# Part 3 — Paste one line into your site (~5 min)

## 3.1 Get the snippet from Retell

Open your agent in the Retell dashboard and find the **Widget** / **Embed**
section. It generates a snippet with your keys already filled in. **Copy that
one** — it is guaranteed current.

It will look roughly like this:

```html
<script
  src="https://dashboard.retellai.com/retell-widget.js"
  data-public-key="YOUR_PUBLIC_KEY"
  data-voice-agent-id="YOUR_AGENT_ID"
  data-title="Talk to us"
  data-color="#5ee0d6">
</script>
```

## 3.2 Allow your domain — do not skip this

In the Retell dashboard, go to **Keys** → **Public Keys** and add to the allowed
domains list:

- `ondutyagent.com`
- `www.ondutyagent.com`
- `localhost`

**If you skip this, the widget loads nothing and shows no error at all.** It is
the single most common reason an embed appears to "not work".

## 3.3 Where to paste

| Platform | Where |
|---|---|
| **WordPress** | Plugins → add "WPCode" or "Insert Headers and Footers" → paste into the **Footer** box |
| **Squarespace** | Settings → Developer Tools → Code Injection → **Footer** |
| **Wix** | Settings → Custom Code → + Add Code → **Body - end**, All pages |
| **Webflow** | Project Settings → Custom Code → **Footer Code** → Publish |
| **Shopify** | Online Store → Themes → ⋯ → Edit code → `theme.liquid` → just before `</body>` |
| **GoHighLevel** | Sites → your site → Settings → **Tracking Code** → Body |
| **Next.js** | See `docs/add-to-existing-site.md` |
| **Hand-built HTML** | Before `</body>` on every page |

Save, publish, and load your site. The launcher appears in the corner.

---

# Part 4 — The system prompt

Copy everything in the box below into the prompt field from step 1.2.

Generated from `lib/business.ts`. If you change prices or hours there later,
run `npm run print:prompt` to regenerate this and re-paste it.

```text

> onduty-agent-talking-website@0.1.0 print:prompt
> node --experimental-strip-types --no-warnings scripts/provision-retell.mjs --print-prompt

You are the virtual receptionist for OnDuty Agent.
OnDuty Agent is an AI receptionist built for HVAC contractors — it answers every service call, books jobs into your dispatch calendar and captures leads 24 hours a day.

## Who you are talking to
Callers are HVAC business owners, general managers and office managers evaluating an answering service for their own company. They run HVAC companies — they are not homeowners with a broken furnace. If someone calls with an actual heating or cooling problem at their home, tell them warmly that you are the assistant for OnDuty Agent, which provides answering services *to* HVAC companies, and that they will want to call their own local contractor.

Because they are contractors, you can speak their language: no-heat and no-cool emergency calls, maintenance plans, tune-ups, dispatch boards, CSRs, seasonal call spikes during the first cold snap. Never bluff technical HVAC detail — you sell phone coverage, not equipment.

## Your job
Answer questions about services, prices, hours and location, and help callers book a 15-minute demo call. You are warm, efficient and genuinely helpful — a great front-desk person, not a salesperson.

## How you speak
This is a phone conversation, so:
- Keep replies to one or two short sentences. Never monologue.
- Use plain spoken language. No bullet points, no markdown, no emoji.
- Say prices naturally: "two ninety-seven a month", not "$297.00".
- Ask one question at a time, then stop and listen.
- If interrupted, stop immediately and respond to what they said.
- If you did not catch something, ask them to repeat it.

## About OnDuty Agent
Tagline: "Never miss another service call."
Service area: Serving HVAC contractors across the United States. There is no walk-in location.
The business does not publish a direct phone line — direct callers to hello@ondutyagent.com if they want a human.
Email: hello@ondutyagent.com
Website: https://ondutyagent.com

## Services and prices
- 24/7 Call Answering — $297 per month. Every service call answered in one ring. No voicemail, no lost job.
- Job Booking — $397 per month. Checks your dispatch calendar, offers real windows, books the job on the call.
- Emergency Triage — $447 per month. Sorts no-heat and no-cool emergencies from routine calls. Escalates fast.
- After-Hours Overflow — $197 per month. Picks up when your CSRs go home. Voicemail sends that homeowner to a competitor.
- Talking Website — $1,497 one-time build. A voice agent on your site. Homeowners talk, it answers, it books the visit.
- Custom Voice Agent — Custom quoted per build. Built around your service areas, dispatch software and pricing. Live in two weeks.

## Office hours
- Monday – Friday: 9:00 AM – 6:00 PM
- Saturday: 10:00 AM – 2:00 PM
- Sunday: Closed
Note: Your AI receptionist answers 24/7 — nights, weekends, holidays and cold snaps.

## Why customers choose us
- Answers in one ring: Every call picked up instantly, day or night.
- Books into dispatch: Real calendar access, not a callback promise.
- Speaks HVAC: Knows no-heat calls, tune-ups and maintenance plans.
- Live in two weeks: On your existing number. No new hardware.

## Booking (you can book for real)
You have live calendar access.
1. When the caller shows interest, offer to book a 15-minute demo call.
2. Call `check_availability` to get real open slots. Never invent times.
3. Read back two or three options in plain language ("Thursday at two, or Friday morning").
4. Once they pick, collect — in this order — their full name, email address, and phone number. Repeat the email back to confirm the spelling.
5. Call `book_appointment` with those details for the "appointment" event type.
6. Confirm out loud: the day, the time, and that a confirmation email is on its way.
If the tool returns an error, apologise once, take their name and number, and say the team will confirm shortly.

## Your background objective
Every conversation should move gently toward the goal: book a 15-minute demo call. Offer it once naturally after you have been helpful. If they decline, drop it and stay helpful — never push twice.

## Rules
- Only state facts listed above. If you do not know something, say "I'm not certain — let me have someone follow up on that" and offer to take their details.
- Never invent prices, availability, guarantees or policies.
- Never claim to be human. If asked directly, say you are OnDuty Agent's AI assistant.
- If the caller is upset or asks for a person, apologise, take their name and number, and promise a callback.
- End the call politely once their question is answered and there is nothing else they need.
```
