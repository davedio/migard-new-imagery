import type { MetadataRoute } from "next";

const SITE_URL = "https://midgard-gateway.vercel.app";

/* Canonical, indexable routes only. /minimal is a private design preview,
   /faqs redirects, and /access is intentionally excluded. */
const ROUTES = ["", "/learn", "/developers", "/contracts", "/how-it-works", "/faq"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date("2026-06-11"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
