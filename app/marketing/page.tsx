import { CalPopupProvider } from "@/components/booking-section"
import type { Metadata } from "next"

import { business } from "@/lib/business"
import { marketing } from "@/lib/marketing"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import {
  MarketingServices,
  MarketingSynergy,
} from "@/components/marketing-section"
import { ShowcaseSection } from "@/components/showcase-section"
import { VoiceAgentProvider } from "@/components/voice-agent/voice-agent-provider"
import { VoiceAgentWidget } from "@/components/voice-agent/voice-agent-widget"

export const metadata: Metadata = {
  title: marketing.metaTitle,
  description: marketing.metaDescription,
  keywords: marketing.keywords,
  alternates: { canonical: `${business.website}/marketing` },
  openGraph: {
    type: "website",
    siteName: business.name,
    title: marketing.metaTitle,
    description: marketing.metaDescription,
    url: `${business.website}/marketing`,
    locale: "en_US",
    images: [{ url: `${business.website}/og/marketing.png`, width: 1200, height: 630 }],
  },
}

export default function MarketingPage() {
  return (
    <VoiceAgentProvider niche="marketing">
      <CalPopupProvider />
      <main>
        <Hero
          eyebrow="Marketing"
          headline={marketing.heading}
          subcopy={marketing.subcopy}
          proofPoints={["Websites that book", "Local SEO & map pack", "Reporting you can read"]}
        />
        <ShowcaseSection />
        <MarketingServices />
        <MarketingSynergy />
        <CtaSection heading={marketing.ctaHeading} subcopy={marketing.ctaSubcopy} note={null} />
      </main>

      <Footer />
      <VoiceAgentWidget />
    </VoiceAgentProvider>
  )
}
