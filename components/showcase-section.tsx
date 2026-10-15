"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { showcase } from "@/lib/showcase"

type Video = (typeof showcase.videos)[number]

/**
 * Featured builds for /marketing: one row per screen recording, the video in a browser frame beside its title and
 * caption, alternating sides on wide screens. Each video is muted and looping and plays only while on screen; turning
 * one's sound on mutes the others. Nothing links out to client sites.
 */
export function ShowcaseSection() {
  const [unmuted, setUnmuted] = useState<string | null>(null)

  return (
    <section id="builds" className="relative overflow-hidden bg-brand-950 py-24 md:py-32">
      <div className="absolute inset-0 brand-glow opacity-40" />

      <div className="relative mx-auto max-w-6xl px-6 md:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">{showcase.eyebrow}</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {showcase.heading}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">{showcase.subcopy}</p>
        </div>

        <div className="mt-16 grid gap-16 md:gap-20">
          {showcase.videos.map((video, i) => (
            <Build
              key={video.id}
              video={video}
              flip={i % 2 === 1}
              muted={unmuted !== video.id}
              onToggle={() => setUnmuted((cur) => (cur === video.id ? null : video.id))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function Build({ video, flip, muted, onToggle }: { video: Video; flip: boolean; muted: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)

  // Play only while visible so the videos never cost bandwidth or battery off screen
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = muted
    if (!muted) el.play().catch(() => {})
  }, [muted])

  return (
    <figure
      className={`grid items-center gap-6 lg:gap-12 ${flip ? "lg:grid-cols-[1fr_1.45fr]" : "lg:grid-cols-[1.45fr_1fr]"}`}
    >
      <div
        className={`overflow-hidden rounded-2xl border border-white/10 bg-brand-900 shadow-2xl shadow-black/40 ${flip ? "lg:order-2" : ""}`}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="ml-3 min-w-0 truncate text-xs text-white/40">{video.title}</span>
        </div>
        <video
          ref={ref}
          className="block aspect-[1600/792] w-full bg-black object-cover"
          poster={video.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`Screen recording of the ${video.title} website`}
        >
          <source src={video.webm} type="video/webm" />
          <source src={video.src} type="video/mp4" />
        </video>
      </div>

      <figcaption className={flip ? "lg:order-1" : ""}>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-accent">{video.category}</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{video.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{video.caption}</p>
        <button
          type="button"
          onClick={onToggle}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
          aria-pressed={!muted}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? video.sound : "Sound off"}
        </button>
      </figcaption>
    </figure>
  )
}
