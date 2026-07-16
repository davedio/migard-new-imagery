import type { MetadataRoute } from "next";
import { METADATA_UPDATED_AT, SITE_URL } from "@/lib/siteConfig";
import { INDEXABLE_PAGE_METADATA } from "@/lib/siteMetadata";

/* Canonical, indexable routes only. Reference material now lives on /learn;
   legacy /faq and /glossary routes redirect to its bookmarks. */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PAGE_METADATA.map((page) => ({
    url: page.path === "/" ? SITE_URL : `${SITE_URL}${page.path}`,
    lastModified: new Date(`${METADATA_UPDATED_AT}T00:00:00.000Z`),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
