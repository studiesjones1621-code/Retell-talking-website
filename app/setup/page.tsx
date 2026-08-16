"use client"

import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useEffect, useState } from "react"

import { business } from "@/lib/business"

type Status = {
  hasRetellKey: boolean
  hasCalKey: boolean
  agentId: string | null
}

type Result = {
  agentId: string
  bookingEnabled: boolean
  calEventTitle: string | null
  voiceId: string
  log: string[]
}

function Row({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
      )}
      <span className={ok ? "text-white/75" : "text-rose-200"}>{children}</span>
    </li>
  )
}

export default function SetupPage() {
  const [setupKey, setSetupKey] = useState("")
  const [status, setStatus] = useState<Status | null>(null)
  const [checking, setChecking] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Allow /setup?key=... to skip the manual paste.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("key")
    if (fromUrl) setSetupKey(fromUrl)
  }, [])

  async function check(key: string) {
    setChecking(true)
    setError(null)
    try {
      const res = await fetch(`/api/setup?key=${encodeURIComponent(key)}`)
      const data = await res.json()
      if (!res.ok) {
        setStatus(null)
        setError(data.message ?? "Could not check setup status.")
      } else {
        setStatus(data)
      }
    } catch {
      setError("Could not reach the server.")
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (setupKey) check(setupKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupKey])

  async function run() {
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`/api/setup?key=${encodeURIComponent(setupKey)}`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) setError(data.message ?? "Setup failed.")
      else setResult(data)
    } catch {
      setError("Could not reach the server.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <main className="min-h-screen bg-brand-950 px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Set up your voice agent
        </h1>
        <p className="mt-3 text-white/60">
          One button. This creates the {business.name} receptionist on your Retell account.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-brand-800 p-6">
          <label className="block text-sm font-medium text-white" htmlFor="setup-key">
            Setup key
          </label>
          <p className="mt-1 text-xs text-white/45">
            The value you set as <code className="text-brand-accent">SETUP_SECRET</code>.
          </p>
          <input
            id="setup-key"
            type="password"
            value={setupKey}
            onChange={(e) => setSetupKey(e.target.value)}
            placeholder="your setup key"
            className="mt-3 w-full rounded-xl border border-white/15 bg-brand-950 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-accent"
          />

          {checking && (
            <p className="mt-4 flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking…
            </p>
          )}

          {status && (
            <ul className="mt-6 space-y-2.5">
              <Row ok={status.hasRetellKey}>
                {status.hasRetellKey
                  ? "Retell API key found"
                  : "Retell API key missing — add RETELL_API_KEY and redeploy"}
              </Row>
              <Row ok={status.hasCalKey}>
                {status.hasCalKey
                  ? "Cal.com key found — real booking will be enabled"
                  : "No Cal.com key — the agent will collect leads instead of booking"}
              </Row>
            </ul>
          )}

          <button
            onClick={run}
            disabled={!setupKey || running || !status?.hasRetellKey}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-6 py-4 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running && <Loader2 className="h-4 w-4 animate-spin" />}
            {running ? "Creating your agent…" : "Create my agent"}
          </button>

          {error && (
            <p className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-brand-accent/30 bg-brand-accent/10 p-6">
            <h2 className="text-lg font-semibold text-white">Your agent is live.</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-white/50">Agent ID</dt>
                <dd className="mt-1 break-all font-mono text-brand-accent">{result.agentId}</dd>
              </div>
              <div>
                <dt className="text-white/50">Booking</dt>
                <dd className="mt-1 text-white/80">
                  {result.bookingEnabled
                    ? `Real Cal.com booking into "${result.calEventTitle}"`
                    : "Lead capture — collects name, phone and preferred time"}
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-sm text-white/70">
              Go back to{" "}
              <a href="/" className="font-medium text-brand-accent underline underline-offset-4">
                the home page
              </a>{" "}
              and click <strong className="text-white">Talk to us</strong>. It works right now —
              nothing else to paste.
            </p>

            <details className="mt-5">
              <summary className="cursor-pointer text-xs text-white/45">What happened</summary>
              <ul className="mt-3 space-y-1.5 text-xs text-white/55">
                {result.log.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </div>
    </main>
  )
}
