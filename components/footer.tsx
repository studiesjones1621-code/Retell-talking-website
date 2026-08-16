import { Mail, MapPin, Phone, Radio } from "lucide-react"

import {
  business,
  fullAddress,
  hasAddress,
  hasPhone,
  phoneHref,
  phoneLabel,
} from "@/lib/business"

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "Reviews", href: "#reviews" },
  { label: "Hours", href: "#hours" },
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
            <h3 className="text-sm font-semibold text-white">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-brand-accent"
                  >
                    {link.label}
                  </a>
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
