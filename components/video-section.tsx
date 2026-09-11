"use client"

import { Play } from "lucide-react"
import { useState } from "react"

import {
  type VideoConfig,
  videoEmbedSrc,
  videoThumbnails,
  videoWatchHref,
  youTubeId,
} from "@/lib/business"

/**
 * Click-to-play facade. Nothing from YouTube loads until the visitor presses
 * play — only the poster image — so the video never slows the first paint and
 * no tracking cookie is set on a visitor who does not watch.
 *
 * Renders nothing when the niche has no video yet, which is why niche configs
 * can simply set `video: null`.
 */
export function VideoSection({ video }: { video: VideoConfig | null }) {
  const id = video ? youTubeId(video.url) : null
  const thumbs = id ? videoThumbnails(id) : null

  const [playing, setPlaying] = useState(false)
  const [poster, setPoster] = useState<string | null>(thumbs?.max ?? null)
  const [posterLoaded, setPosterLoaded] = useState(false)

  if (!video || !id || !thumbs) return null

  const { eyebrow, heading, subheading, title } = video

  return (
    <section id="video" className="relative overflow-hidden bg-brand-950 py-24 md:py-32">
      <div className="absolute inset-0 brand-glow opacity-60" />

      <div className="relative mx-auto max-w-5xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/60">{subheading}</p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-brand-800 shadow-2xl shadow-black/40">
          <div className="relative aspect-video w-full">
            {playing ? (
              <iframe
                src={videoEmbedSrc(id)}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play video: ${title}`}
                className="group absolute inset-0 h-full w-full cursor-pointer"
              >
                {/* Poster sits on a brand gradient, so a missing thumbnail still looks deliberate. */}
                <span className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950" />

                {poster && (
                  /* eslint-disable-next-line @next/next/no-img-element -- remote poster, no optimisation needed */
                  <img
                    src={poster}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    onLoad={() => setPosterLoaded(true)}
                    onError={() =>
                      setPoster((current) => (current === thumbs.max ? thumbs.fallback : null))
                    }
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.02] ${
                      posterLoaded ? "opacity-80 group-hover:opacity-95" : "opacity-0"
                    }`}
                  />
                )}

                <span className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />

                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent shadow-lg shadow-brand-accent/30 transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                    <Play className="ml-0.5 h-6 w-6 fill-brand-950 text-brand-950 sm:ml-1 sm:h-8 sm:w-8" />
                  </span>
                </span>

                <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-brand-950/70 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur sm:bottom-5 sm:left-5 sm:px-4 sm:py-2 sm:text-sm">
                  {title}
                </span>
              </button>
            )}
          </div>
        </div>

        <p className="mt-5 text-sm text-white/40">
          Trouble playing?{" "}
          <a
            href={videoWatchHref(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
          >
            Watch it on YouTube
          </a>
          .
        </p>
      </div>
    </section>
  )
}
