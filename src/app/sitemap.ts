import type { MetadataRoute } from "next";

const SITE_URL = "https://migard-new-imagery.vercel.app";

/* Canonical, indexable routes only. /contracts, /how-it-works, and /economics redirect into current pages. */
const ROUTES = ["", "/learn", "/users", "/developers", "/participate", "/faq", "/glossary", "/status", "/official-links"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date("2026-06-11"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
