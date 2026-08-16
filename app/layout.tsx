import React from "react"
import type { Metadata, Viewport } from "next"
import { Host_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import {
  business,
  cityState,
  fullAddress,
  hasAddress,
  hasPhone,
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
  description: business.shortDescription,
  keywords: [
    "HVAC answering service",
    "AI receptionist for HVAC",
    "HVAC call answering",
    "HVAC virtual receptionist",
    "after hours HVAC answering service",
    "HVAC dispatch booking",
    "24/7 call answering",
    cityState,
  ].filter(Boolean),
  openGraph: {
    type: "website",
    siteName: business.name,
    title: seoTitle,
    description: business.shortDescription,
    url: business.website,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: business.shortDescription,
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
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
}

/** LocalBusiness structured data, built from the same config the page renders. */
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: business.name,
  description: business.shortDescription,
  url: business.website,
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
    : { areaServed: business.serviceArea }),
  ...(fullAddress ? {} : {}),
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Analytics />
      </body>
    </html>
  )
}
