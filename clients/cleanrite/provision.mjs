/**
 * Creates or updates the Clean Rite Center voice agent on Retell.
 *
 *   set -a; . .env; set +a
 *   SITE_URL=https://your-domain.vercel.app node provision.mjs
 *
 * Re-running is safe: it updates the existing LLM and agent recorded in
 * agent.json rather than piling up duplicates, and it re-uploads the knowledge
 * base only when --kb is passed (uploads create a new KB each time).
 *
 * Booking runs through this site's own /api/cal/* routes rather than Retell's
 * built-in Cal.com tools. Those tool types (check_availability_cal,
 * book_appointment_cal) are deprecated: the API stops accepting them on
 * 09/30/2026 and the integration replacing them can only be attached from the
 * dashboard. Custom tools keep the Cal.com key server-side and have no
 * deprecation clock.
 */
import fs from "node:fs"
import path from "node:path"

const API = "https://api.retellai.com"
const KEY = process.env.RETELL_API_KEY
if (!KEY) throw new Error("RETELL_API_KEY missing — run with: set -a; . .env; set +a")

const SITE = process.env.SITE_URL || "https://cleanrite.vercel.app"
const here = path.dirname(new URL(import.meta.url).pathname)
const state = fs.existsSync(`${here}/agent.json`)
  ? JSON.parse(fs.readFileSync(`${here}/agent.json`, "utf8"))
  : {}

const PROMPT = fs.readFileSync(`${here}/agent/PROMPT.txt`, "utf8")
const BEGIN =
  "Hi, this is Rita at Clean Rite Center — are you looking to schedule a pickup, or did you have a question?"

async function call(pathname, body, method = "POST") {
  const r = await fetch(`${API}/${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await r.text()
  if (!r.ok) throw new Error(`${pathname} -> ${r.status} ${text.slice(0, 600)}`)
  return text ? JSON.parse(text) : {}
}

/* Knowledge base ---------------------------------------------------------- */

async function uploadKnowledgeBase() {
  const dir = `${here}/agent/kb`
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".txt")).sort()

  // Separate documents rather than one file: the KB retrieves by similarity
  // over chunks, and a single large file gets cut at arbitrary points, so a
  // chunk can straddle the end of pricing and the start of locations. One file
  // per topic makes chunk boundaries land on topic boundaries.
  const form = new FormData()
  form.append("knowledge_base_name", "Clean Rite Center KB")
  for (const f of files) {
    form.append(
      "knowledge_base_files",
      new Blob([fs.readFileSync(path.join(dir, f))], { type: "text/plain" }),
      f,
    )
  }

  const r = await fetch(`${API}/create-knowledge-base`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  })
  const text = await r.text()
  if (!r.ok) throw new Error(`create-knowledge-base -> ${r.status} ${text.slice(0, 600)}`)
  const kb = JSON.parse(text)
  console.log(`knowledge base: ${kb.knowledge_base_id} (${files.length} documents)`)
  return kb.knowledge_base_id
}

/* Tools ------------------------------------------------------------------- */

const tools = [
  {
    type: "custom",
    name: "check_availability",
    description:
      "Get real open pickup slots for a given date. Call this before offering any times.",
    url: `${SITE}/api/cal/availability`,
    method: "POST",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "Date to check, YYYY-MM-DD, America/New_York." },
      },
      required: ["date"],
    },
  },
  {
    type: "custom",
    name: "book_pickup",
    description:
      "Book the pickup once the customer has chosen a slot and given name, email and phone.",
    url: `${SITE}/api/cal/book`,
    method: "POST",
    parameters: {
      type: "object",
      properties: {
        start: { type: "string", description: "Slot start, ISO 8601, exactly as check_availability returned it." },
        name: { type: "string", description: "Customer's full name." },
        email: { type: "string", description: "Customer's email." },
        phone: { type: "string", description: "Customer's phone." },
        address: { type: "string", description: "Pickup address, if given." },
      },
      required: ["start", "name", "email", "phone"],
    },
  },
  { type: "end_call", name: "end_call", description: "End the call once the customer is done." },
]

/* Run --------------------------------------------------------------------- */

const wantKb = process.argv.includes("--kb")
const kbId = wantKb ? await uploadKnowledgeBase() : state.knowledge_base_id

const llmBody = {
  model: "gpt-5.6-terra",
  model_temperature: 0.3,
  general_prompt: PROMPT,
  begin_message: BEGIN,
  general_tools: tools,
  ...(kbId ? { knowledge_base_ids: [kbId], kb_config: { top_k: 4, filter_score: 0.55 } } : {}),
}

const llm = state.llm_id
  ? await call(`update-retell-llm/${state.llm_id}`, llmBody, "PATCH")
  : await call("create-retell-llm", llmBody)
console.log("llm_id:", llm.llm_id)

const agentBody = {
  agent_name: "Clean Rite Center — Site Assistant",
  response_engine: { type: "retell-llm", llm_id: llm.llm_id },
  voice_id: "11labs-Marissa",
  language: "en-US",
  data_storage_setting: "everything_except_pii",
}

const agent = state.agent_id
  ? await call(`update-agent/${state.agent_id}`, agentBody, "PATCH")
  : await call("create-agent", agentBody)
console.log("agent_id:", agent.agent_id)

fs.writeFileSync(
  `${here}/agent.json`,
  JSON.stringify(
    {
      llm_id: llm.llm_id,
      agent_id: agent.agent_id,
      knowledge_base_id: kbId ?? null,
      voice_id: agent.voice_id,
      site: SITE,
    },
    null,
    2,
  ),
)
console.log("wrote agent.json")
