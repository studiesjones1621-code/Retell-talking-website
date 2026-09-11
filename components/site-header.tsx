"use client"

import { CalendarCheck, ChevronDown, Menu, Phone, Radio, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { business, hasBooking, hasPhone, phoneHref, phoneLabel } from "@/lib/business"
import { niches } from "@/lib/niches"

/**
 * One header for every page. The industries live behind a disclosure rather
 * than sitting flat in the nav — five siblings would crowd out the marketing
 * link, and the niche pages are landed on from search and ads far more often
 * than they are navigated to from here.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [industriesOpen, setIndustriesOpen] = useState(false)

  const close = () => {
    setOpen(false)
    setIndustriesOpen(false)
  }

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <Radio className="h-5 w-5 text-brand-accent" />
          <span className="text-base font-semibold tracking-tight">{business.name}</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-white/65 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setIndustriesOpen(true)}
            onMouseLeave={() => setIndustriesOpen(false)}
          >
            <button
              onClick={() => setIndustriesOpen((v) => !v)}
              aria-expanded={industriesOpen}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              Industries
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {industriesOpen && (
              <div className="absolute left-1/2 top-full w-60 -translate-x-1/2 pt-4">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-brand-900 shadow-xl shadow-black/40">
                  {niches.map((niche) => (
                    <Link
                      key={niche.slug}
                      href={`/${niche.slug}`}
                      onClick={close}
                      className="block px-5 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {niche.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/marketing" className="transition-colors hover:text-white">
            Marketing
          </Link>
          <a href="#how" className="transition-colors hover:text-white">
            How it works
          </a>
        </div>

        <div className="flex items-center gap-4">
          {hasBooking ? (
            <a
              href={business.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90 lg:inline-flex"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              {business.cta.label}
            </a>
          ) : (
            hasPhone &&
            phoneHref && (
              <a
                href={phoneHref}
                className="hidden items-center gap-2 rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90 lg:inline-flex"
              >
                <Phone className="h-3.5 w-3.5" />
                {phoneLabel}
              </a>
            )
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="text-white lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-y border-white/10 bg-brand-950/95 backdrop-blur lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            <p className="pb-1 pt-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-accent">
              Industries
            </p>
            {niches.map((niche) => (
              <Link
                key={niche.slug}
                href={`/${niche.slug}`}
                onClick={close}
                className="py-2.5 text-base text-white/75 transition-colors hover:text-white"
              >
                {niche.name}
              </Link>
            ))}

            <Link
              href="/marketing"
              onClick={close}
              className="mt-3 border-t border-white/10 py-3 text-base text-white/75 transition-colors hover:text-white"
            >
              Marketing
            </Link>

            {hasBooking && (
              <a
                href={business.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3.5 text-sm font-semibold text-brand-950"
              >
                <CalendarCheck className="h-4 w-4" />
                {business.cta.label}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
