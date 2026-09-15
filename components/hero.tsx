"use client"

import { motion } from "framer-motion"

import { CtaButtons } from "@/components/cta-buttons"
import { SiteHeader } from "@/components/site-header"

export function Hero({
  eyebrow,
  headline,
  subcopy,
  proofPoints,
  badge = "On duty 24/7",
  image = null,
}: {
  eyebrow?: string
  headline: string
  subcopy: string
  proofPoints: readonly string[]
  badge?: string
  /** Optional hero photograph. Falls back to the gradient treatment when null. */
  image?: string | null
}) {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-brand-950">
      {image ? (
        <>
          {/*
            A photograph has to survive white text at every viewport, so it gets
            a three-part scrim rather than a single flat overlay: a base wash for
            overall contrast, a left-weighted gradient under the copy column, and
            the usual bottom fade into the next section.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-brand-950/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/80 to-transparent" />
          <div className="absolute inset-0 brand-grid opacity-25" />
        </>
      ) : (
        <>
          {/* Layered gradient + grid treatment stands in for a hero photograph. */}
          <div className="absolute inset-0 brand-grid opacity-70" />
          <div className="absolute inset-0 brand-glow" />
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-brand-900 to-transparent" />

      <SiteHeader />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pb-20 pt-32 md:px-12">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-1.5 text-xs font-medium tracking-wide text-brand-accent"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent" />
            </span>
            {eyebrow ?? badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/65"
          >
            {subcopy}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
          >
            <CtaButtons className="mt-9" />
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/45"
          >
            {proofPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-brand-accent" />
                {point}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  )
}
