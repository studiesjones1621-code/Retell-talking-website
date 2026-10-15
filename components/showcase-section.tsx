"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { showcase } from "@/lib/showcase"

/**
 * Featured builds for /marketing: screen recordings in a browser frame (muted, looping, plays only while on screen),
 * with a tab per build to switch between them. Nothing links out to client sites.
 */
export function ShowcaseSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [index, setIndex] = useState(0)
  const active = showcase.videos[index]

  // Play only while visible so the video never costs bandwidth or battery off screen. Re-runs for each recording,
  // since switching tabs mounts a new <video>.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = muted
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(video)
    return () => io.disconnect()
    // muted is applied on mount only; the toggle sets it directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const toggleSound = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    if (!video.muted) video.play().catch(() => {})
  }

  return (
    <section id="builds" className="relative overflow-hidden bg-brand-950 py-24 md:py-32">
      <div className="absolute inset-0 brand-glow opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">{showcase.eyebrow}</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {showcase.heading}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">{showcase.subcopy}</p>
        </div>

        {/* One tab per recording */}
        {showcase.videos.length > 1 && (
          <div role="tablist" aria-label="Featured builds" className="mt-12 flex flex-wrap gap-2">
            {showcase.videos.map((v, i) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                id={`build-tab-${v.id}`}
                aria-selected={i === index}
                aria-controls="build-panel"
                onClick={() => setIndex(i)}
                className={`rounded-full border px-4 py-2 text-left text-sm transition-colors ${
                  i === index
                    ? "border-brand-accent bg-brand-accent/10 text-white"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                <span className="font-semibold">{v.title}</span>
                <span className="ml-2 text-xs text-white/45">{v.category}</span>
              </button>
            ))}
          </div>
        )}

        {/* The active walkthrough, framed like a browser window */}
        <figure
          id="build-panel"
          role="tabpanel"
          aria-labelledby={`build-tab-${active.id}`}
          className={showcase.videos.length > 1 ? "mt-6" : "mt-14"}
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-900 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-3 min-w-0 flex-1 truncate text-xs text-white/40">{active.title}</span>
              {/* Up here, not over the video: the site's floating "Talk to us" launcher sits in the bottom corner */}
              <button
                type="button"
                onClick={toggleSound}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                aria-pressed={!muted}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {muted ? (
                  <>
                    <span className="sm:hidden">Sound on</span>
                    <span className="hidden sm:inline">Sound on to hear the agent</span>
                  </>
                ) : (
                  "Sound off"
                )}
              </button>
            </div>
            <video
              key={active.id}
              ref={videoRef}
              className="block aspect-[1600/792] w-full bg-black object-cover"
              poster={active.poster}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`Screen recording of the ${active.title} website`}
              >
              <source src={active.webm} type="video/webm" />
              <source src={active.src} type="video/mp4" />
            </video>
          </div>
          <figcaption className="mt-4 text-sm text-white/50">{active.caption}</figcaption>
        </figure>
      </div>
    </section>
  )
}
