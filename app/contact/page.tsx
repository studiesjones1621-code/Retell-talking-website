import type { Metadata } from "next"
import { Mail, MapPin, Mic } from "lucide-react"

import { business, hasPhone, phoneHref, phoneLabel } from "@/lib/business"
import { CalPopupProvider } from "@/components/booking-section"
import { BookCard, TalkCard } from "@/components/contact-cards"
import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"
import { VoiceAgentProvider } from "@/components/voice-agent/voice-agent-provider"
import { VoiceAgentWidget } from "@/components/voice-agent/voice-agent-widget"

export const metadata: Metadata = {
  title: `Contact ${business.name}`,
  description: `Get in touch with ${business.name} — book a demo, talk to the agent, or email us.`,
  alternates: { canonical: `${business.website}/contact` },
  openGraph: {
    type: "website",
    siteName: business.name,
    title: `Contact ${business.name}`,
    description: `Book a demo, talk to the agent, or email ${business.email}.`,
    url: `${business.website}/contact`,
    locale: "en_US",
  },
}

/**
 * Contact, ordered by what actually gets a reply.
 *
 * Booking is first because it is the only route with a guaranteed time
 * attached. The voice agent is second — on a site selling AI receptionists,
 * "try the thing" is a better answer to "can I reach a human" than a form is.
 * Email is third.
 *
 * There is deliberately no contact form. A form is a slower email that also
 * needs spam handling, and nothing here needs structured fields. The phone row
 * renders only when a number is set in lib/business.ts, so the page has no
 * visible gap while there isn't one.
 */
export default function ContactPage() {
  return (
    <VoiceAgentProvider>
      <CalPopupProvider />
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:pt-24">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-accent">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Talk to us.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/55">
          The fastest way to get an answer is to book twenty minutes. If you would
          rather just try it first, the agent on this page is the same one we would
          build for you.
        </p>

        <div className="mt-12 space-y-4">
          <BookCard />

          <TalkCard />

          <a
            href={`mailto:${business.email}`}
            className="flex items-start gap-4 rounded-2xl border border-white/10 p-6 transition-colors hover:border-white/25"
          >
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
            <span>
              <span className="block font-semibold text-white">{business.email}</span>
              <span className="mt-1 block text-sm text-white/55">
                Email us anything. We reply the same business day.
              </span>
            </span>
          </a>

          {hasPhone && phoneHref && (
            <a
              href={phoneHref}
              className="flex items-start gap-4 rounded-2xl border border-white/10 p-6 transition-colors hover:border-white/25"
            >
              <Mic className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
              <span>
                <span className="block font-semibold text-white">{phoneLabel}</span>
                <span className="mt-1 block text-sm text-white/55">
                  Call and our own agent answers. It is the product, taking a real call.
                </span>
              </span>
            </a>
          )}

          <div className="flex items-start gap-4 rounded-2xl border border-white/10 p-6">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
            <span>
              <span className="block font-semibold text-white">{business.serviceArea}</span>
              <span className="mt-1 block text-sm text-white/55">
                We work remotely. Your agent runs on your existing number — there is
                nothing to install and nobody has to visit.
              </span>
            </span>
          </div>
        </div>

        <p className="mt-12 text-sm text-white/40">
          Office hours are Monday to Friday, 9am to 6pm Eastern. The receptionists we
          build keep their own hours — all of them.
        </p>
      </main>

      <Footer />
      <VoiceAgentWidget />
    </VoiceAgentProvider>
  )
}
