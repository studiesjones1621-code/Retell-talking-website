import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { business } from "@/lib/business"
import { niches } from "@/lib/niches"

/**
 * The general homepage's job is to route, not to sell. Every visitor here
 * belongs on a niche page — this section gets them there in one click, and the
 * links double as the internal linking that makes the niche pages rank.
 */
export function NichePicker() {
  return (
    <section id="industries" className="relative bg-brand-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
            Industries
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Built for your industry, not adapted to it.
          </h2>
          <p className="mt-4 text-lg text-white/60">
            A no-heat call at 2 a.m. and someone who finally worked up the courage to dial are
            not the same phone call. Pick yours.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {niches.map((niche) => (
            <Link
              key={niche.slug}
              href={`/${niche.slug}`}
              className="group flex flex-col justify-between gap-8 bg-brand-800 p-8 transition-colors hover:bg-brand-700"
            >
              <div>
                <h3 className="text-xl font-semibold text-white">{niche.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{niche.headline}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent">
                See how it works
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}

          {/* Balances the grid at three columns and captures everyone else. */}
          <div className="flex flex-col justify-between gap-8 bg-brand-800 p-8">
            <div>
              <h3 className="text-xl font-semibold text-white">Something else?</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                If your business runs on booked appointments and missed calls cost you money, the
                answer is almost certainly yes. Ask us.
              </p>
            </div>
            <a
              href={`mailto:${business.email}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent"
            >
              Get in touch
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
