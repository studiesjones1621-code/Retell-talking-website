"use client"

import { ArrowUpRight, Check, Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { showcase } from "@/lib/showcase"

/**
 * Featured builds for /marketing: a featured screen recording in a browser frame (muted, looping, plays only
 * while on screen) plus a card per live site.
 */
export function ShowcaseSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  // Play only while visible so the video never costs bandwidth or battery off screen
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
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
  }, [])

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

        {/* Featured walkthrough, framed like a browser window */}
        <figure className="mt-14">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-900 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-3 truncate text-xs text-white/40">{showcase.video.title}</span>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                className="block aspect-[1600/792] w-full bg-black object-cover"
                poster={showcase.video.poster}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`Screen recording of the ${showcase.video.title} website`}
              >
                <source src={showcase.video.webm} type="video/webm" />
                <source src={showcase.video.src} type="video/mp4" />
              </video>
              <button
                type="button"
                onClick={toggleSound}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                aria-pressed={!muted}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {muted ? "Sound on to hear the agent" : "Sound off"}
              </button>
            </div>
          </div>
          <figcaption className="mt-4 text-sm text-white/50">{showcase.video.caption}</figcaption>
        </figure>

        {/* One card per live build */}
        <div className={`mt-16 grid gap-6 ${showcase.builds.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {showcase.builds.map((build) => (
            <a
              key={build.name}
              href={build.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-900 transition-colors hover:border-brand-accent/50 ${showcase.builds.length === 1 ? "md:flex-row" : ""}`}
            >
              <div className={`overflow-hidden ${showcase.builds.length === 1 ? "md:w-[55%] md:shrink-0" : ""}`}>
                <img
                  src={build.image}
                  alt={`${build.name} website hero`}
                  width={960}
                  height={600}
                  loading="lazy"
                  className="aspect-[16/10] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className={`flex flex-1 flex-col p-6 md:p-8 ${showcase.builds.length === 1 ? "md:justify-center md:p-12" : ""}`}>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-accent">{build.category}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{build.name}</h3>
                <p className={`mt-2 text-sm leading-relaxed text-white/55 ${showcase.builds.length > 1 ? "flex-1" : ""}`}>
                  {build.description}
                </p>
                {"highlights" in build && (
                  <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5">
                    {build.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  View live site
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
