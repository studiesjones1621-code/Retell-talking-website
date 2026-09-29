/**
 * The OnDuty Agent mark: a voice waveform inside a ring.
 *
 * The waveform is the same motif as the trifold cover, so print and screen read
 * as one brand. The ring sits at the outer edge rather than close to the bars,
 * which keeps it a frame instead of a second shape competing with them — at
 * thumbnail size two similar-weight shapes turn into a smudge.
 *
 * Stroke weights here are heavier than the 1080px social export. Every use on
 * the site is 20–32px, and the export's proportions go soft below about 34px.
 * Same mark, optically sized for where it actually appears.
 *
 * Fills are currentColor, so it takes its colour from the surrounding text —
 * `text-brand-accent` on dark, and it inverts correctly anywhere else.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="OnDuty Agent"
      fill="none"
    >
      <circle cx="200" cy="200" r="156" stroke="currentColor" strokeWidth="34" />
      <rect x="75" y="165" width="34" height="70" rx="17" fill="currentColor" />
      <rect x="129" y="138" width="34" height="124" rx="17" fill="currentColor" />
      <rect x="183" y="114" width="34" height="172" rx="17" fill="currentColor" />
      <rect x="237" y="145" width="34" height="110" rx="17" fill="currentColor" />
      <rect x="291" y="169" width="34" height="62" rx="17" fill="currentColor" />
    </svg>
  )
}
