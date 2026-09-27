import Image from "next/image"
import {
  business,
  services,
  whyUs,
  amenities,
  testimonials,
  steps,
} from "@/lib/business"

/* Shared bits ------------------------------------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand">
      {children}
    </p>
  )
}

function OrderButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={business.orderUrl}
      className={`inline-flex items-center justify-center rounded-full bg-brand-yellow px-7 py-3.5 text-sm font-bold text-brand-deep transition-transform hover:scale-[1.03] ${className}`}
    >
      Schedule a free pickup
    </a>
  )
}

/* Header ----------------------------------------------------------------- */

export function CrcHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#top" className="flex items-center gap-2.5">
          <Image
            src="/crc/logo-inverted.png"
            alt={`${business.name} logo`}
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="text-base font-extrabold tracking-tight text-white">
            {business.name}
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex">
          <a href="#services" className="transition-colors hover:text-white">Services</a>
          <a href="#how" className="transition-colors hover:text-white">How it works</a>
          <a href="#why" className="transition-colors hover:text-white">Why us</a>
          <a href="#locations" className="transition-colors hover:text-white">Locations</a>
        </nav>
        <OrderButton className="!px-5 !py-2.5 text-xs" />
      </div>
    </header>
  )
}

/* Hero ------------------------------------------------------------------- */

