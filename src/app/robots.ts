import type { MetadataRoute } from "next";

const SITE_URL = "https://midgard-gateway.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // private preview gate + unlisted design exploration
      disallow: ["/access", "/home-alt"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
