---
name: retell-voice-agent
description: Build a Retell AI voice agent the way this repo does it — a prompt file plus a separately-chunked knowledge base, per-industry guardrails, and the deployment path onto the Next.js site. Use this whenever the user wants to build, rebuild, revise or deploy a voice agent, AI receptionist, phone agent or Retell agent; whenever they mention the agent prompt, its knowledge base, what it should say to a particular industry, or getting it onto the website; and whenever they are debugging an agent that answers wrong, sounds pushy, or will not start a call. It covers the file layout, the three-layer industry handling, the guardrails that keep it from saying something unsafe, and the two deployment paths.
---

# Building a Retell agent

Two kinds of build come up. A **client receptionist** answers for one business.
The **site sales agent** (`docs/sales-agent/`) sells OnDuty Agent itself and is
also the product demo — how it handles the call is the strongest argument the
site makes. The structure below is the same for both.

## File layout

Keep the agent in version control as plain files, not only in Retell's
dashboard. The dashboard has no history and no review.

```
docs/<agent-name>/
├── README.md              what this agent is, and which file to use
├── DEPLOY.md              click-by-click, in order — the entry point
├── PROMPT.txt             the whole prompt, for pasting by hand
├── PROMPT-DAY1.txt        cut-down prompt with no integrations
├── agent.json             prompt + settings + tools, for import
├── agent-day1.json
├── tools.json             custom tool schemas
└── kb/
    ├── 01-…txt            one file per topic
    └── KNOWLEDGE-BASE-ALL.txt   fallback if separate uploads fail
```

Ship a **Day One** build alongside the full one. Day One needs only a Retell
account — no calendar id, no webhooks, no transfer number — and still qualifies,
answers every FAQ and captures the lead. The prompt, knowledge base and
personality are identical; only booking and transfer differ. Someone who cannot
get live today will stall out entirely, so give them a version that works now.

## One agent, one knowledge base, many documents

Not one KB per industry, and not one agent per industry. The split is about
**chunking, not architecture**.

A knowledge base retrieves by semantic similarity over chunks. One large file
gets cut at arbitrary points, so a chunk can straddle the end of the dental
section and the start of med spa — and a dentist's question then pulls half the
wrong industry into the answer. Separate documents make chunk boundaries land on
topic boundaries.

Settings that work: **top_k 3–5**, **filter_score 0.5–0.6**. Higher top_k drags
in loosely-related chunks and the agent starts volunteering irrelevant facts.

**Upload files, do not paste.** The paste box has a character limit that quietly
truncates; file upload does not.

## Handling different industries — three layers

Each layer exists because the one below it fires at the wrong time.

1. **A dynamic variable** (`{{niche}}`) passed with every web call, so a visitor
   on the dental page is known to be dental before they speak.
2. **An industry cue card in the prompt** — one framing line and one lead
   question per industry. This belongs in the prompt rather than the KB because
   framing is needed on *every* call, while retrieval only fires on a question.
3. **A per-industry KB document** carrying the real depth, available the moment
   the industry is known.

Give unlisted industries their own section with an honest test — does the
business run on booked appointments, and do missed calls cost real money —
rather than letting the agent bluff or borrow another trade's pain point.

## Guardrails are per-industry, never global

A guardrail hardcoded for one trade is a live hazard for the others. This repo
shipped an agent that would have told a dentist to "call their own contractor"
because the HVAC guardrail was written once and applied to everyone.

Put a per-niche guardrail field in the niche data and interpolate it. Each one
states what the agent must never do:

- **Law** — never give legal advice, never estimate case value, never imply
  representation. A non-lawyer discussing a matter can compromise privilege.
- **Healthcare / behavioral health** — never assess, diagnose or trade in
  symptoms. It collects intake so a clinician calls back informed. Crisis
  handling follows the practice's own protocol.
- **Med spa** — never promise a clinical outcome or confirm candidacy.
- **Trades** — never quote a firm price sight-unseen or diagnose a fault.

## Tone: answer the question, then stop

An agent that ends every answer with a booking ask reads as a telemarketer and
people hang up. When auditing a prompt, count how many of the multi-shot
examples end in a booking ask — if it is more than a third, rewrite them so most
end on the answer. Lean toward booking when the caller shows interest; do not
staple it to every turn.

Match the greeting in **Begin message** to the greeting inside the prompt
exactly. If they differ, the agent says one thing and then behaves as though it
said another.

## Deploying onto the Next.js site

Two paths. Try the orb link first.

**Orb link** — set `NEXT_PUBLIC_RETELL_ORB_URL` to Retell's hosted share link
and a launcher component renders it in an iframe with `allow="microphone"`.
No API key on the server, no token minted per call, no agent-type constraint.
This is what finally worked here after the API path kept failing. The tradeoff
is that the hosted page owns the call, so dynamic variables cannot be injected —
attribution and `{{niche}}` have to come from elsewhere.

**API path** — `/api/retell/web-call` resolves the agent (env override →
committed agent id → name lookup), calls `create-web-call` with
`retell_llm_dynamic_variables`, and returns the access token. Keep a
retry-without-dynamic-variables fallback: an unknown variable is a common cause
of a 422 and the call succeeding without personalization beats not connecting.
Map 401/403/404/400/422 to distinct diagnoses or debugging is guesswork.

The agent id is safe to commit — it ships to the browser via `NEXT_PUBLIC_`
anyway. The **API key never is**.

## Things that will bite

- **Never ask for or accept the `RETELL_API_KEY` in chat.** It is a live secret.
  The user pastes it directly into the host's environment variables.
- **Never run a provisioning script against a hand-built agent.** Scripts that
  match by name overwrite the prompt, discarding dashboard work with no undo.
- **Do not write "HIPAA compliant" as a flat badge.** State the specific true
  controls: a BAA is in place with the voice infrastructure, retention is
  configurable per agent, PII can be excluded. A blanket claim is a liability.
- **Verify the agent type before theorizing about it.** A wrong guess here sends
  debugging in a direction that costs hours; Retell's own dashboard states it.
- **Keep the prompt in sync with the site.** If a prompt is embedded in source
  for provisioning, add a sync script and re-run it after editing the prompt
  file — otherwise the deployed agent and the committed prompt drift apart.
