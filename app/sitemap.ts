import type { MetadataRoute } from "next"

import { business } from "@/lib/business"
import { niches } from "@/lib/niches"

/**
 * Every niche page is a separate ranking target, so each needs to be
 * discoverable on its own. Priorities reflect that the niche pages — not the
 * general homepage — are the ones meant to win search traffic.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: business.website, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${business.website}/marketing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...niches.map((niche) => ({
      url: `${business.website}/${niche.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ]
}
