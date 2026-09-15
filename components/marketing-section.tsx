import { ArrowRight, Check } from "lucide-react"
import Link from "next/link"

import { marketing } from "@/lib/marketing"

/**
 * Compact teaser for the homepage and the foot of each niche page. The full
 * detail lives at /marketing — this exists to plant the idea with someone who
 * came for the receptionist, which is the whole point of the ordering.
 */
export function MarketingTeaser() {
  return (
    <section id="marketing" className="relative overflow-hidden bg-brand-900 py-24 md:py-32">
      <div className="absolute inset-0 brand-glow opacity-50" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
              {marketing.eyebrow}
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {marketing.heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/60">{marketing.subcopy}</p>

            <Link
              href="/marketing"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See what we do
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {marketing.services.map((service) => (
              <div key={service.name} className="bg-brand-800 p-8">
                <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                <p className="mt-3 flex gap-2.5 text-sm leading-relaxed text-white/50">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-px w-4 shrink-0 bg-brand-accent/60"
                  />
                  {service.problem}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Full detail, used on /marketing only. */
export function MarketingServices() {
  return (
    <section id="services" className="relative bg-brand-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {marketing.services.map((service) => (
            <article
              key={service.name}
              className="flex flex-col rounded-2xl border border-white/10 bg-brand-800 p-8 md:p-10"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-accent">
                The problem
              </p>
              <p className="mt-3 text-base leading-relaxed text-white/55">{service.problem}</p>
              <h2 className="mt-6 text-2xl font-semibold text-white">{service.name}</h2>
              <p className="mt-3 leading-relaxed text-white/60">{service.description}</p>

              <ul className="mt-7 space-y-3 border-t border-white/10 pt-7">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Why buying the phone and the marketing from one team is actually better. */
export function MarketingSynergy() {
  return (
    <section className="relative overflow-hidden bg-brand-950 py-24 md:py-32">
      <div className="absolute inset-0 brand-grid opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {marketing.synergy.heading}
        </h2>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {marketing.synergy.points.map((point) => (
            <div key={point.title} className="bg-brand-900 p-8">
              <h3 className="text-lg font-semibold text-white">{point.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
