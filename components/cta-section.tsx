import { business } from "@/lib/business"
import { CtaButtons } from "@/components/cta-buttons"

/**
 * `note` defaults to the 24/7 line, which lands well under a receptionist CTA
 * and reads as a non-sequitur under a marketing one — pass null there.
 */
export function CtaSection({
  heading,
  subcopy,
  note = business.afterHoursNote,
}: {
  heading: string
  subcopy: string
  note?: string | null
}) {
  return (
    <section id="book" className="relative overflow-hidden bg-brand-900 py-24 md:py-32">
      <div className="absolute inset-0 brand-glow" />

      <div className="relative mx-auto max-w-3xl px-6 text-center md:px-12">
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {heading}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">{subcopy}</p>

        <CtaButtons className="mt-9" align="center" />

        {note && <p className="mt-6 text-sm text-white/40">{note}</p>}
      </div>
    </section>
  )
}
