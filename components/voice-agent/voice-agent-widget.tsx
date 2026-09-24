"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Mic, MicOff, PhoneCall, PhoneOff, X } from "lucide-react"
import { useEffect, useState } from "react"

import { business, hasPhone, phoneHref, phoneLabel } from "@/lib/business"
import { OrbLauncher } from "@/components/voice-agent/orb-launcher"
import { useVoiceAgent } from "@/components/voice-agent/voice-agent-provider"

/** Rotating prompts shown in the attention bubble. First one is the configured CTA. */
const BUBBLE_MESSAGES = [
  business.cta.spoken,
  "Have a question? Just ask.",
  "Talk to our AI agent — no hold music.",
]

const FIRST_SHOW_DELAY_MS = 5000
const VISIBLE_MS = 5000
const HIDDEN_MS = 5000

/**
 * Shows the bubble 5s after load, keeps it up for 5s, hides it for 5s, then repeats
 * with the next message. Stops for good once the visitor engages with the launcher.
 */
function useRotatingBubble(enabled: boolean) {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const show = () => {
      if (cancelled) return
      setVisible(true)
      timer = setTimeout(hide, VISIBLE_MS)
    }

    const hide = () => {
      if (cancelled) return
      setVisible(false)
      setIndex((i) => (i + 1) % BUBBLE_MESSAGES.length)
      timer = setTimeout(show, HIDDEN_MS)
    }

    timer = setTimeout(show, FIRST_SHOW_DELAY_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [enabled])

  return { visible, message: BUBBLE_MESSAGES[index] }
}

function StatusLine() {
  const { status, error, isAgentTalking } = useVoiceAgent()

  if (status === "error" && error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-rose-200">{error.message}</p>
        {hasPhone && phoneHref && (
          <p className="text-sm text-white/60">
            Or call us at{" "}
            <a href={phoneHref} className="font-medium text-brand-accent underline underline-offset-4">
              {phoneLabel}
            </a>
            .
          </p>
        )}
      </div>
    )
  }

  switch (status) {
    case "requesting-mic":
      return <p className="text-sm text-white/60">Waiting for microphone permission…</p>
    case "connecting":
      return <p className="text-sm text-white/60">Connecting you now…</p>
    case "live":
      return (
        <p className="text-sm text-white/70">
          {isAgentTalking ? "Agent is speaking…" : "Listening — go ahead and talk."}
        </p>
      )
    case "ended":
      return <p className="text-sm text-white/60">Call ended. Thanks for calling.</p>
    default:
      return (
        <p className="text-sm text-white/60">
          Ask about services, pricing or hours — or {business.cta.goal}.
        </p>
      )
  }
}

/** Animated bars that react to the agent speaking. */
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-12 items-center justify-center gap-1.5" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-brand-accent"
          animate={
            active
              ? { height: [8, 34, 14, 40, 10][i % 5] }
              : { height: 8 }
          }
          transition={{
            duration: 0.5,
            repeat: active ? Infinity : 0,
            repeatType: "reverse",
            delay: i * 0.07,
          }}
          style={{ height: 8 }}
        />
      ))}
    </div>
  )
}

function CallPanel() {
  const { close, status, startCall, endCall, toggleMute, isMuted, isAgentTalking } = useVoiceAgent()

  const isBusy = status === "requesting-mic" || status === "connecting"
  const isLive = status === "live"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="dialog"
      aria-label={`Talk to the ${business.name} assistant`}
      className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-brand-800 shadow-2xl shadow-black/50"
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-brand-700/50 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">{business.name} Assistant</p>
          <p className="text-xs text-white/50">Answers instantly, 24/7</p>
        </div>
        <button
          onClick={close}
          aria-label="Close assistant"
          className="rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 px-5 py-5">
        <Waveform active={isLive && isAgentTalking} />

        <div className="min-h-[3rem]">
          <StatusLine />
        </div>

        <div className="flex items-center gap-2">
          {!isLive ? (
            <button
              onClick={startCall}
              disabled={isBusy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PhoneCall className="h-4 w-4" />
              )}
              {status === "ended" || status === "error" ? "Try again" : "Start talking"}
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                aria-pressed={isMuted}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                onClick={endCall}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <PhoneOff className="h-4 w-4" />
                End call
              </button>
            </>
          )}
        </div>

        {hasPhone && phoneHref && status !== "error" && (
          <a
            href={phoneHref}
            className="block text-center text-xs text-white/45 transition-colors hover:text-white/70"
          >
            Prefer the phone? Call {phoneLabel}
          </a>
        )}
      </div>
    </motion.div>
  )
}

export function VoiceAgentWidget() {
  /*
   * An orb share link takes over when one is configured. It needs no API key
   * and no particular agent type, so it is the path that works when the
   * token-minting route is being refused — which is worth having, because the
   * launcher is this site's only conversion action.
   */
  const orbUrl = process.env.NEXT_PUBLIC_RETELL_ORB_URL?.trim()

  const { isOpen, open, hasEngaged, markEngaged } = useVoiceAgent()
  const { visible, message } = useRotatingBubble(!isOpen && !hasEngaged)

  if (orbUrl) return <OrbLauncher url={orbUrl} />

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence mode="wait">{isOpen && <CallPanel key="panel" />}</AnimatePresence>

      <AnimatePresence>
        {!isOpen && visible && (
          <motion.button
            key={message}
            onClick={open}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-[16rem] rounded-2xl rounded-br-sm border border-brand-accent/30 bg-brand-800 px-4 py-3 text-left text-sm font-medium text-white shadow-xl shadow-black/40"
          >
            {message}
            <span className="mt-1 block text-xs font-normal text-brand-accent">
              Tap to talk →
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="flex items-center gap-2">
          {visible && (
            <button
              onClick={markEngaged}
              aria-label="Dismiss assistant prompt"
              className="rounded-full border border-white/10 bg-brand-800/80 p-2 text-white/50 backdrop-blur transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={open}
            aria-label={`Talk to the ${business.name} assistant`}
            className="group relative inline-flex items-center gap-2.5 rounded-full bg-brand-accent px-5 py-4 text-sm font-semibold text-brand-950 shadow-xl shadow-brand-accent/25 transition-transform hover:scale-105"
          >
            <span className="animate-pulse-ring absolute inset-0 rounded-full bg-brand-accent" />
            <Mic className="relative h-5 w-5" />
            <span className="relative">Talk to us</span>
          </button>
        </div>
      )}
    </div>
  )
}
