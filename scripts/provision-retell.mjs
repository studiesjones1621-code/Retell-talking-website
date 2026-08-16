#!/usr/bin/env node
/**
 * Command-line front door for agent provisioning.
 *
 *   npm run provision:retell     create/update the agent
 *   npm run print:prompt         print the system prompt, call nothing
 *
 * The actual work lives in lib/provision.ts, shared with the /setup page, so
 * both routes produce an identical agent. This file only handles .env.local.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ENV_PATH = resolve(ROOT, ".env.local")
const EXAMPLE_ENV_PATH = resolve(ROOT, ".env.example")

const PRINT_ONLY = process.argv.includes("--print-prompt")

// This file imports TypeScript directly, which needs Node's type stripping.
const [major, minor] = process.versions.node.split(".").map(Number)
if (major < 22 || (major === 22 && minor < 6)) {
  console.error(
    `\n✗ Node ${process.versions.node} is too old — this script needs Node 22.6 or newer.\n` +
      `  Install the current LTS from https://nodejs.org, then re-run.\n`,
  )
  process.exit(1)
}

const { provisionAgent, buildPrompt } = await import("../lib/provision.ts")

// ------------------------------------------------------------------ env files

function parseEnvFile(path) {
  if (!existsSync(path)) return {}
  const out = {}
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq === -1) continue
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[line.slice(0, eq).trim()] = value
  }
  return out
}

function upsertEnv(updates) {
  const lines = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8").split("\n") : []
  for (const [key, value] of Object.entries(updates)) {
    const idx = lines.findIndex((l) => l.trim().startsWith(`${key}=`))
    if (idx === -1) lines.push(`${key}=${value}`)
    else lines[idx] = `${key}=${value}`
  }
  writeFileSync(ENV_PATH, lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n")
}

// .env.local is git-ignored, so a fresh clone will not have one. Create it from
// the committed template rather than failing with a bare "key is missing".
if (!PRINT_ONLY && !existsSync(ENV_PATH) && existsSync(EXAMPLE_ENV_PATH)) {
  writeFileSync(ENV_PATH, readFileSync(EXAMPLE_ENV_PATH, "utf8"))
  console.error(`
✗ No .env.local found, so one was just created from .env.example.

  Open .env.local, paste in your keys, and run this again:

    RETELL_API_KEY   — retellai.com → Dashboard → API Keys
    CAL_API_KEY      — app.cal.com → Settings → Developer → API Keys
                       (leave blank for lead-capture mode instead of booking)
`)
  process.exit(1)
}

const fileEnv = parseEnvFile(ENV_PATH)
const env = { ...fileEnv, ...process.env }

const RETELL_API_KEY = env.RETELL_API_KEY
const CAL_API_KEY = (env.CAL_API_KEY ?? "").trim()

if (!PRINT_ONLY && !RETELL_API_KEY) {
  console.error(`
✗ RETELL_API_KEY is empty in .env.local.

  Get it from retellai.com → Dashboard → API Keys, paste it after the "=",
  save the file, and run this again.
`)
  process.exit(1)
}

// ---------------------------------------------------------------------- main

if (PRINT_ONLY) {
  const bookingEnabled = Boolean(CAL_API_KEY) && CAL_API_KEY.toUpperCase() !== "SKIP"
  console.log(buildPrompt({ bookingEnabled, eventTitle: "appointment" }))
  process.exit(0)
}

console.log("\nProvisioning your Retell agent…\n")

try {
  const result = await provisionAgent({
    retellApiKey: RETELL_API_KEY,
    calApiKey: CAL_API_KEY,
    existingAgentId: fileEnv.NEXT_PUBLIC_RETELL_AGENT_ID || undefined,
    existingLlmId: fileEnv.RETELL_LLM_ID || undefined,
  })

  for (const line of result.log) console.log(`  · ${line}`)

  upsertEnv({
    RETELL_LLM_ID: result.llmId,
    NEXT_PUBLIC_RETELL_AGENT_ID: result.agentId,
  })

  console.log(`
──────────────────────────────────────────────
  Agent ID : ${result.agentId}
  Voice    : ${result.voiceId}
  Booking  : ${
    result.bookingEnabled
      ? `Cal.com — "${result.calEvent.title}"`
      : "lead capture only"
  }

  Saved to .env.local. Run "npm run dev" and click "Talk to us".
──────────────────────────────────────────────
`)
} catch (err) {
  console.error(`\n✗ Provisioning failed:\n${err.message}\n`)
  process.exit(1)
}
