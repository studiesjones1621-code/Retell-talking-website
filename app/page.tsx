import { homeVideo } from "@/lib/business"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { MarketingTeaser } from "@/components/marketing-section"
import { NichePicker } from "@/components/niche-picker"
import { VideoSection } from "@/components/video-section"
import { VoiceAgentProvider } from "@/components/voice-agent/voice-agent-provider"
import { VoiceAgentWidget } from "@/components/voice-agent/voice-agent-widget"

/**
 * The general page routes rather than sells — most paid and organic traffic
 * should land on a niche page instead. See `lib/niches.ts`.
 */
export default function Home() {
  return (
    <VoiceAgentProvider>
      <main>
        <Hero
          headline="Never miss another call."
          subcopy="An AI receptionist that answers every call in one ring, books the appointment and captures the lead — 24 hours a day, in the language of your industry."
          proofPoints={["Answers in one ring", "Books into your calendar", "Live in two weeks"]}
        />
        <VideoSection video={homeVideo} />
        <NichePicker />
        <HowItWorks />
        <MarketingTeaser />
        <CtaSection
          heading="Hear it before you buy it."
          subcopy="Talk to the agent on this page — it is the same technology that would answer your phone."
        />
      </main>

      <Footer />
      <VoiceAgentWidget />
    </VoiceAgentProvider>
  )
}
