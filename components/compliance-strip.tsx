import { ShieldCheck } from "lucide-react"

import type { ComplianceProfile } from "@/lib/niches"

/**
 * Regulated niches get an explicit statement of what the agent does and does
 * not collect. This is a conversion asset as much as a legal one — it answers
 * the first objection a dentist or clinical director will raise, before they
 * have to ask it.
 *
 * The copy is centralised in `lib/niches.ts`. Read the UPGRADE POINT note there
 * before changing any of it.
 */
export function ComplianceStrip({ compliance }: { compliance: ComplianceProfile | null }) {
  if (!compliance) return null

  return (
    <section className="border-y border-white/10 bg-brand-800/60">
      <div className="mx-auto flex max-w-4xl items-start gap-5 px-6 py-10 md:px-12">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-brand-accent" />
        <div>
          <h2 className="text-lg font-semibold text-white">{compliance.label}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{compliance.detail}</p>
        </div>
      </div>
    </section>
  )
}
