/**
 * Regenerates the trifold's QR codes.
 *
 *   npx qrcode@1 --help >/dev/null   # ensure the dep is fetchable
 *   npm i --no-save qrcode && node print/qr.mjs
 *
 * The niche slugs are read out of lib/niches.ts rather than repeated here.
 * app/[niche]/page.tsx sets `dynamicParams = false`, so a slug that drifts from
 * that list does not render a thin page — it 404s. On a printed pamphlet that
 * is unrecoverable, so the two must come from one source.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import QRCode from "qrcode"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ORIGIN = "https://ondutyagent.com"

const source = fs.readFileSync(path.join(root, "lib/niches.ts"), "utf8")
const slugs = [...source.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)].map((m) => m[1])
if (slugs.length === 0) throw new Error("no slugs found in lib/niches.ts — did the shape change?")

const targets = {
  ...Object.fromEntries(
    slugs.map((slug) => [
      slug,
      `${ORIGIN}/${slug}?utm_source=trifold`,
    ]),
  ),
  home: `${ORIGIN}?utm_source=trifold`,
  marketing: `${ORIGIN}/marketing?utm_source=trifold`,
}

// Module size, not error correction, is what decides whether a phone can read
// this. The niche codes print at 0.85in, so every extra character of URL shrinks
// the modules. Level H plus the full UTM set gave 57 modules on the longest slug
// — 0.38mm each, under the ~0.5mm a phone camera needs, and that code did not
// scan. Level Q with a trimmed URL is 37 modules and 0.58mm, still 25% recovery.
//
// The dropped parameters cost nothing: utm_campaign only repeated the slug that
// is already in the path, and utm_medium only repeated utm_source=trifold.
const out = {}
for (const [key, url] of Object.entries(targets)) {
  out[key] = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "Q",
    margin: 0,
    // Brand ink rather than pure black; against the white tile the contrast
    // ratio is still ~19:1, far beyond what any scanner needs.
    color: { dark: "#0b0c0e", light: "#ffffff" },
  })
}

fs.writeFileSync(path.join(root, "print/qr-trifold.json"), JSON.stringify(out, null, 2))
console.log(`wrote ${Object.keys(out).length} codes:`, Object.keys(out).join(", "))
