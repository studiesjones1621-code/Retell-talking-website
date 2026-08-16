import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { HoursLocation } from "@/components/hours-location"
import { ServicesSection } from "@/components/services-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { WhyChooseUs } from "@/components/why-choose-us"
import { VoiceAgentProvider } from "@/components/voice-agent/voice-agent-provider"
import { VoiceAgentWidget } from "@/components/voice-agent/voice-agent-widget"

export default function Home() {
  return (
    <VoiceAgentProvider>
      <main>
        <Hero />
        <ServicesSection />
        <WhyChooseUs />
        <TestimonialsSection />
        <HoursLocation />
        <CtaSection />
      </main>

      <Footer />
      <VoiceAgentWidget />
    </VoiceAgentProvider>
  )
}
