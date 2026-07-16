import type { MetadataRoute } from "next";

const SITE_URL = "https://migard-new-imagery.vercel.app";

/* Canonical, indexable routes only. Reference material now lives on /learn;
   legacy /faq and /glossary routes redirect to its bookmarks. */
const ROUTES = ["", "/learn", "/users", "/developers", "/participate", "/status", "/official-links"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date("2026-06-11"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
