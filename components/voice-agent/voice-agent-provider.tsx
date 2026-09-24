"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { RetellWebClient } from "retell-client-js-sdk"

export type CallStatus =
  | "idle"
  | "requesting-mic"
  | "connecting"
  | "live"
  | "ended"
  | "error"

export type CallError = {
  /** Machine-readable so the UI can offer the right recovery. */
  kind: "mic-not-found" | "mic-denied" | "mic-insecure" | "unsupported" | "service"
  message: string
}

type VoiceAgentContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  status: CallStatus
  error: CallError | null
  isAgentTalking: boolean
  isMuted: boolean
  startCall: () => Promise<void>
  endCall: () => void
  toggleMute: () => void
  /** True once the visitor has engaged, which permanently stops the auto-popup. */
  hasEngaged: boolean
  markEngaged: () => void
}

const VoiceAgentContext = createContext<VoiceAgentContextValue | null>(null)

export function useVoiceAgent() {
  const ctx = useContext(VoiceAgentContext)
  if (!ctx) {
    throw new Error("useVoiceAgent must be used inside <VoiceAgentProvider>")
  }
  return ctx
}

/**
 * Verifies we can actually capture audio *before* opening a call, so a missing or
 * blocked microphone surfaces as a friendly message instead of an SDK runtime error.
 */
async function ensureMicrophone(): Promise<CallError | null> {
  if (typeof window === "undefined") return null

  if (!window.isSecureContext) {
    return {
      kind: "mic-insecure",
      message: "Voice calls need a secure connection (https). Try the https version of this site.",
    }
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      kind: "unsupported",
      message: "This browser can't record audio. Try Chrome, Edge or Safari.",
    }
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // We only needed the permission prompt — the SDK opens its own stream.
    stream.getTracks().forEach((track) => track.stop())
    return null
  } catch (err) {
    const name = (err as DOMException)?.name

    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return {
        kind: "mic-not-found",
        message: "Mic not found — check your microphone and try again.",
      }
    }

    if (name === "NotAllowedError" || name === "SecurityError") {
      return {
        kind: "mic-denied",
        message:
          "Microphone access is blocked. Allow the mic in your browser's address bar, then try again.",
      }
    }

    if (name === "NotReadableError" || name === "TrackStartError") {
      return {
        kind: "mic-not-found",
        message: "Your microphone is in use by another app. Close it and try again.",
      }
    }

    return {
      kind: "unsupported",
      message: "We couldn't reach your microphone. Check your settings and try again.",
    }
  }
}

/**
 * `niche` tells the server which industry page this call started from, so the
 * agent can greet and qualify in the right context. It is optional — the agent
 * prompt handles an unknown niche by simply asking.
 */
export function VoiceAgentProvider({
  children,
  niche,
}: {
  children: ReactNode
  niche?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<CallStatus>("idle")
  const [error, setError] = useState<CallError | null>(null)
  const [isAgentTalking, setIsAgentTalking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasEngaged, setHasEngaged] = useState(false)

  const clientRef = useRef<RetellWebClient | null>(null)

  const markEngaged = useCallback(() => setHasEngaged(true), [])

  const endCall = useCallback(() => {
    try {
      clientRef.current?.stopCall()
    } catch {
      // Already torn down — nothing to do.
    }
    setIsAgentTalking(false)
    setIsMuted(false)
    setStatus((prev) => (prev === "error" ? prev : "ended"))
  }, [])

  const startCall = useCallback(async () => {
    setError(null)
    setStatus("requesting-mic")

    const micError = await ensureMicrophone()
    if (micError) {
      setError(micError)
      setStatus("error")
      return
    }

    setStatus("connecting")

    try {
      const res = await fetch("/api/retell/web-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      })
      const data = (await res.json()) as {
        accessToken?: string
        message?: string
        diagnosis?: string
        upstreamStatus?: number
      }

      if (!res.ok || !data.accessToken) {
        // The visitor gets the friendly line; whoever opens the console gets
        // the actual cause, so a failure is diagnosable without server logs.
        if (data.diagnosis) {
          console.error(
            `[voice agent] call refused (${data.upstreamStatus}): ${data.diagnosis}`,
          )
        }
        setError({
          kind: "service",
          message: data.message ?? "The voice assistant is unavailable right now.",
        })
        setStatus("error")
        return
      }

      // Loaded lazily: the SDK touches browser-only APIs at import time.
      const { RetellWebClient } = await import("retell-client-js-sdk")
      const client = clientRef.current ?? new RetellWebClient()
      clientRef.current = client

      client.removeAllListeners()
      client.on("call_started", () => setStatus("live"))
      client.on("call_ready", () => setStatus("live"))
      client.on("agent_start_talking", () => setIsAgentTalking(true))
      client.on("agent_stop_talking", () => setIsAgentTalking(false))
      client.on("call_ended", () => {
        setIsAgentTalking(false)
        setStatus((prev) => (prev === "error" ? prev : "ended"))
      })
      client.on("error", (err: unknown) => {
        console.error("Retell web client error", err)
        setError({
          kind: "service",
          message: "The call dropped unexpectedly. Please try again.",
        })
        setStatus("error")
        try {
          client.stopCall()
        } catch {
          // ignore
        }
      })

      await client.startCall({ accessToken: data.accessToken })
      setStatus("live")
      setIsMuted(false)
    } catch (err) {
      console.error("Failed to start Retell call", err)
      setError({
        kind: "service",
        message: "We couldn't connect the call. Please try again.",
      })
      setStatus("error")
    }
  }, [niche])

  const toggleMute = useCallback(() => {
    const client = clientRef.current
    if (!client) return
    setIsMuted((prev) => {
      try {
        if (prev) client.unmute()
        else client.mute()
      } catch {
        return prev
      }
      return !prev
    })
  }, [])

  const open = useCallback(() => {
    setHasEngaged(true)
    setIsOpen(true)
    setStatus((prev) => (prev === "ended" || prev === "error" ? "idle" : prev))
    setError(null)
  }, [])

  const close = useCallback(() => {
    setHasEngaged(true)
    setIsOpen(false)
    endCall()
    setStatus("idle")
    setError(null)
  }, [endCall])

  // Always hang up if the visitor navigates away mid-call.
  useEffect(() => {
    return () => {
      try {
        clientRef.current?.stopCall()
      } catch {
        // ignore
      }
    }
  }, [])

  const value = useMemo<VoiceAgentContextValue>(
    () => ({
      isOpen,
      open,
      close,
      status,
      error,
      isAgentTalking,
      isMuted,
      startCall,
      endCall,
      toggleMute,
      hasEngaged,
      markEngaged,
    }),
    [
      isOpen,
      open,
      close,
      status,
      error,
      isAgentTalking,
      isMuted,
      startCall,
      endCall,
      toggleMute,
      hasEngaged,
      markEngaged,
    ],
  )

  return <VoiceAgentContext.Provider value={value}>{children}</VoiceAgentContext.Provider>
}
