#!/usr/bin/env node
/** Regenerates lib/sales-prompt.ts from docs/sales-agent/PROMPT.txt. */
import { readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const prompt = readFileSync(resolve(ROOT, "docs/sales-agent/PROMPT.txt"), "utf8")
const escaped = prompt.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")

writeFileSync(
  resolve(ROOT, "lib/sales-prompt.ts"),
  `/**
 * The website sales agent prompt, kept in sync with docs/sales-agent/PROMPT.txt.
 *
 * It lives here as well as there so that \`/setup\` and \`npm run provision:retell\`
 * create an agent carrying this prompt rather than a generated one. Regenerate
 * with: npm run sync:prompt
 *
 * The knowledge base is NOT part of this. A provisioned agent starts without
 * one, so attach the documents in docs/sales-agent/kb/ to it in the Retell
 * dashboard afterwards — without them the agent still runs, it just answers the
 * deeper FAQs with "the team will have a straight answer on the call".
 */
export const SALES_PROMPT = \`${escaped}\`
`,
)
console.log("lib/sales-prompt.ts regenerated from docs/sales-agent/PROMPT.txt")

/*
 * agent.json embeds the same prompt for dashboard import, and it used to be
 * updated by hand — so it silently fell behind and would re-import an old
 * prompt over a fixed one. Rewriting it here means PROMPT.txt is the only
 * place the prompt is ever edited.
 */
const agentPath = resolve(ROOT, "docs/sales-agent/agent.json")
const agent = JSON.parse(readFileSync(agentPath, "utf8"))
if (agent.llm?.general_prompt !== undefined) {
  agent.llm.general_prompt = prompt
  agent.llm.begin_message = "Hi, this is Ava with OnDuty Agent — what kind of business are you running?"
  writeFileSync(agentPath, JSON.stringify(agent, null, 2) + "\n")
  console.log("docs/sales-agent/agent.json prompt updated to match")
} else {
  console.warn("docs/sales-agent/agent.json has no llm.general_prompt — left alone")
}
