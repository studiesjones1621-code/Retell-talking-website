import Script from "next/script"

/**
 * Page analytics, chosen by environment variable rather than by import.
 *
 * The previous setup imported @vercel/analytics, which only ever reports to
 * Vercel. The site is deployed on Netlify, so that script loaded on every page
 * and recorded nothing — and the UTM parameters on the printed QR codes had
 * nowhere to land.
 *
 * Both providers below are free and read UTM parameters off the landing URL,
 * which is what makes the trifold attributable. Set whichever you have an
 * account for; set neither and this renders nothing at all:
 *
 *   NEXT_PUBLIC_GA_ID        GA4 measurement ID, e.g. G-XXXXXXXXXX
 *   NEXT_PUBLIC_PLAUSIBLE    the domain as registered, e.g. ondutyagent.com
 *
 * Netlify Analytics needs no code here — it reads server logs — but it reports
 * paths, not campaigns, so it cannot tell a scanned pamphlet from a Google
 * visit to the same page. Use one of these if that distinction matters.
 */
export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE

  return (
    <>
      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments)}
              gtag('js',new Date());
              gtag('config','${ga}');`}
          </Script>
        </>
      )}

      {plausible && (
        <Script
          defer
          data-domain={plausible}
          src="https://plausible.io/js/script.outbound-links.js"
          strategy="afterInteractive"
        />
      )}
    </>
  )
}
