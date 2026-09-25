# Print collateral

A single trifold brochure covering all five niches plus the marketing services.
US Letter landscape, printed both sides.

## Rebuilding

```bash
npm i --no-save qrcode   # only needed if the QR codes must be regenerated
node print/qr.mjs        # writes print/qr-trifold.json
node print/trifold.mjs   # writes print/trifold.html
```

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
