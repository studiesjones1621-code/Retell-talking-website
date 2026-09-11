const STEPS = [
  {
    step: "01",
    title: "We learn your business",
    description:
      "One call. Your services, your pricing, how you want calls handled, what counts as an emergency and who it should reach.",
  },
  {
    step: "02",
    title: "We build and you test it",
    description:
      "We build the agent and hand you a number to call. You try to break it. We adjust until it sounds like the person you would have hired.",
  },
  {
    step: "03",
    title: "It goes live on your number",
    description:
      "On your existing line, forwarding the way you choose — all calls, after-hours only, or just the ones your team cannot get to. No new hardware.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-brand-950 py-24 md:py-32">
      <div className="absolute inset-0 brand-grid opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
            How it works
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Live in about two weeks.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="bg-brand-900 p-8">
              <span className="font-mono text-sm text-brand-accent">{item.step}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
