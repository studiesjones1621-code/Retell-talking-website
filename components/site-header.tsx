"use client"

import { Menu, Phone, Radio, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { business, hasPhone, phoneHref, phoneLabel } from "@/lib/business"

const NAV_LINKS = [
  { label: "Watch", href: "#video" },
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "Reviews", href: "#reviews" },
  { label: "Hours", href: "#hours" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <Radio className="h-5 w-5 text-brand-accent" />
          <span className="text-base font-semibold tracking-tight">{business.name}</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-white/65 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {hasPhone && phoneHref && (
            <a
              href={phoneHref}
              className="hidden items-center gap-2 rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-brand-950 transition-opacity hover:opacity-90 lg:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" />
              {phoneLabel}
            </a>
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
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-base text-white/75 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            {hasPhone && phoneHref && (
              <a
                href={phoneHref}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3.5 text-sm font-semibold text-brand-950"
              >
                <Phone className="h-4 w-4" />
                Call {phoneLabel}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
