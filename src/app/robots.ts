import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/markets", "/simulation"], disallow: ["/api/", "/dashboard", "/portfolio", "/wallet", "/orders", "/account", "/trade/", "/login", "/register", "/forgot-password"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
