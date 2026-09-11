import { Mail, MapPin, Phone, Radio } from "lucide-react"
import Link from "next/link"

import {
  business,
  fullAddress,
  hasAddress,
  hasPhone,
  phoneHref,
  phoneLabel,
} from "@/lib/business"

import { niches } from "@/lib/niches"

/**
 * Real page links rather than on-page anchors: every page linking to every
 * niche page is the internal linking that helps them rank, and the old anchors
 * pointed at sections that no longer exist on every page.
 */
const PAGE_LINKS = [
  ...niches.map((niche) => ({ label: niche.name, href: `/${niche.slug}` })),
  { label: "Marketing & SEO", href: "/marketing" },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-950">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <Radio className="h-5 w-5 text-brand-accent" />
              <span className="text-base font-semibold text-white">{business.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              {business.shortDescription}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">What we do</h3>
            <ul className="mt-4 space-y-2.5">
              {PAGE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-brand-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3">
              {hasPhone && phoneHref && (
                <li>
                  <a
                    href={phoneHref}
                    className="flex items-center gap-3 text-sm text-white/50 transition-colors hover:text-brand-accent"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-brand-accent" />
                    {phoneLabel}
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 text-sm text-white/50 transition-colors hover:text-brand-accent"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-accent" />
                  {business.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/50">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                {hasAddress ? fullAddress : business.serviceArea}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="text-sm text-white/35">
            © {new Date().getFullYear()} {business.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
