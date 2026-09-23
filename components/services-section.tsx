import type { NicheService } from "@/lib/niches"

/**
 * Cards describe the outcome and stop there — pricing is deliberately absent
 * site-wide, so the only next step from any card is the booking CTA below it.
 */
export function ServicesSection({
  heading,
  subcopy,
  services,
}: {
  heading: string
  subcopy: string
  services: NicheService[]
}) {
  return (
    <section id="services" className="relative bg-brand-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
            What it does
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 text-lg text-white/60">{subcopy}</p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {services.map((service, i) => (
            <article
              key={service.name}
              /* An odd final card would leave a hole in a two-column grid, so it
                 spans the full width instead and reads as deliberate. */
              className={`group flex flex-col gap-4 bg-brand-800 p-8 transition-colors hover:bg-brand-700 ${
                services.length % 2 === 1 && i === services.length - 1
                  ? "sm:col-span-2"
                  : ""
              }`}
            >
              <h3 className="text-xl font-semibold text-white">{service.name}</h3>
              <p className="text-sm leading-relaxed text-white/60">{service.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
