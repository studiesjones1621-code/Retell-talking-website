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
