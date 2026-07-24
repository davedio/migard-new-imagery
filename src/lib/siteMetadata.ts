import type { Metadata } from "next";
import {
  METADATA_UPDATED_AT,
  SITE_NAME,
} from "@/lib/siteConfig";
import { DEVELOPER_COPY, SITE_COPY } from "@/lib/siteCopy";

type PageMetadataDefinition = {
  path: `/${string}` | "/";
  title: string;
  description: string;
  image: `/${string}`;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  indexable?: boolean;
  changeFrequency?: "daily" | "weekly" | "monthly";
  priority?: number;
};

export const PAGE_METADATA = {
  home: {
    path: "/",
    title: "Midgard | The execution layer for UTXO finance",
    description: SITE_COPY.hero.lead,
    image: "/img/tree/tree-hero-vista-1920.webp",
    imageWidth: 1920,
    imageHeight: 1072,
    imageAlt: "Midgard watercolor World Tree overlooking the Cardano landscape",
    indexable: true,
    changeFrequency: "weekly",
    priority: 1,
  },
  learn: {
    path: "/learn",
    title: "Learn | Midgard",
    description:
      "How Midgard works, what makes it checkable, and the terms used across the protocol.",
    image: "/img/watercolor/journey-descent-hero.webp",
    imageWidth: 1440,
    imageHeight: 1661,
    imageAlt: "Midgard World Tree journey from transaction execution to Cardano settlement",
    indexable: true,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  users: {
    path: "/users",
    title: "Users | Midgard",
    description:
      "Faster execution for Cardano apps, with fees paid directly in ADA and settlement through Cardano L1.",
    image: "/img/watercolor/terraces.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor terraces representing the Midgard user path",
    indexable: true,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  developers: {
    path: "/developers",
    title: "Developers | Midgard",
    description: DEVELOPER_COPY.hero.lead,
    image: "/img/watercolor/forest-path.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor forest path representing the Midgard developer path",
    indexable: true,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  participate: {
    path: "/participate",
    title: "Participate | Midgard",
    description:
      "Operators earn fees for sequencing transactions. Watchers verify commitments and can earn from a valid fault proof. Both help secure Midgard.",
    image: "/img/watercolor/sentinel-watch.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor sentinel overlooking the Midgard protocol landscape",
    indexable: true,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  status: {
    path: "/status",
    title: "Network Status | Midgard",
    description:
      "Current Midgard network status: what is available now, what comes next on Cardano preprod, and what remains planned.",
    image: "/img/watercolor/signal-cairn.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor signal cairn representing Midgard network status",
    indexable: true,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  officialLinks: {
    path: "/official-links",
    title: "Official Links | Midgard",
    description:
      "Official Midgard links. If it is not listed here, it is not us. Midgard is pre-alpha; there is no Midgard token. Fees are paid in ADA.",
    image: "/img/watercolor/rune-stones.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor rune stones marking Midgard official links",
    indexable: true,
    changeFrequency: "weekly",
    priority: 0.8,
  },
  roadmap: {
    path: "/roadmap",
    title: "Roadmap | Midgard",
    description:
      "The Midgard roadmap from Cardano preprod to mainnet: work-paced, date-free, and checkable.",
    image: "/img/watercolor/winding-road.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor winding road representing Midgard's path to mainnet",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy | Midgard",
    description:
      "How Midgard Labs collects, uses, shares, and retains information on the Midgard website.",
    image: "/img/watercolor/valley.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor valley behind the Midgard Privacy Policy",
  },
  terms: {
    path: "/terms",
    title: "Terms of Use | Midgard",
    description: "The Terms of Use governing the Midgard website and documentation pages.",
    image: "/img/watercolor/stone-gateway.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor stone gateway behind the Midgard Terms of Use",
  },
  cookies: {
    path: "/cookies",
    title: "Cookie Notice | Midgard",
    description: "How the Midgard website uses cookies and similar technologies.",
    image: "/img/watercolor/canopy-light.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor canopy behind the Midgard Cookie Notice",
  },
  securityPolicy: {
    path: "/security-policy",
    title: "Vulnerability Disclosure Policy | Midgard",
    description:
      "How to report security vulnerabilities in the Midgard website, repositories, and test-network deployments.",
    image: "/img/watercolor/tree-vista-wide.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor World Tree behind the Midgard Vulnerability Disclosure Policy",
  },
  officialChannels: {
    path: "/official-channels",
    title: "Official Channels & Scam Safety | Midgard",
    description:
      "The policy record of which Midgard channels are real, what we will never do, and how to report impersonations.",
    image: "/img/watercolor/trunk-runes.webp",
    imageWidth: 2200,
    imageHeight: 1228,
    imageAlt: "Watercolor runes behind the Midgard official channels policy",
  },
} as const satisfies Record<string, PageMetadataDefinition>;

export type PageMetadataKey = keyof typeof PAGE_METADATA;
type PageMetadataEntry = (typeof PAGE_METADATA)[PageMetadataKey];
type IndexablePageMetadata = Extract<PageMetadataEntry, { indexable: true }>;

function versionedImage(image: string) {
  return `${image}?share=${METADATA_UPDATED_AT}`;
}

export function createPageMetadata(key: PageMetadataKey): Metadata {
  const page = PAGE_METADATA[key];
  const image = versionedImage(page.image);
  const indexable = "indexable" in page && page.indexable === true;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: page.path,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.path,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: image,
          width: page.imageWidth,
          height: page.imageHeight,
          alt: page.imageAlt,
          type: "image/webp",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [{ url: image, alt: page.imageAlt }],
    },
    robots: indexable ? undefined : { index: false, follow: false },
  };
}

export const INDEXABLE_PAGE_METADATA = Object.values(PAGE_METADATA).filter(
  (page): page is IndexablePageMetadata =>
    "indexable" in page && page.indexable === true,
);
