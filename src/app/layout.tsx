import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import "./v2.css";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { SITE_LANGUAGE, SITE_URL } from "@/lib/siteConfig";
import {
  createPageMetadata,
  INDEXABLE_PAGE_METADATA,
  PAGE_METADATA,
} from "@/lib/siteMetadata";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

/* Type system: Fraunces — a high-contrast "wonky" old-style serif with
   ball terminals — sets the headlines (the new editorial direction);
   Inter carries body copy, JetBrains Mono the data/code, and Syne is
   retained for the Midgard wordmark lockup only. */
const display = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...createPageMetadata("home"),
  applicationName: "Midgard",
  creator: "Midgard Labs, Inc.",
  publisher: "Midgard Labs, Inc.",
  icons: {
    icon: "/midgard-icon.png",
    apple: "/midgard-icon.png",
  },
};

/* Organization, WebSite, and canonical public WebPage data, emitted once sitewide. */
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Midgard Labs, Inc.",
      url: SITE_URL,
      logo: `${SITE_URL}/midgard-icon.png`,
      sameAs: [OFFICIAL_LINKS.github, OFFICIAL_LINKS.x, OFFICIAL_LINKS.discord],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Midgard",
      url: SITE_URL,
      description: PAGE_METADATA.home.description,
      inLanguage: SITE_LANGUAGE,
      publisher: { "@id": `${SITE_URL}/#org` },
      hasPart: INDEXABLE_PAGE_METADATA.map((page) => {
        const url = page.path === "/" ? SITE_URL : `${SITE_URL}${page.path}`;
        return {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: page.title,
          description: page.description,
          inLanguage: SITE_LANGUAGE,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: { "@id": `${SITE_URL}/#org` },
        };
      }),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={SITE_LANGUAGE}
      className={`${display.variable} ${body.variable} ${mono.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* applies the light site theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        <div className="world-bg" aria-hidden />
        <Providers>{children}</Providers>
        <div className="world-grain" aria-hidden />
        <Analytics />
      </body>
    </html>
  );
}
