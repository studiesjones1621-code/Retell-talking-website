import type { Testimonial } from "@/lib/business"

/**
 * Renders nothing until real, attributable reviews exist. Publishing invented
 * testimonials is a legal and trust risk, so the absence of proof is handled by
 * showing no proof — never by inventing it.
 */
export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null

  return (
    <section id="reviews" className="bg-brand-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          What operators say.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.quote}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-brand-800 p-8"
            >
              <blockquote className="text-lg leading-relaxed text-white/80">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-white/10 pt-5">
                <div className="font-semibold text-white">{testimonial.name}</div>
                <div className="text-sm text-white/45">{testimonial.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
