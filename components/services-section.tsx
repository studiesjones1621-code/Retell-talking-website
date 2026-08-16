import { business } from "@/lib/business"

export function ServicesSection() {
  return (
    <section id="services" className="relative bg-brand-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
            Services
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Every service call handled.
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Pick the coverage your shop needs. Cancel any time.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {business.services.map((service) => (
            <article
              key={service.name}
              className="group flex flex-col justify-between gap-8 bg-brand-800 p-8 transition-colors hover:bg-brand-700"
            >
              <div>
                <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {service.description}
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-brand-accent">{service.price}</span>
                {service.priceNote && (
                  <span className="text-sm text-white/40">{service.priceNote}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
