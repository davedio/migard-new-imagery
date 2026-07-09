import type { MetadataRoute } from "next";

const SITE_URL = "https://migard-new-imagery.vercel.app";

/* Canonical, indexable routes only. /contracts and /how-it-works redirect into current pages. */
const ROUTES = ["", "/learn", "/users", "/economics", "/developers", "/participate", "/faq", "/glossary", "/status", "/official-links"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date("2026-06-11"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
