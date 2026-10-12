import React from "react"
import type { Metadata, Viewport } from "next"
import { Host_Grotesk } from "next/font/google"

import { Analytics } from "@/components/analytics"
import {
  business,
  cityState,
  hasAddress,
  hasPhone,
  seoDescription,
  seoTitle,
} from "@/lib/business"
import "./globals.css"

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host-grotesk",
})

export const metadata: Metadata = {
  metadataBase: new URL(business.website),
  title: seoTitle,
  description: seoDescription,
  keywords: [
    "AI receptionist",
    "AI answering service",
    "24/7 call answering",
    "virtual receptionist for small business",
    "appointment booking service",
    "missed call solution",
    cityState,
  ].filter(Boolean),
  openGraph: {
    type: "website",
    siteName: business.name,
    title: seoTitle,
    description: seoDescription,
    url: business.website,
    locale: "en_US",
    images: [{ url: `${business.website}/og/default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
  },
  alternates: {
    canonical: business.website,
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#07080a",
  width: "device-width",
  initialScale: 1,
}

/**
 * Organization + WebSite structured data, built from the same config the page renders. OnDuty Agent serves
 * clients nationwide rather than from a storefront, so it is described as an Organization (a LocalBusiness
 * without a street address is incomplete in Google's eyes). Each industry page adds its own Service entry.
 */
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${business.website}/#organization`,
      name: business.name,
      url: business.website,
      logo: `${business.website}/apple-icon.png`,
      description: business.shortDescription,
      email: business.email,
      ...(hasPhone ? { telephone: business.phone } : {}),
      ...(hasAddress
        ? {
            address: {
              "@type": "PostalAddress",
              streetAddress: business.address.street,
              addressLocality: business.address.city,
              addressRegion: business.address.state,
              postalCode: business.address.zip,
              addressCountry: "US",
            },
          }
        : {}),
      areaServed: { "@type": "Country", name: "United States" },
      knowsAbout: ["AI receptionist", "AI answering service", "Website design", "Local SEO"],
    },
    {
      "@type": "WebSite",
      "@id": `${business.website}/#website`,
      name: business.name,
      url: business.website,
      publisher: { "@id": `${business.website}/#organization` },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${hostGrotesk.variable} font-sans antialiased`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <Analytics />
      </body>
    </html>
  )
}
