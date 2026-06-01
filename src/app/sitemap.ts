import type { MetadataRoute } from "next";

const SITE_URL = "https://midgard-website.vercel.app";

const ROUTES = [
  "",
  "/home",
  "/how-it-works",
  "/security",
  "/get-started",
  "/docs",
  "/testnet",
  "/faq",
  "/about",
  "/official-links",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date("2026-05-31"),
    changeFrequency: route === "" || route === "/home" ? "weekly" : "monthly",
    priority: route === "" || route === "/home" ? 1 : 0.7,
  }));
}
