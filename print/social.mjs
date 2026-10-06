/**
 * Social posters, one per niche plus a general one.
 *
 *   node print/social.mjs      → print/social/*.png at 1080x1350
 *
 * 4:5 rather than square: it is the tallest ratio a Facebook feed allows, so
 * it occupies the most screen on a scroll. That is free reach.
 *
 * Copy comes from lib/niches.ts so a poster cannot drift from the page its
 * reader lands on — the same reason print/qr.mjs reads the slugs from there.
 * Headline sizes are set per poster because the lines differ in length and one
 * size would either shrink the short ones or overflow the long ones.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const src = fs.readFileSync(path.join(here, '..', 'lib', 'niches.ts'), 'utf8')

const field = (block, key) => {
  const m = block.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
  return m ? m[1].replace(/\\"/g, '"').replace(/\\'/g, "'") : null
}
const niches = src.split('\n  {').slice(1)
  .map(b => ({ slug: field(b,'slug'), name: field(b,'name'),
               headline: field(b,'headline'), subcopy: field(b,'subcopy') }))
  .filter(n => n.slug && n.headline)

/* What each trade actually loses, in their words — the proof line under the hook. */
const PROOF = {
  hvac:     ['Answers the 2 a.m. no-heat call', 'Sorts emergencies from tune-ups', 'Books straight into dispatch'],
  'law-firms': ['Answers every weekend intake', 'Screens the matter before you call back', 'Never gives legal advice'],
  dental:   ['Answers while your team is chairside', 'Fills the cancellation', 'Books into your schedule'],
  medspa:   ['Answers the 11 p.m. enquiry', 'Talks them through the treatment menu', 'Books before the impulse fades'],
  'behavioral-health': ['Answers with patience, every time', 'Recognises a crisis when it hears one', 'Books the intake'],
}
const SIZE = { hvac: 92, 'law-firms': 84, dental: 96, medspa: 82, 'behavioral-health': 80 }

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;')

const page = (eyebrow, headline, proof, size, lede) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;background:#0b0c0e;font-family:Poppins,system-ui,sans-serif;
       color:#fff;position:relative;overflow:hidden}
  /* the same faint grid and corner glow the site and the trifold use */
  body::before{content:"";position:absolute;inset:0;
    background-image:linear-gradient(#b6f23e0d 1px,transparent 1px),linear-gradient(90deg,#b6f23e0d 1px,transparent 1px);
    background-size:60px 60px}
  body::after{content:"";position:absolute;top:-180px;right:-180px;width:700px;height:700px;
    background:radial-gradient(circle,#b6f23e26,transparent 66%)}
  .wrap{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;padding:72px 68px 0}
  .brand{display:flex;align-items:center;gap:16px;font-weight:700;font-size:30px;letter-spacing:-.01em}
  .mark{width:38px;height:38px;flex:none}
  /* Centred between the lockup and the footer bar: with the bullets pinned to
     the top the poster read as half-empty on a phone. */
  .body{flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:30px}
  /* The industry name is what makes someone in a trade group stop scrolling —
     it should read before the headline does, so it is set large. Tracking comes
     down as the size goes up; .2em is for small caps, not for 46px. */
  .eyebrow{color:#b6f23e;font-weight:700;font-size:46px;line-height:1.1;
           letter-spacing:.06em;text-transform:uppercase}
  h1{margin-top:22px;font-weight:700;font-size:${size}px;line-height:1.04;letter-spacing:-.025em;text-wrap:balance}
  .lede{margin-top:26px;font-size:34px;line-height:1.38;color:#9aa1aa;max-width:860px}
  ul{margin-top:46px;list-style:none;display:grid;gap:26px}
  li{display:grid;grid-template-columns:16px 1fr;gap:22px;align-items:start;
     font-size:33px;line-height:1.3;color:#e3e5e8}
  .dot{width:16px;height:16px;margin-top:11px;background:#b6f23e;border-radius:3px}
  .foot{margin-top:auto;margin-left:-68px;margin-right:-68px;background:#b6f23e;color:#0b0c0e;
        padding:46px 68px 50px}
  .cta{font-weight:700;font-size:76px;letter-spacing:-.025em;line-height:1}
  .sub{margin-top:14px;font-weight:600;font-size:30px;opacity:.78}
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
    ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
    <ul>${proof.map(p=>`<li><span class="dot"></span><span>${esc(p)}</span></li>`).join('')}</ul>
  </div>
  <div class="foot">
    <div class="cta">ondutyagent.com</div>
    <div class="sub">AI receptionists · websites · local SEO</div>
  </div>
</div></body></html>`

const out = path.join(here, 'social')
fs.mkdirSync(out, { recursive: true })
const firstSentence = (t) => {
  const m = (t || '').match(/^[^.]*\./)
  return m ? m[0].trim() : null
}
const pages = []
for (const n of niches) {
  pages.push([n.slug, page(n.name, n.headline, PROOF[n.slug], SIZE[n.slug],
    firstSentence(n.subcopy))])
}
pages.push(['general', page('Any business with a phone', 'The call you missed was a customer.',
  ['Answers every call in one ring','Books it into your calendar','24 hours a day, every day'], 92,
  'Every call answered in one ring, booked into your calendar, around the clock.')])
for (const [slug, html] of pages) fs.writeFileSync(path.join(out, `${slug}.html`), html)
console.log('wrote', pages.length, 'poster sources to print/social/')
