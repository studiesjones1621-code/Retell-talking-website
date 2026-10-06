# Print collateral

A single trifold brochure covering all five niches plus the marketing services.
US Letter landscape, printed both sides.

## Rebuilding

```bash
npm i --no-save qrcode            # only if the QR codes must be regenerated
node print/qr.mjs                 # writes print/qr-trifold.json
node print/trifold.mjs            # writes print/trifold.html          (full bleed)
node print/trifold.mjs --press    # writes print/trifold-press.html    (bleed for a trade printer)
node print/trifold.mjs --no-bleed # writes print/trifold-nobleed.html  (white border kept)
node print/trifold.mjs --trim     # writes print/trifold-trim.html     (border cut off)
```

## Which file to send

For an online printer, send the PDFs — one page each, already split the way
their upload form asks for it:

| File | What it is |
| --- | --- |
| `OnDutyAgent-trifold-FRONT-outside.pdf` | the face you see folded: cover, niche QRs, marketing |
| `OnDutyAgent-trifold-BACK-inside.pdf` | the three inside panels |
| `OnDutyAgent-trifold-8.5x11-with-bleed.pdf` | both pages in one file, for a shop that wants that |

All three are 11.125 x 8.625in and trim to 11 x 8.5in. GotPrint's prepress
stated that bleed size in writing; their own template graphic says 0.125in per
side, which would be 11.25 x 8.75. Follow the written dimension.

If the printer reports a trapping issue or missing text and asks for raster:

```bash
node print/tiff.mjs   # 350dpi RGB TIFFs beside the PDFs, gitignored
```

The PDFs come out of a browser, so they carry transparency groups from the CSS
gradients behind each panel, and an older RIP drops what it cannot flatten.
TIFF has nothing left to misinterpret. **Re-decode every QR code out of the
TIFF afterwards** — rasterising is the one step that can quietly ruin them.

Before sending a rebuilt file, check it the way that actually catches errors:
extract the text of each PDF page and diff it against the previous version. A
scrollHeight check reads zero even while a flex child is being clipped, and a
PDF can report the right page count and size while having silently dropped a
panel onto a page you never look at.

## Which HTML build to print

**Press** (`trifold-press.html`) — what the PDFs above come from. An
11.25 x 8.75in page carrying 0.125in of bleed on every side, trimming back to
11 x 8.5in. Online printers reject a file without it, and a cutter that drifts
leaves white slivers down the edge of a near-black design. The bleed sits
*outside* the trim: the outer panels grow by it and take matching extra
padding, so the finished piece and every fold are unchanged.

**Full bleed** (`trifold.html`) — ink runs to the paper edge. Needs a press that
prints oversize and trims down. Most print shops can; most office printers and
some in-store services cannot.

**No bleed** (`trifold-nobleed.html`) — a 0.25in white border is built into the
artwork and stays on the finished piece. Use this whenever the printer cannot
bleed and will not trim, because otherwise their unprintable strip becomes a
ragged, usually uneven white frame around a dark design.

**Trim** (`trifold-trim.html`) — same border, but the shop cuts it off, leaving
a **10.5 x 8in** finished piece with ink to the edge. Carries crop marks.

The trim build recomputes the fold geometry from the *finished* size rather
than reusing the 11in widths. This is the trap: folds are placed relative to
the edges of the piece you end up with, so printing the no-bleed file and then
cutting the border off would put every fold a quarter inch out of position.
Panels for 10.5in are 3.4375in (the one that tucks in) and 3.53125in twice.

For the untrimmed build the margin comes out of the **outer panels only**.
Folds sit at fixed distances from the paper edge (3.625in and 7.3125in); take
the margin off the middle panel too and the ink boundaries stop landing on the
fold lines. Both tightened builds
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
