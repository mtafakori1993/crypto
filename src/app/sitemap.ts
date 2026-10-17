import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { ASSETS } from "@/lib/market/assets";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, priority: 1 },
    { url: `${SITE.url}/markets`, lastModified: now, priority: 0.8 },
    ...ASSETS.map((a) => ({ url: `${SITE.url}/markets/${a.symbol}`, lastModified: now, priority: 0.6 })),
    { url: `${SITE.url}/simulation`, lastModified: now, priority: 0.4 },
  ];
}
