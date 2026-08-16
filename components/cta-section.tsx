import { business } from "@/lib/business"
import { CtaButtons } from "@/components/cta-buttons"

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-brand-900 py-24 md:py-32">
      <div className="absolute inset-0 brand-glow" />

      <div className="relative mx-auto max-w-3xl px-6 text-center md:px-12">
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Stop missing calls today.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
          Talk to the agent on this page — it is the same one that will answer your phone.
        </p>

        <CtaButtons className="mt-9" align="center" />

        <p className="mt-6 text-sm text-white/40">{business.afterHoursNote}</p>
      </div>
    </section>
  )
}
