import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { business } from "@/lib/business"
import { getNiche, niches } from "@/lib/niches"
import { ComplianceStrip } from "@/components/compliance-strip"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { MarketingTeaser } from "@/components/marketing-section"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { VideoSection } from "@/components/video-section"
import { WhyChooseUs } from "@/components/why-choose-us"
import { VoiceAgentProvider } from "@/components/voice-agent/voice-agent-provider"
import { VoiceAgentWidget } from "@/components/voice-agent/voice-agent-widget"

type Props = { params: Promise<{ niche: string }> }

/** Every niche is known at build time, so all five prerender as static HTML. */
export function generateStaticParams() {
  return niches.map((niche) => ({ niche: niche.slug }))
}

/** Anything outside the known set is a 404 rather than a thin generated page. */
export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { niche: slug } = await params
  const niche = getNiche(slug)
  if (!niche) return {}

  const url = `${business.website}/${niche.slug}`

  return {
    title: niche.metaTitle,
    description: niche.metaDescription,
    keywords: niche.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: business.name,
      title: niche.metaTitle,
      description: niche.metaDescription,
      url,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: niche.metaTitle,
      description: niche.metaDescription,
    },
  }
}

export default async function NichePage({ params }: Props) {
  const { niche: slug } = await params
  const niche = getNiche(slug)
  if (!niche) notFound()

  return (
    <VoiceAgentProvider niche={niche.slug}>
      <main>
        <Hero
          eyebrow={niche.eyebrow}
          headline={niche.headline}
          subcopy={niche.subcopy}
          proofPoints={niche.proofPoints}
          image={niche.heroImage}
        />
        <VideoSection video={niche.video} />
        <ServicesSection
          heading={niche.servicesHeading}
          subcopy={niche.servicesSubcopy}
          services={niche.services}
        />
        <WhyChooseUs
          heading={niche.differentiatorsHeading}
          subcopy={niche.differentiatorsSubcopy}
          items={niche.differentiators}
        />
        <TestimonialsSection testimonials={niche.testimonials} />
        <HowItWorks />
        {/*
          Compliance sits here, not up by the services grid: it answers an
          objection, and an objection only lands once the reader wants the
          thing. Leading with it makes the page about risk instead of about
          the value, and it is the last thing a buyer checks before they ask
          about price.
        */}
        <ComplianceStrip compliance={niche.compliance} />
        <MarketingTeaser />
        <CtaSection heading={niche.ctaHeading} subcopy={niche.ctaSubcopy} />
      </main>

      <Footer />
      <VoiceAgentWidget />
    </VoiceAgentProvider>
  )
}
