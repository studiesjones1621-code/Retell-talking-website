/**
 * Flattens the press PDFs to TIFF.
 *
 *   node print/tiff.mjs
 *
 * GotPrint's RIP reported "trapping issue, text/graphics missing" on the PDFs
 * and asked for TIFF instead. A browser-generated PDF carries transparency
 * groups and blend modes from the CSS gradients behind each panel, and older
 * prepress systems drop what they cannot flatten. A raster has none of that
 * left to misinterpret.
 *
 * 350dpi is the top of the 300-350 range they asked for; the extra resolution
 * goes into the QR module edges, which are the one thing rasterising can ruin.
 * Always re-decode the codes out of the TIFF after regenerating — see the
 * README. RGB, not CMYK: their RIP converts with a real profile, and a naive
 * conversion here would muddy the accent green for no gain.
 */
import { execFileSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const py = `
import pymupdf
from PIL import Image
DPI = 350
for name in ("FRONT-outside", "BACK-inside"):
    src = f"${here}/OnDutyAgent-trifold-{name}.pdf"
    pix = pymupdf.open(src)[0].get_pixmap(dpi=DPI, alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    out = f"${here}/OnDutyAgent-trifold-{name}.tif"
    img.save(out, format="TIFF", compression="tiff_lzw", dpi=(DPI, DPI))
    print(f"{out}: {img.width}x{img.height}px = {img.width/DPI:.3f} x {img.height/DPI:.3f}in")
`
execFileSync("python3", ["-c", py], { stdio: "inherit" })
