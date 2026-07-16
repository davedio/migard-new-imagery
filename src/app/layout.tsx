import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import "./v2.css";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import { SITE_COPY } from "@/lib/siteCopy";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

const SITE_URL = "https://migard-new-imagery.vercel.app";
const HOME_SHARE_IMAGE = "/img/tree/tree-hero-vista-1920.webp?share=2026-07-16";

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
  title: "Midgard | The execution layer for UTXO finance",
  description: SITE_COPY.hero.lead,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Midgard | The execution layer for UTXO finance",
    description: SITE_COPY.hero.lead,
    url: "/",
    siteName: "Midgard",
    images: [
      {
        url: HOME_SHARE_IMAGE,
        width: 1920,
        height: 1072,
        alt: "Midgard's watercolor World Tree overlooking the Cardano landscape",
        type: "image/webp",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Midgard | The execution layer for UTXO finance",
    description: SITE_COPY.hero.lead,
    images: [HOME_SHARE_IMAGE],
  },
  icons: {
    icon: "/midgard-icon.png",
    apple: "/midgard-icon.png",
  },
};

/* Organization + WebSite structured data — emitted once, sitewide. */
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Midgard Labs",
      url: SITE_URL,
      logo: `${SITE_URL}/midgard-icon.png`,
      sameAs: [
        "https://github.com/Anastasia-Labs/midgard",
        "https://x.com/midgardprotocol",
        "https://discord.gg/ZpjgHKWaZx",
      ],
    },
    {
      "@type": "WebSite",
      name: "Midgard",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
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
