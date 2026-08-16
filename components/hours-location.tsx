"use client"

import { Clock, Globe2, Mail, MapPin, Phone } from "lucide-react"

import {
  business,
  fullAddress,
  hasAddress,
  hasPhone,
  mapEmbedSrc,
  mapLinkHref,
  phoneHref,
  phoneLabel,
} from "@/lib/business"

export function HoursLocation() {
  return (
    <section id="hours" className="bg-brand-950 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
            Hours &amp; Location
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Reach us any time.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Hours + contact */}
          <div className="rounded-2xl border border-white/10 bg-brand-800 p-8 md:p-10">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-brand-accent" />
              <h3 className="text-lg font-semibold text-white">Office hours</h3>
            </div>

            <dl className="mt-6 divide-y divide-white/10">
              {business.hours.map((entry) => (
                <div key={entry.day} className="flex items-center justify-between py-3.5">
                  <dt className="text-sm text-white/60">{entry.day}</dt>
                  <dd className="text-sm font-medium text-white">{entry.hours}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 rounded-xl border border-brand-accent/25 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent">
              {business.afterHoursNote}
            </p>

            <div className="mt-8 space-y-3">
              {hasPhone && phoneHref && (
                <a
                  href={phoneHref}
                  className="flex items-center gap-3 text-sm text-white/75 transition-colors hover:text-brand-accent"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-accent" />
                  {phoneLabel}
                </a>
              )}
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 text-sm text-white/75 transition-colors hover:text-brand-accent"
              >
                <Mail className="h-4 w-4 shrink-0 text-brand-accent" />
                {business.email}
              </a>
            </div>
          </div>

          {/* Map, or service area when no street address is configured */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-800">
            {hasAddress && mapEmbedSrc ? (
              <div className="flex h-full flex-col">
                <iframe
                  title={`Map to ${business.name}`}
                  src={mapEmbedSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-72 w-full border-0 grayscale-[0.4] lg:h-full lg:min-h-[20rem]"
                  allowFullScreen
                />
                <div className="flex items-start gap-3 border-t border-white/10 p-6">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                  <div>
                    <p className="text-sm text-white/75">{fullAddress}</p>
                    {mapLinkHref && (
                      <a
                        href={mapLinkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-brand-accent underline underline-offset-4"
                      >
                        Get directions
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[20rem] flex-col justify-center gap-4 p-8 md:p-10">
                <Globe2 className="h-6 w-6 text-brand-accent" />
                <h3 className="text-lg font-semibold text-white">Where we work</h3>
                <p className="text-sm leading-relaxed text-white/60">{business.serviceArea}</p>
                <p className="text-sm leading-relaxed text-white/45">
                  Everything runs remotely — your agent goes live on your existing number
                  without anyone visiting your office.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
