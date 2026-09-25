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
      `${ORIGIN}/${slug}?utm_source=trifold&utm_medium=print&utm_campaign=${slug}`,
    ]),
  ),
  home: `${ORIGIN}?utm_source=trifold&utm_medium=print`,
  marketing: `${ORIGIN}/marketing?utm_source=trifold&utm_medium=print`,
}

// Level H tolerates a fold crease or a scuff across roughly a third of the code,
// which a pamphlet that lives in a van or a waiting room will collect.
const out = {}
for (const [key, url] of Object.entries(targets)) {
  out[key] = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 0,
    // Brand ink rather than pure black; against the white tile the contrast
    // ratio is still ~19:1, far beyond what any scanner needs.
    color: { dark: "#0b0c0e", light: "#ffffff" },
  })
}

fs.writeFileSync(path.join(root, "print/qr-trifold.json"), JSON.stringify(out, null, 2))
console.log(`wrote ${Object.keys(out).length} codes:`, Object.keys(out).join(", "))
