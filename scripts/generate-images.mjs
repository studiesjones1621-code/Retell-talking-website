#!/usr/bin/env node
/**
 * Generates the site's key visuals with Gemini (Nano Banana) image models.
 *
 *   npm run generate:images
 *
 * The site renders perfectly without these — the hero and section backgrounds
 * use CSS gradient/grid treatments by default. Run this to swap in photographic
 * artwork once you have Gemini image quota available.
 *
 * Output lands in public/images/. To use a generated hero, set the background
 * image on the hero section in components/hero.tsx.
 */

import { mkdirSync, writeFileSync } from "node:fs"
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { business } from "../lib/business.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT_DIR = resolve(ROOT, "public/images")

/** Models are tried in order until one succeeds. */
const MODELS = ["gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"]

const PALETTE =
  "deep midnight navy background, signal teal accent light, cool desaturated tones, premium editorial photography, dramatic low-key lighting, no text, no logos, no watermarks"

const IMAGES = [
  {
    file: "hero-bg.jpg",
    prompt: `Cinematic wide photograph for the hero of an AI answering service website. A calm, modern, empty reception desk at night lit by a soft glowing teal waveform of light arcing through the dark air above it. ${PALETTE}. 16:9 aspect ratio.`,
  },
  {
    file: "service-receptionist.jpg",
    prompt: `Close-up photograph of a sleek modern desk phone and headset on a dark surface, softly rim-lit in teal, shallow depth of field. ${PALETTE}. Square aspect ratio.`,
  },
  {
    file: "service-booking.jpg",
    prompt: `Overhead photograph of a clean minimal calendar on a tablet screen glowing softly on a dark desk, one appointment slot highlighted in teal. ${PALETTE}. Square aspect ratio.`,
  },
  {
    file: "why-us.jpg",
    prompt: `Abstract photograph of concentric sound waves rendered as thin glowing teal rings expanding through dark space, elegant and minimal. ${PALETTE}. Wide 16:9 aspect ratio.`,
  },
]

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  const envPath = resolve(ROOT, ".env.local")
  if (!existsSync(envPath)) return null
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/)
    if (m) return m[1].replace(/^["']|["']$/g, "").trim()
  }
  return null
}

const API_KEY = loadKey()

if (!API_KEY) {
  console.error("✗ GEMINI_API_KEY is missing. Add it to .env.local and re-run.")
  process.exit(1)
}

async function generate(prompt) {
  let lastError = "no models attempted"

  for (const model of MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      },
    )

    if (!res.ok) {
      lastError = `${model} → ${res.status} ${(await res.text()).slice(0, 200)}`
      continue
    }

    const json = await res.json()
    const parts = json?.candidates?.[0]?.content?.parts ?? []
    const image = parts.find((p) => p.inlineData?.data ?? p.inline_data?.data)
    const data = image?.inlineData?.data ?? image?.inline_data?.data

    if (data) return { buffer: Buffer.from(data, "base64"), model }
    lastError = `${model} returned no image data`
  }

  throw new Error(lastError)
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  console.log(`\nGenerating imagery for ${business.name}…\n`)

  let ok = 0
  for (const image of IMAGES) {
    process.stdout.write(`→ ${image.file} … `)
    try {
      const { buffer, model } = await generate(image.prompt)
      writeFileSync(resolve(OUT_DIR, image.file), buffer)
      console.log(`✓ (${model}, ${(buffer.length / 1024).toFixed(0)} KB)`)
      ok += 1
    } catch (err) {
      console.log(`✗ ${err.message}`)
    }
  }

  console.log(
    `\n${ok}/${IMAGES.length} generated into public/images/.` +
      (ok < IMAGES.length
        ? "\nFailures are usually Gemini free-tier quota (HTTP 429) — retry later.\n"
        : "\n"),
  )
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}\n`)
  process.exit(1)
})
