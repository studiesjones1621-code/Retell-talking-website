import { Quote } from "lucide-react"

import { business } from "@/lib/business"

export function TestimonialsSection() {
  return (
    <section id="reviews" className="bg-brand-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
            Reviews
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            What contractors tell us.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {business.testimonials.map((testimonial) => (
            <figure
              key={testimonial.quote}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-brand-800 p-8"
            >
              <Quote className="h-6 w-6 text-brand-accent" />
              <blockquote className="mt-6 text-base leading-relaxed text-white/80">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-8 border-t border-white/10 pt-5">
                <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-white/45">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
