import type { MetadataRoute } from "next";

const SITE_URL = "https://midgard-gateway.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // private preview gate
      disallow: ["/access"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
