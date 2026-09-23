import { Check, ShieldCheck } from "lucide-react"

import type { ComplianceProfile } from "@/lib/niches"

/**
 * Regulated niches get an explicit statement of how sensitive data is handled.
 * This is a conversion asset as much as a legal one — it answers the first
 * objection a practice administrator or managing partner will raise, before
 * they have to ask it.
 *
 * The named controls carry the weight here. Anyone can assert they take
 * compliance seriously; a list the reader can take to their own compliance
 * officer is what actually moves the deal.
 *
 * Copy is centralised in `lib/niches.ts` — read the note above
 * `ComplianceProfile` before changing any of it.
 */
export function ComplianceStrip({ compliance }: { compliance: ComplianceProfile | null }) {
  if (!compliance) return null

  return (
    <section className="border-y border-white/10 bg-brand-800/60">
      <div className="mx-auto max-w-5xl px-6 py-14 md:px-12 md:py-16">
        <div className="flex items-start gap-5">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-brand-accent" />
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-white">{compliance.label}</h2>
            <p className="mt-3 leading-relaxed text-white/60">{compliance.detail}</p>
          </div>
        </div>

        {compliance.controls && compliance.controls.length > 0 && (
          <dl className="mt-10 grid gap-x-10 gap-y-6 border-t border-white/10 pt-10 sm:grid-cols-2">
            {compliance.controls.map((control) => (
              <div key={control.title} className="flex gap-3">
                <Check className="mt-1 h-4 w-4 shrink-0 text-brand-accent" />
                <div>
                  <dt className="text-sm font-semibold text-white">{control.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-white/55">
                    {control.description}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
