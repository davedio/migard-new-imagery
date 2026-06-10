import type { MetadataRoute } from "next";

const SITE_URL = "https://midgard-gateway.vercel.app";

/* Canonical, indexable routes only — /home now permanently redirects to /,
   and /access + /home-alt are intentionally excluded (robots disallows them). */
const ROUTES = [
  "",
  "/how-it-works",
  "/security",
  "/contracts",
  "/get-started",
  "/about",
  "/faq",
  "/official-links",
  "/roadmap",
  "/changelog",
  "/brand",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date("2026-06-10"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/changelog" ? 0.5 : 0.7,
  }));
}
