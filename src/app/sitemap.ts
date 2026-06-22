import type { MetadataRoute } from "next";

const SITE_URL = "https://midgard-gateway.vercel.app";

/* Canonical, indexable routes only — /home and /faqs redirect, and /access is
   intentionally excluded (robots disallows it). */
const ROUTES = ["", "/how-it-works", "/security", "/faq"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date("2026-06-11"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
