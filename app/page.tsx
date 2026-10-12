import { CalPopupProvider } from "@/components/booking-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { MarketingTeaser } from "@/components/marketing-section"
import { NichePicker } from "@/components/niche-picker"
import { FaqSection, JsonLd, faqSchema } from "@/components/faq-section"
import { commonFaqs, type Faq } from "@/lib/niches"
import { VoiceAgentProvider } from "@/components/voice-agent/voice-agent-provider"
import { VoiceAgentWidget } from "@/components/voice-agent/voice-agent-widget"

/**
 * The general page routes rather than sells — most paid and organic traffic
 * should land on a niche page instead. See `lib/niches.ts`.
 */
const homeFaqs: Faq[] = [
  {
    question: "What is an AI receptionist?",
    answer:
      "A voice agent that answers your business line like a trained receptionist. It picks up in one ring, answers questions about your services, books the appointment into your calendar and captures the caller's details, 24 hours a day.",
  },
  {
    question: "What kinds of businesses can use an AI receptionist?",
    answer:
      "Just about any business that runs on phone calls. If customers call to ask questions or book, and a missed call costs you money, it is a fit: salons and barbershops, contractors and home services, clinics, law offices, and many more. We have dedicated pages for HVAC contractors, law firms, dental practices, med spas and behavioral health providers, but every agent is built around your own business, its vocabulary, what counts as urgent and who it should reach.",
  },
  ...commonFaqs,
  {
    question: "Can I hear it before I buy it?",
    answer:
      "Yes. Talk to the agent on this page. It runs on the same technology that would answer your phone.",
  },
]

export default function Home() {
  return (
    <VoiceAgentProvider>
      <CalPopupProvider />
      <main>
        <Hero
          eyebrow="24/7 AI receptionist for local businesses"
          headline="Never miss another call."
          subcopy="An AI receptionist that answers every call in one ring, books the appointment and captures the lead — 24 hours a day, in the language of your industry."
          proofPoints={["Answers in one ring", "Books into your calendar", "Live in 2 weeks or less"]}
        />
        <NichePicker />
        <HowItWorks />
        <FaqSection faqs={homeFaqs} />
        <MarketingTeaser />
        <CtaSection
          heading="Hear it before you buy it."
          subcopy="Talk to the agent on this page — it is the same technology that would answer your phone."
        />
      </main>

      <Footer />
      <VoiceAgentWidget />
      <JsonLd data={faqSchema(homeFaqs)} />
    </VoiceAgentProvider>
  )
}
