import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const title = "Clean Rite Center | Laundromat & Wash-Dry-Fold in New York, NY"
const description =
  "Free laundry pickup and delivery across NYC. 150+ washers and dryers, 4-hour rapid wash-dry-fold, many locations open 24 hours. $29.99 for the first 15 lbs."
const url = "https://www.cleanritecenter.com/"

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(url),
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    siteName: "Clean Rite Center",
    type: "website",
    locale: "en_US",
    images: [{ url: "/crc/logo.png", width: 256, height: 256, alt: "Clean Rite Center" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/crc/logo.png"] },
  icons: { icon: "/crc/logo.png", apple: "/crc/logo.png" },
}

// Local-business structured data, using only facts published on their own site.
const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Clean Rite Center",
  description,
  url,
  email: "info@cleanritecenter.com",
  telephone: "+1-929-357-1728",
  foundingDate: "2000",
  areaServed: ["Brooklyn", "Bronx", "Queens", "Manhattan", "Staten Island"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "9777 Queens Blvd, Suite 620",
    addressLocality: "Rego Park",
    addressRegion: "NY",
    postalCode: "11374",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.facebook.com/cleanritecenter",
    "https://www.instagram.com/cleanritecenter/",
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </body>
    </html>
  )
}
