import { CalendarCheck, Clock, MessageSquare, Rocket } from "lucide-react"

const ICONS = [Clock, CalendarCheck, MessageSquare, Rocket]

export function WhyChooseUs({
  heading,
  subcopy,
  items,
}: {
  heading: string
  subcopy: string
  items: { title: string; description: string }[]
}) {
  return (
    <section id="why-us" className="relative overflow-hidden bg-brand-950 py-24 md:py-32">
      <div className="absolute inset-0 brand-grid opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
              Why us
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/60">{subcopy}</p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {items.map((item, i) => {
              const Icon = ICONS[i % ICONS.length]
              return (
                <div key={item.title} className="bg-brand-900 p-8">
                  <Icon className="h-6 w-6 text-brand-accent" />
                  <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