export function CrcHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-brand">
      {/* Gemini image generation was quota-blocked, so the hero is built from
          the brand palette and their own cutout rather than a stock photo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(248,228,81,.22), transparent 68%)" }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
            {business.tagline}
          </p>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.03] tracking-tight text-white sm:text-5xl md:text-6xl">
            Laundry day,
            <br />
            <span className="text-brand-yellow">gone.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
            Free pickup and delivery across New York City. Or walk into a
            superstore with 150+ machines and be done in one trip.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <OrderButton />
            <a
              href={business.locatorUrl}
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Find a location
            </a>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-5 border-t border-white/15 pt-6">
            {[
              ["4 hr", "rapid turnaround"],
              ["150+", "machines per store"],
              ["24/7", "many locations"],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="text-2xl font-extrabold text-brand-yellow">{stat}</dt>
                <dd className="mt-0.5 text-xs leading-snug text-white/65">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden md:block">
          <Image
            src="/crc/laundry-stack.png"
            alt="A neatly folded stack of clean laundry"
            width={1200}
            height={1259}
            priority
            className="mx-auto w-full max-w-sm drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  )
}

/* Services --------------------------------------------------------------- */

export function CrcServices() {
  return (
    <section id="services" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Eyebrow>What we do</Eyebrow>
        <h2 className="max-w-xl text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
          Four ways to never think about laundry again.
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <article
              key={s.title}
              className="group overflow-hidden rounded-2xl border border-black/[0.07] bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-brand-tint">
                {s.image ? (
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-4xl font-extrabold tracking-tight text-brand">
                      {s.tile?.stat}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand/55">
                      {s.tile?.label}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.blurb}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* How it works + pricing -------------------------------------------------- */

export function CrcHowItWorks() {
  const { pricing, delivery } = business
  return (
    <section id="how" className="bg-brand-tint py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Eyebrow>How pickup works</Eyebrow>
            <h2 className="max-w-lg text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
              Bag it, leave it, get it back folded.
            </h2>

            <ol className="mt-9 space-y-6">
              {steps.map((s) => (
                <li key={s.n} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span className="font-mono text-sm font-bold text-brand">{s.n}</span>
                  <div>
                    <h3 className="text-base font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-brand p-7 text-white shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-yellow">
              Simple pricing
            </p>
            <p className="mt-4 text-5xl font-extrabold leading-none">{pricing.base}</p>
            <p className="mt-1.5 text-sm text-white/75">for the {pricing.baseUnit}</p>
            <div className="my-5 h-px bg-white/20" />
            <p className="text-2xl font-extrabold">
              +{pricing.additional}
              <span className="ml-1.5 text-sm font-medium text-white/75">
                {pricing.additionalUnit}
              </span>
            </p>
            <p className="mt-5 text-xs leading-relaxed text-white/65">{pricing.note}</p>
            <p className="mt-3 text-xs leading-relaxed text-white/65">
              Pickup and delivery are free within {delivery.freeRadiusMiles} miles of a
              store, up to {delivery.maxRadiusMiles} miles total. Driving handled by{" "}
              {delivery.partners}.
            </p>
            <OrderButton className="mt-6 w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* Why choose us ----------------------------------------------------------- */

export function CrcWhyUs() {
  return (
    <section id="why" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Eyebrow>Why {business.name}</Eyebrow>
        <h2 className="max-w-xl text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
          A superstore, not a corner laundromat.
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => (
            <div key={w.title} className="rounded-2xl border border-black/[0.07] p-6">
              <p className="text-3xl font-extrabold tracking-tight text-brand">{w.stat}</p>
              <h3 className="mt-1 text-sm font-bold">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid items-center gap-8 rounded-2xl bg-brand-tint p-7 md:grid-cols-[1fr_1fr] md:p-9">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">
              Everything you need while you wait
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {amenities.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-52 overflow-hidden rounded-xl md:h-60">
            <Image
              src="/crc/community.jpg"
              alt="Clean Rite Center in the neighborhood"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* Testimonials ------------------------------------------------------------ */

export function CrcTestimonials() {
  return (
    <section className="bg-brand py-16 text-white md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-yellow">
          {business.reviewCount} five-star reviews
        </p>
        <h2 className="max-w-xl text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
          New Yorkers do not hand over their laundry lightly.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl bg-white/[0.07] p-6">
              <blockquote className="text-sm leading-relaxed text-white/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-4 text-xs font-semibold text-brand-yellow">
                {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Locations --------------------------------------------------------------- */

export function CrcLocations() {
  return (
    <section id="locations" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-9 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>Find us</Eyebrow>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
              All five boroughs, and beyond.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Stores across {business.boroughs.slice(0, -1).join(", ")} and{" "}
              {business.boroughs.slice(-1)}, plus {business.regions.slice(1).join(", ")}.
              Hours vary by store and many locations never close.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {business.boroughs.map((b) => (
                <li
                  key={b}
                  className="rounded-full bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-brand"
                >
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={business.locatorUrl}
                className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
              >
                Find your nearest store
              </a>
              {/* This published number is a text line for live orders, not a
                  sales phone — labelling it plainly avoids a bad first call. */}
              <a
                href={business.textLineHref}
                className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold transition-colors hover:bg-brand-tint"
              >
                Text us {business.textLine}
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[0.07]">
            <iframe
              title={`Map of ${business.name} locations`}
              src="https://www.google.com/maps?q=Clean+Rite+Center+New+York&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[22rem] w-full border-0 md:h-full md:min-h-[24rem]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* Footer ------------------------------------------------------------------ */

export function CrcFooter() {
  const { corporate } = business
  return (
    <footer className="bg-brand-deep py-12 text-white/70">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-9 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/crc/logo-inverted.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-base font-extrabold text-white">{business.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              {business.tagline}. 150+ washers and dryers across the New York Metro
              area, New England, Ohio, Maryland and Pennsylvania.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Links
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href={business.locatorUrl} className="hover:text-white">Find a location</a></li>
              <li><a href={business.orderUrl} className="hover:text-white">Pickup &amp; delivery</a></li>
              <li><a href="#services" className="hover:text-white">Services</a></li>
              <li><a href={business.facebook} className="hover:text-white">Facebook</a></li>
              <li><a href={business.instagram} className="hover:text-white">Instagram</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Contact
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={business.textLineHref} className="hover:text-white">
                  Text {business.textLine}
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="hover:text-white">
                  {business.email}
                </a>
              </li>
              <li className="pt-1 text-white/50">
                {business.legalName}
                <br />
                {corporate.line1}
                <br />
                {corporate.city}, {corporate.state} {corporate.zip}
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-white/45">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
