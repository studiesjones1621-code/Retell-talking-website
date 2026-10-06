/**
 * Open Graph images — the picture Facebook puts in a link preview card.
 *
 *   node print/og.mjs   → public/og/<slug>.png at 1200x630
 *
 * This is the clickable path. An image posted on its own is pixels: nothing in
 * it is tappable, and a phone cannot scan the screen it is displaying. A link
 * card is one big tap target, and it carries the artwork anyway — so posting
 * the URL beats posting the poster on any phone.
 *
 * 1200x630 is Facebook's card ratio. The 4:5 posters do not fit it; a landscape
 * crop of one would cut the headline, so the layout is built for the shape.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const src = fs.readFileSync(path.join(here, '..', 'lib', 'niches.ts'), 'utf8')
const field = (b, k) => {
  const m = b.match(new RegExp(`${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
  return m ? m[1].replace(/\\"/g, '"').replace(/\\'/g, "'") : null
}
const niches = src.split('\n  {').slice(1)
  .map(b => ({ slug: field(b,'slug'), name: field(b,'name'), headline: field(b,'headline') }))
  .filter(n => n.slug && n.headline)

const SIZE = { hvac: 68, 'law-firms': 62, dental: 70, medspa: 60, 'behavioral-health': 60 }
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;')

const card = (eyebrow, headline, size) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#0b0c0e;font-family:Poppins,system-ui,sans-serif;
       color:#fff;position:relative;overflow:hidden}
  body::before{content:"";position:absolute;inset:0;
    background-image:linear-gradient(#b6f23e0d 1px,transparent 1px),linear-gradient(90deg,#b6f23e0d 1px,transparent 1px);
    background-size:54px 54px}
  body::after{content:"";position:absolute;top:-200px;right:-160px;width:620px;height:620px;
    background:radial-gradient(circle,#b6f23e26,transparent 66%)}
  .wrap{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;padding:54px 62px 0}
  .brand{display:flex;align-items:center;gap:14px;font-weight:700;font-size:27px}
  .mark{width:34px;height:34px;flex:none}
  .body{flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:22px}
  .eyebrow{color:#b6f23e;font-weight:700;font-size:31px;letter-spacing:.07em;text-transform:uppercase}
  h1{margin-top:16px;font-weight:700;font-size:${size}px;line-height:1.06;letter-spacing:-.025em;
     max-width:1010px;text-wrap:balance}
  .foot{margin-left:-62px;margin-right:-62px;background:#b6f23e;color:#0b0c0e;padding:24px 62px 26px;
        display:flex;align-items:baseline;gap:22px}
  .cta{font-weight:700;font-size:40px;letter-spacing:-.02em}
  .sub{font-weight:600;font-size:22px;opacity:.74}
</style></head><body><div class="wrap">
  <div class="brand">
    <svg class="mark" viewBox="0 0 400 400" fill="none">
      <circle cx="200" cy="200" r="156" stroke="#b6f23e" stroke-width="34"/>
      <rect x="75" y="165" width="34" height="70" rx="17" fill="#b6f23e"/>
      <rect x="129" y="138" width="34" height="124" rx="17" fill="#b6f23e"/>
      <rect x="183" y="114" width="34" height="172" rx="17" fill="#b6f23e"/>
      <rect x="237" y="145" width="34" height="110" rx="17" fill="#b6f23e"/>
      <rect x="291" y="169" width="34" height="62" rx="17" fill="#b6f23e"/>
    </svg>OnDuty Agent</div>
  <div class="body">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1>${esc(headline)}</h1>
  </div>
  <div class="foot">
    <span class="cta">ondutyagent.com</span>
    <span class="sub">AI receptionists · websites · local SEO</span>
  </div>
</div></body></html>`

const out = path.join(here, '..', 'public', 'og')
fs.mkdirSync(out, { recursive: true })
const pages = niches.map(n => [n.slug, card(n.name, n.headline, SIZE[n.slug])])
pages.push(['default', card('Any business with a phone', 'The call you missed was a customer.', 68)])
pages.push(['marketing', card('Marketing', 'Websites that book. Marketing that gets you found.', 62)])
for (const [slug, html] of pages) fs.writeFileSync(path.join(out, `${slug}.html`), html)
console.log('wrote', pages.length, 'card sources to public/og/')
