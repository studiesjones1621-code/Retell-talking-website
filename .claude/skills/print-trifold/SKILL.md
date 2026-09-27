---
name: print-trifold
description: Build print collateral — tri-fold brochures, flyers, leave-behinds, rack cards — as an HTML page that renders to a press-ready PDF, with scannable QR codes pointing at live site pages. Use this whenever the user asks for a pamphlet, brochure, trifold, flyer, handout, leave-behind, or anything to hand out or print, and whenever they want QR codes on printed material. Also use it when editing copy on an existing print piece, because the panel-fit and QR-size checks here catch failures that are invisible on screen and unfixable once something is printed. Covers panel geometry, the silent overflow trap, the QR module-size floor, and getting files through a print shop's uploader.
---

# Print collateral that survives contact with a printer

The output is an HTML page that prints correctly, plus a PDF and 300dpi PNGs
generated from it. HTML is the right source because copy changes constantly and
editing text in a design tool is slow — but a browser will happily render
something that is broken on paper, so most of this skill is about the checks
that catch that.

Three failures matter more than anything aesthetic, because each one is only
discovered after money is spent:

1. Content silently cropped at the fold
2. A QR code too small to scan
3. Panels printing white because a checkbox was off

## Build it as a generator, not a file

Write `<name>.mjs` that emits `<name>.html`. Copy gets revised many times; a
generator means the QR data, the panel list and the layout live in one place and
a rebuild is one command. Commit both — the HTML is what a non-developer opens
and prints.

Keep QR payloads in a separate JSON file produced by its own script, so
regenerating codes and regenerating layout are independent.

## Panel geometry

For a US Letter tri-fold, landscape, folding right-third-in-then-left:

| Sheet   | Left     | Middle   | Right    |
| ------- | -------- | -------- | -------- |
| outside | 3.625in  | 3.6875in | 3.6875in |
| inside  | 3.6875in | 3.6875in | 3.625in  |

The narrow panel is 1/16in shy so it clears the fold when tucked. It is on
opposite sides of the two sheets because the sheet flips. Getting this backwards
produces a piece that will not close flat, and it is not visible on screen.

Reading order when folded: front cover first, then the inner flap the moment
they open it, then the inside spread, then the back panel. Put the hook on the
cover and the thing you most want scanned on the flap.

## The overflow trap — check this on every copy change

A CSS grid row sizes to its tallest child. If the sheet has `overflow:hidden`
(and it needs to, to clip at the page edge), a panel taller than the sheet is
cropped **with no visible error** — the browser shows a clean page and the
bottom of the panel is simply gone. This has already shipped a brochure with a
sentence cut mid-word.

Pin the row and give panels `min-height:0`:

```css
.sheet.outside{ grid-template-columns:3.625in 3.6875in 3.6875in; grid-template-rows:8.5in; }
.panel{ min-height:0; overflow:hidden; }
```

Then measure after every edit — `scrollHeight > clientHeight` means cropped:

```js
[...document.querySelectorAll('.panel')].map(el =>
  `${el.querySelector('.tag').textContent}: ${el.scrollHeight > el.clientHeight
    ? 'OVER by ' + (el.scrollHeight - el.clientHeight) + 'px' : 'fits'}`)
```

Run it headless via Playwright on every rebuild. When a panel is over, prefer
cutting a redundant line to shrinking type — copy that repeats the bullet below
it is almost always the thing to lose.

## QR codes: module size is the whole game

What decides whether a phone can read a code is the **module** (one little
square), not the error-correction level. The floor is about **0.5mm per
module**; below that it fails in real conditions even though it decodes fine
from a screenshot.

    module_mm = printed_size_inches × 25.4 / module_count

A real failure from this repo: `/behavioral-health` with full UTM tags at level
H produced 57 modules at 0.68in — 0.30mm each. It did not scan. The other four
codes sat at 0.33–0.35mm and worked only by luck.

Three levers, in order of what to try first:

- **Shorten the URL.** Every character adds modules. Drop parameters that
  duplicate information already in the path — `utm_campaign=dental` on
  `/dental` tells you nothing new, and `utm_medium=print` restates
  `utm_source=trifold`. This alone took 57 modules to 37.
- **Lower error correction.** Level Q keeps 25% recovery, plenty for paper, and
  is far smaller than H. A bigger code at Q beats a tiny one at H every time.
- **Print it larger.** Cheapest fix if the panel has room.

Verify by decoding at the size it actually prints, not at a comfortable preview
size. Render at `printed_inches × 300` pixels and run it through a real decoder
(`jsqr` plus `pngjs`). A 300px preview passing tells you the data is right and
nothing about whether a camera can read it.

Crop **one code per image** when decoding — decoders return a single result, so
a strip containing five codes reports one and looks like four failures.

Keep codes in white tiles with a quiet zone. On a dark panel this reads as
deliberate design and scanners need that border.

## Dark, full-bleed designs

A dark piece looks far more expensive than a light one and is worth it. Two
consequences:

- Every panel needs `print-color-adjust: exact`, and the person printing must
  enable **Background graphics**. Without it they get blank pages, so say it
  every time you hand over the file.
- Heavy coverage is where cheap output bands and streaks. Recommend a digital
  press on 100lb gloss text and a proof before any run. On an inkjet it is
  slow, expensive in ink, and cockles the paper — steer home printing toward a
  light variant instead.

Colors that assume a white ground all need dark-ground variants: secondary text,
hairlines, rules, and any accent that is unreadable as text on white.

## Output files

```js
await page.pdf({ path, width:'11in', height:'8.5in',
                 printBackground:true, margin:{top:0,right:0,bottom:0,left:0} })
```

Explicit `width`/`height` beats `format:'Letter', landscape:true` for a fixed
layout. Verify the result is 792×612pt and rasterize a page to confirm it is not
blank before handing it over.

**Print shop uploaders often rasterize the PDF at screen resolution and then
warn you it is low quality.** When that happens, render 300dpi PNGs from the
PDF and upload those instead:

```python
pix = pymupdf.open(pdf)[i].get_pixmap(dpi=300)   # 11x8.5in -> 3300x2550px
```

Re-verify the QR codes decode from the raster before sending.

## Handover checklist

Give the person all of it, every time:

- Double-sided, **flip on short edge**
- Margins **None**, **Background graphics on**
- Print at **100% — no scaling or fit-to-page**. Scaling a full-bleed dark
  design adds a white frame to every panel and shifts the fold math.
- Scan one code **off the printed proof** before the full run

## Copy that works on paper

Print has no hover, no scroll, no follow-up. Lessons that came from a real
reviewer rejecting lines:

- **Give each point a different failure mode.** Five bullets describing the same
  problem read as one line copy-pasted. Urgency, unavailability, the caller not
  leaving a message, the caller needing an answer first — different mechanisms.
- **Never assume something false about the reader's business.** "You were in
  court, they called the next firm" insults any firm that has a receptionist
  covering exactly that. Claims the reader can rebut in their head are worse
  than no claim.
- **Do not raise a topic you cannot close in eight words.** "Your customer
  records stay yours" makes them wonder what records, kept where, who sees them
  — a conversation for a call, not a panel.
- **Cut your own jargon.** Above the fold, map-pack, SEO, tap-to-call are all
  industry vocabulary. The reader has their own.
- **Watch for claims that depend on configuration.** "We can prove which
  marketing produced a booking" is false the moment a client runs the agent
  after-hours only.
- **A fact with no consequence is not a selling point.** "Your front desk is
  already busy" — and so? Add the *and so*.
