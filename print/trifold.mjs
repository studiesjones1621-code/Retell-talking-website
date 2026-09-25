import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const qr = JSON.parse(fs.readFileSync(path.join(here, 'qr-trifold.json'), 'utf8'))

// One line each, and each has to name a DIFFERENT way the call is lost —
// urgency, unavailability, the caller not leaving a message, the caller needing
// an answer first, nerve. Two lines describing the same failure read as filler.
const NICHES = [
  ['hvac','HVAC','No heat at 2 a.m. Nobody waits until nine.'],
  ['law-firms','Law firms','You were in court. They called the next firm.'],
  ['dental','Dental','New patients don\u2019t leave voicemails.'],
  ['medspa','Med spas','A booking form can\u2019t answer \u201cwill it hurt?\u201d'],
  ['behavioral-health','Behavioral health','Someone finally worked up the courage to call.'],
]

const html = `<title>OnDuty Agent Trifold</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap">
<style>
  :root{
    color-scheme:light;
    --ink:#0b0c0e; --ink-2:#14161a; --paper:#fff;
    --lime:#b6f23e; --lime-dim:#8fc22e;
    --on-dark:#c9ced5; --on-dark-soft:#9aa1aa;
    --desk:#d9dbde;
    --on-light:#4b5058;
  }
  body{ background:var(--desk); color:var(--ink);
        font-family:'Host Grotesk',system-ui,-apple-system,sans-serif; margin:0; }

  .intro{ max-width:52rem; margin-inline:auto; padding-block:2.5rem 0; padding-inline:16px; }
  .intro h1{ font-size:1.6rem; font-weight:700; letter-spacing:-.02em; margin:0 0 .5rem; }
  .intro p{ color:#3c4148; line-height:1.55; margin:0 0 .4rem; max-width:64ch; }
  .intro code{ font-family:'JetBrains Mono',ui-monospace,monospace; font-size:.85em;
               background:#fff; border:1px solid #e3e5e8; border-radius:4px; padding:.1em .35em; }
  .sheet-label{ max-width:11in; margin:2.2rem auto .5rem; padding-inline:16px;
                font-family:'JetBrains Mono',ui-monospace,monospace; font-size:.7rem;
                letter-spacing:.14em; text-transform:uppercase; color:#4a4f56; }

  .stack{ display:flex; flex-direction:column; align-items:center; gap:.6rem;
          padding-block:1rem 3.5rem; padding-inline:16px; }

  .sheet{ width:11in; height:8.5in; flex:none; display:grid; background:var(--ink);
          box-shadow:0 14px 40px rgba(11,12,14,.3); transform-origin:top center; overflow:hidden; }
  .sheet.outside{ grid-template-columns:3.625in 3.6875in 3.6875in; grid-template-rows:8.5in; }
  .sheet.inside { grid-template-columns:3.6875in 3.6875in 3.625in; grid-template-rows:8.5in; }
  @media (max-width:11.5in){ .sheet{ transform:scale(var(--fit,.62)); margin-bottom:calc(-8.5in * (1 - var(--fit,.62))); } }
  @media (max-width:760px){ .sheet{ --fit:.40; } }

  /* Every panel is dark. Alternating the two inks keeps the folds visible
     without a rule, so the piece reads as three panels, not one black slab. */
  .panel{ padding:.4in .34in .34in; min-height:0; overflow:hidden; display:flex; flex-direction:column;
          position:relative; isolation:isolate; color:#fff; background:var(--ink); }
  .panel.alt{ background:var(--ink-2); }
  .panel::before{ content:""; position:absolute; inset:0; z-index:-2;
    background-image:
      linear-gradient(to right, rgba(182,242,62,.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(182,242,62,.07) 1px, transparent 1px);
    background-size:.38in .38in; }
  .panel.glow::after{ content:""; position:absolute; inset:0; z-index:-1;
    background:radial-gradient(85% 65% at 72% 4%, rgba(182,242,62,.26), transparent 72%); }

  .tag{ position:absolute; top:.13in; left:.34in; font-family:'JetBrains Mono',ui-monospace,monospace;
        font-size:7px; letter-spacing:.16em; text-transform:uppercase; color:#5a606a; }

  .brand{ display:flex; align-items:center; gap:.4rem; font-weight:700; font-size:.92rem; letter-spacing:-.015em; }
  .dot{ width:.58rem; height:.58rem; border-radius:50%; background:var(--lime);
        box-shadow:0 0 0 .17rem rgba(182,242,62,.2); flex:none; }

  .eyebrow{ margin:0 0 .5rem; font-size:.64rem; font-weight:700; letter-spacing:.2em;
            text-transform:uppercase; color:var(--lime); }

  h2.cover{ margin:.6rem 0 0; font-size:2.75rem; line-height:.98; letter-spacing:-.045em;
            font-weight:800; text-wrap:balance; }
  h3{ margin:0 0 .28rem; font-size:1.62rem; line-height:1.02; letter-spacing:-.04em;
      font-weight:800; text-wrap:balance; }
  p.body{ margin:0; font-size:.8rem; line-height:1.48; color:var(--on-dark); }
  .sub{ margin:.5rem 0 0; font-size:.86rem; line-height:1.42; color:var(--on-dark); max-width:30ch; }

  /* The one loud element per panel: lime block, ink type. */
  .punch{ display:inline-block; background:var(--lime); color:var(--ink);
          font-size:.92rem; font-weight:800; letter-spacing:-.022em; line-height:1.14;
          padding:.1in .14in; margin:.18in 0 .17in; max-width:100%; text-wrap:balance; }

  .rows{ list-style:none; margin:0; padding:0; display:grid; gap:.128in; }
  .rows li{ display:grid; grid-template-columns:.11in 1fr; gap:.14in; align-items:start; }
  .rows li::before{ content:""; width:.11in; height:.11in; margin-top:.06in; background:var(--lime); }
  .rows b,.rows span{ grid-column:2; }
  .rows b{ font-size:.87rem; font-weight:700; letter-spacing:-.018em; line-height:1.2; }
  .rows span{ display:block; margin-top:.035in; font-size:.735rem; line-height:1.4; color:var(--on-dark-soft); }

  .steps{ list-style:none; margin:0; padding:0; counter-reset:s; display:grid; gap:.22in; }
  .steps li{ counter-increment:s; display:grid; grid-template-columns:.32in 1fr; gap:.13in; }
  .steps li::before{ content:counter(s,decimal-leading-zero);
    font-family:'JetBrains Mono',ui-monospace,monospace; font-weight:700;
    font-size:.82rem; color:var(--lime); }
  .steps b,.steps span{ grid-column:2; }
  .steps b{ display:block; font-size:.88rem; font-weight:700; letter-spacing:-.018em; }
  .steps span{ display:block; margin-top:.035in; font-size:.735rem; line-height:1.4; color:var(--on-dark-soft); }

  .niches{ list-style:none; margin:0; padding:0; display:grid; gap:.105in; }
  .niches li{ display:grid; grid-template-columns:1fr .68in; gap:.13in; align-items:center;
              border-top:1px solid rgba(255,255,255,.13); padding-top:.105in; }
  .niches li:first-child{ border-top:0; padding-top:0; }
  .niches b{ display:block; font-size:.9rem; font-weight:700; letter-spacing:-.022em; }
  .niches span{ display:block; margin-top:.03in; font-size:.685rem; line-height:1.3; color:var(--on-dark-soft); }

  /* QR tiles are white blocks on dark — they read as the brightest thing on
     the panel, which is exactly where the eye should land. */
  .tile{ background:#fff; padding:.07in; border-radius:2px; }
  .tile svg{ width:100%; height:100%; display:block; }
  .niches .tile{ width:.68in; height:.68in; }
  .tile-lg{ width:1.62in; height:1.62in; }

  .spacer{ flex:1; min-height:.08in; }
  .scan{ margin:.18in 0 0; font-size:.86rem; font-weight:700; line-height:1.24; letter-spacing:-.022em; }
  .url{ margin:.06in 0 0; font-family:'JetBrains Mono',ui-monospace,monospace;
        font-size:.63rem; color:var(--on-dark-soft); }
  .rule{ height:1px; background:rgba(255,255,255,.14); margin:.16in 0; }
  .contact{ display:grid; gap:.06in; font-size:.82rem; font-weight:600; }
  .fineprint{ font-size:.63rem; line-height:1.36; color:var(--on-dark-soft); }

  @media print{
    @page{ size:letter landscape; margin:0; }
    body{ background:#fff; }
    .intro,.sheet-label{ display:none; }
    .stack{ display:block; padding:0; }
    .sheet{ transform:none; margin:0; box-shadow:none; break-after:page; }
    .sheet:last-child{ break-after:auto; }
    .tag{ display:none; }
    *{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
  @media (prefers-reduced-motion:reduce){ *{ animation:none!important; transition:none!important; } }
</style>

<div class="intro">
  <h1>Trifold, both sides</h1>
  <p>US Letter landscape. Print <b>double-sided, flip on short edge</b>, paper Letter, margins None, and tick “Background graphics” — every panel is dark now, so without that you get six blank pages.</p>
  <p>Fold the right third in first, then the left third over it. The narrow panel is 1/16in shy of the others so it clears the fold.</p>
  <p>Full-bleed dark is heavy on a home printer. For any quantity, a print shop on 100lb gloss is cheaper per piece and looks like what this is meant to be.</p>
</div>

<p class="sheet-label">Sheet 1 — outside</p>
<div class="stack">
  <section class="sheet outside">

    <div class="panel alt">
      <span class="tag">Inner flap</span>
      <p class="eyebrow">Who it's for</p>
      <h3>Five industries.<br>Five receptionists.</h3>
      <p class="punch">Scan yours. Talk to the one built for it.</p>
      <ul class="niches">
        ${NICHES.map(([slug,name,line]) => `<li>
          <div><b>${name}</b><span>${line}</span></div>
          <div class="tile">${qr[slug]}</div>
        </li>`).join('')}
      </ul>
      <div class="spacer"></div>
      <div class="rule"></div>
      <p class="fineprint">No scanner? Go to <b style="color:#fff">ondutyagent.com</b> and pick your industry. Not on this list — plumbing, roofing, veterinary, any clinic — the same build works. Ask us.</p>
    </div>

    <div class="panel">
      <span class="tag">Back panel</span>
      <div class="brand"><span class="dot"></span>OnDuty Agent</div>
      <div class="rule"></div>
      <p class="eyebrow">Also from us</p>
      <h3>Once the phone is handled, fill it.</h3>
      <p class="body" style="margin-top:.13in">Websites built to book appointments. Local SEO that gets you into the map pack.</p>
      <p class="punch">We answer the phone at the other end — so we can prove which marketing produced a booking, not just a click.</p>
      <ul class="rows" style="margin-top:.04in">
        <li><b>Sites built around the call</b><span>Tap-to-call everywhere, booking above the fold, fast on a phone.</span></li>
        <li><b>Google Business Profile</b><span>The listing most people find you through, kept current.</span></li>
        <li><b>Local SEO</b><span>Service pages and map-pack work for the towns you cover.</span></li>
        <li><b>One invoice</b><span>Receptionist and marketing together, or either alone.</span></li>
      </ul>
      <div class="spacer"></div>
      <div class="rule"></div>
      <div class="contact">
        <span style="color:var(--lime)">hello@ondutyagent.com</span>
        <span>ondutyagent.com</span>
      </div>
      <p class="fineprint" style="margin:.16in 0 0">Practices and contractors across the United States. Healthcare builds run under a signed BAA.</p>
    </div>

    <div class="panel glow">
      <span class="tag">Front cover</span>
      <div class="brand"><span class="dot"></span>OnDuty Agent</div>
      <h2 class="cover">Never miss another call.</h2>
      <p class="sub">An AI receptionist that answers in one ring, books the appointment and captures the lead. 24 hours a day, in the language of your industry.</p>
      <div class="spacer"></div>
      <div class="tile tile-lg">${qr.home}</div>
      <p class="scan">Scan it. Talk to the receptionist yourself.</p>
      <p class="url">It picks up immediately.</p>
    </div>

  </section>
</div>

<p class="sheet-label">Sheet 2 — inside</p>
<div class="stack">
  <section class="sheet inside">

    <div class="panel glow">
      <span class="tag">Inside left</span>
      <p class="eyebrow">What it does</p>
      <h3>The whole front-desk job, at 3 a.m.</h3>
      <p class="punch">Answers in one ring. Every time. Including the ones you’re sleeping through.</p>
      <ul class="rows">
        <li><b>Books into your calendar</b><span>Real availability, on the call — not a callback promise.</span></li>
        <li><b>Knows what is urgent</b><span>Emergencies follow your protocol. Routine work gets scheduled.</span></li>
        <li><b>Transfers to the right person</b><span>Trained on your roster, so it reaches whoever actually covers it.</span></li>
        <li><b>Hands over a completed intake</b><span>Your callback starts informed, not from a name on a message pad.</span></li>
        <li><b>Reminders, then the review ask</b><span>Cuts no-shows, then invites the review once the appointment passes.</span></li>
        <li><b>Filters the spam</b><span>Robocalls never reach your team.</span></li>
      </ul>
      <div class="spacer"></div>
      <p class="punch" style="margin-bottom:0">It does not replace your front desk. It makes sure the desk is never the reason a call went unanswered.</p>
    </div>

    <div class="panel alt">
      <span class="tag">Inside middle</span>
      <p class="eyebrow">Why not an answering service</p>
      <h3>A message is not a booked appointment.</h3>
      <p class="punch">Three people calling at once is three calls answered — not two voicemails.</p>
      <ul class="rows">
        <li><b>It speaks your industry</b><span>A general-purpose bot hears "slip and fall" and takes a message.</span></li>
        <li><b>It does not have an off day</b><span>A front desk at 4:55 on a Friday is not the same as 9 a.m. Monday.</span></li>
        <li><b>It does not take the call home</b><span>It absorbs the volume your people should not have to.</span></li>
      </ul>
      <div class="rule"></div>
      <p class="eyebrow">And it stays yours</p>
      <ul class="rows">
        <li><b>Built around how you work</b><span>Your services, your prices, your own rules for what counts as an emergency. Not a template with your name dropped into it.</span></li>
        <li><b>Change anything, same day</b><span>New hours, new pricing, a new rule. Nothing for you to log into.</span></li>
        <li><b>Your customer records stay yours</b><span>You decide what is kept, and for how long. Say the word and it is deleted.</span></li>
      </ul>
    </div>

    <div class="panel">
      <span class="tag">Inside right — tucks in</span>
      <p class="eyebrow">How it works</p>
      <h3>Live in about two weeks.</h3>
      <p class="punch">On your existing number. No new hardware.</p>
      <ol class="steps">
        <li><b>We know your business</b><span>One call. Your services, your pricing, what counts as an emergency and who it reaches.</span></li>
        <li><b>We build it, you break it</b><span>You get a number to call and test until it sounds like the person you would have hired.</span></li>
        <li><b>It goes live</b><span>All calls, after-hours only, or just the ones your team cannot get to.</span></li>
      </ol>
      <p class="punch" style="margin-top:.24in">Month to month. If it is not earning its keep, you stop.</p>
      <div class="spacer"></div>
      <div class="rule"></div>
      <div style="display:grid;grid-template-columns:1fr .82in;gap:.14in;align-items:center">
        <div>
          <p class="eyebrow" style="margin-bottom:.06in">Marketing too</p>
          <p class="body" style="font-size:.745rem">Websites that book, and local SEO that gets you found.</p>
        </div>
        <div class="tile" style="width:.82in;height:.82in">${qr.marketing}</div>
      </div>
    </div>

  </section>
</div>
`
fs.writeFileSync(path.join(here, 'trifold.html'), html)
console.log('rebuilt —', (html.length/1024).toFixed(0)+'kb')
