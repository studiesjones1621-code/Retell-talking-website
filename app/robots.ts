import type { MetadataRoute } from "next"

import { business } from "@/lib/business"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /** Provisioning UI — useful to the owner, worthless and confusing in search. */
      disallow: "/setup",
    },
    sitemap: `${business.website}/sitemap.xml`,
  }
}
