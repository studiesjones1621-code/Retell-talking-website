#!/usr/bin/env node
/**
 * Generates one hero photograph per niche with Gemini image models.
 *
 *   npm run generate:images
 *
 * The site renders perfectly without these — every hero falls back to the
 * gradient-and-grid treatment. Run this to swap in photographic artwork.
 *
 * Output lands in public/images/hero-{slug}.jpg. To actually use one, point the
 * niche at it in lib/niches.ts:
 *
 *   heroImage: "/images/hero-dental.jpg",
 *
 * Generated images are yours to use commercially. Photographs pulled from a
 * Google Images search are generally NOT — see the note in the README before
 * putting any found image on a live commercial site.
 */

import { mkdirSync, writeFileSync } from "node:fs"
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { business } from "../lib/business.ts"
import { niches } from "../lib/niches.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT_DIR = resolve(ROOT, "public/images")

/** Models are tried in order until one succeeds. */
const MODELS = ["gemini-3-pro-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"]

const PALETTE =
  "near-black neutral background, a single electric lime-green accent light, otherwise desaturated, premium editorial photography, dramatic low-key lighting, deep shadows, no text, no logos, no watermarks, no visible faces"

/**
 * Hero photographs, one per niche.
 *
 * Composition matters more than subject here: the headline sits over the left
 * third of the image and the copy is white, so every prompt asks for the
 * left side to stay dark and uncluttered. Anything busy there will fight the
 * type no matter how good the photo is.
 */
const HERO_SHOTS = {
  hvac: "A rooftop HVAC condenser unit at blue hour, technician's service light glowing lime-green against the dark metal, city skyline far behind, empty dark sky filling the left third of the frame",
  "law-firms":
    "A quiet law office at night, one desk lamp throwing lime-green light across a closed case file and a silent desk phone, tall dark shelves receding into shadow, the left third of the frame in near-darkness",
  dental:
    "A modern empty dental operatory at night, the overhead lamp off, a single lime-green accent light tracing the chair's edge, clinical surfaces clean and dark, the left third of the frame falling into shadow",
  medspa:
    "A serene empty aesthetic treatment room at night, soft lime-green light grazing a treatment bed and glass shelving, calm and expensive, the left third of the frame in deep shadow",
  "behavioral-health":
    "A calm empty therapy room at dusk, two facing armchairs, warm low light with a faint lime-green glow from a lamp, soft textures, reassuring rather than clinical, the left third of the frame quiet and dark",
}

const IMAGES = niches
  .filter((niche) => HERO_SHOTS[niche.slug])
  .map((niche) => ({
    file: `hero-${niche.slug}.jpg`,
    prompt: `Cinematic wide photograph for the hero of a website selling an AI receptionist to ${niche.name}. ${HERO_SHOTS[niche.slug]}. ${PALETTE}. 16:9 aspect ratio, shot on a full-frame camera at f/2.0.`,
  }))

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
  console.log(`\nGenerating ${IMAGES.length} niche heroes for ${business.name}…\n`)

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
