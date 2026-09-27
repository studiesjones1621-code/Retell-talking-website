import {
  CrcHeader, CrcHero, CrcServices, CrcHowItWorks,
  CrcWhyUs, CrcTestimonials, CrcLocations, CrcFooter,
} from "@/components/sections/crc-sections"
import { VoiceWidget } from "@/components/voice-widget"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <CrcHeader />
      <CrcHero />
      <CrcServices />
      <CrcHowItWorks />
      <CrcWhyUs />
      <CrcTestimonials />
      <CrcLocations />
      <CrcFooter />
      <VoiceWidget />
    </main>
  )
}
