import type { Faq } from "@/lib/niches"

/**
 * Frequently asked questions, rendered as native <details> so it works without JavaScript and every answer is in
 * the HTML search engines read. The same list feeds the page's FAQPage structured data (see `faqSchema`), so the
 * visible answers and the structured ones can never drift apart.
 */
export function FaqSection({ heading = "Questions, answered.", faqs }: { heading?: string; faqs: Faq[] }) {
  if (!faqs.length) return null

  return (
    <section id="faq" className="relative bg-brand-900 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">FAQ</p>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">{heading}</h2>

        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium text-white">
                <h3 className="text-lg font-medium">{faq.question}</h3>
                <span
                  aria-hidden="true"
                  className="mt-1 text-2xl leading-none text-brand-accent transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-2xl leading-relaxed text-white/60">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/** FAQPage structured data for the same questions the page shows. */
export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  }
}

/** Renders one or more JSON-LD blocks. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here apart from "</script>", which is escaped
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
