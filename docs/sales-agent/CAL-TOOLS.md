# Moving booking off Retell's built-in Cal tools

Retell's `check_availability_cal` and `book_appointment_cal` tool types are
deprecated. The integration replacing them can only be attached from Retell's
dashboard, so there is no API path to it — and a deprecated tool type is a
booking flow with an expiry date on it.

`app/api/cal/availability` and `app/api/cal/book` replace them. They hold the
Cal.com key server-side, so Retell only ever sees a URL, and rotating the key is
one environment variable instead of an edit inside a tool definition.

## Do this in order

Changing the prompt before the tools exist in Retell breaks booking: the agent
calls a tool that is not there. Environment first, then tools, then prompt.

**1. Set two environment variables** in Netlify (Site configuration →
Environment variables), then redeploy:

```
CAL_API_KEY        your Cal.com key
CAL_EVENT_TYPE_ID  the number in the event type's URL in Cal
```

**2. Check the routes answer** before touching Retell:

```bash
curl -s -X POST https://ondutyagent.com/api/cal/availability \
  -H 'content-type: application/json' -d '{"date":"2026-10-05"}'
```

`ok: true` with slots means you are clear. `"Scheduling is not configured"`
means step 1 has not taken effect yet.

**3. Add two custom tools** in Retell, on the agent's LLM:

```json
{
  "type": "custom",
  "name": "check_availability",
  "description": "Get real open demo slots for a date. Call this before offering any times.",
  "url": "https://ondutyagent.com/api/cal/availability",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "date": { "type": "string", "description": "Date to check, YYYY-MM-DD, America/New_York." }
    },
    "required": ["date"]
  }
}
```

```json
{
  "type": "custom",
  "name": "book_demo_cal",
  "description": "Book the demo once they have chosen a slot and given name, email and phone.",
  "url": "https://ondutyagent.com/api/cal/book",
  "method": "POST",
  "parameters": {
    "type": "object",
    "properties": {
      "start": { "type": "string", "description": "Slot start, ISO 8601, exactly as check_availability returned it." },
      "name": { "type": "string", "description": "Their full name." },
      "email": { "type": "string", "description": "Their email." },
      "phone": { "type": "string", "description": "Their phone." },
      "business_name": { "type": "string", "description": "Their business name." },
      "industry": { "type": "string", "description": "Their industry, in their words." },
      "notes": { "type": "string", "description": "Their phone problem in their own words." }
    },
    "required": ["start", "name", "email"]
  }
}
```

**4. Only now, swap the names in `docs/sales-agent/PROMPT.txt`** and run
`npm run sync:prompt`:

- `check_availability_cal` → `check_availability`
- `book_demo` → `book_demo_cal`

The old `book_demo` parameters included `endTime`. The new route does not want
one — Cal derives the end from the event type's own length, which is why the
15-versus-20-minute mismatch could happen at all. Drop it from the prompt.

**5. Remove the two old tools** from the agent, and publish.

## Why failures come back as HTTP 200

Both routes answer `{ ok: false, message: "..." }` with a 200 rather than an
error status. Retell surfaces a non-2xx to the agent as a tool failure, and an
agent looking at a bare failure improvises — it will tell the caller the demo is
booked when it is not. A sentence it can read and act on ("Offer another time.
Do not say it is booked.") produces the right behaviour instead.
