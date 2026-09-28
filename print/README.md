# Print collateral

A single trifold brochure covering all five niches plus the marketing services.
US Letter landscape, printed both sides.

## Rebuilding

```bash
npm i --no-save qrcode            # only if the QR codes must be regenerated
node print/qr.mjs                 # writes print/qr-trifold.json
node print/trifold.mjs            # writes print/trifold.html          (full bleed)
node print/trifold.mjs --no-bleed # writes print/trifold-nobleed.html  (white border)
```

## Which file to print

**Full bleed** (`trifold.html`) — ink runs to the paper edge. Needs a press that
prints oversize and trims down. Most print shops can; most office printers and
some in-store services cannot.

**No bleed** (`trifold-nobleed.html`) — a 0.25in white border is built into the
artwork. Use this whenever the printer cannot bleed, because otherwise their
unprintable strip becomes a ragged, usually uneven white frame around a dark
design and it looks like a mistake.

The margin comes out of the **outer panels only**. Folds sit at fixed distances
from the paper edge (3.625in and 7.3125in); take the margin off the middle panel
too and the ink boundaries stop landing on the fold lines. The no-bleed build
also tightens padding and list spacing to recover the half inch of height the
margin costs — the QR tiles are deliberately left at full size, since shrinking
those is what makes a code unscannable.

Open `print/trifold.html` in a browser to print it. `qrcode` is deliberately not
a project dependency — the site does not use it, and the codes only change when
the niches or the domain do.

## Printing

Double-sided, **flip on short edge**, paper Letter, margins **None**, and
**Background graphics** enabled. Every panel is dark, so without that last
setting the printer drops the ink and you get blank pages.

Fold the right third in first, then the left third over it.

## Panel geometry

Sheet 1 is the outside, sheet 2 the inside. Column widths differ between them
because the panel that tucks inside has to clear the fold:

| Sheet   | Left     | Middle   | Right    |
| ------- | -------- | -------- | -------- |
| outside | 3.625in  | 3.6875in | 3.6875in |
| inside  | 3.6875in | 3.6875in | 3.625in  |

The grid row is pinned to `8.5in`. Without that the row sizes to its tallest
panel and the sheet's `overflow:hidden` silently crops the bottom of every
panel — content disappears with no visible error. If copy is edited, check that
each panel still fits:

```js
// in devtools, with trifold.html open
[...document.querySelectorAll('.panel')].map(el =>
  [el.querySelector('.tag').textContent, el.scrollHeight - el.clientHeight])
```

Anything above `0` is being cropped.

## QR codes

`print/qr.mjs` reads the niche slugs out of `lib/niches.ts` rather than
repeating them. `app/[niche]/page.tsx` sets `dynamicParams = false`, so a slug
that drifts from that list 404s rather than rendering — which on a printed
pamphlet cannot be fixed after the fact. Regenerate the codes after any change
to the niche list or the domain.

Each code carries UTM parameters (`utm_source=trifold`), which only get recorded
if an analytics provider is configured — see `components/analytics.tsx`.
