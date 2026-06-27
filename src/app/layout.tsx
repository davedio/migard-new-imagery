import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import "./v2.css";
import { Providers } from "./providers";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

const SITE_URL = "https://migard-new-imagery.vercel.app";

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
  description:
    "Midgard is an optimistic rollup for UTXO finance: faster application execution, verified smart contracts, and Cardano settlement.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Midgard | The execution layer for UTXO finance",
    description:
      "An optimistic rollup for UTXO finance: faster application execution, verified smart contracts, and Cardano settlement.",
    url: "/",
    siteName: "Midgard",
    images: [
      {
        url: "/og/home.jpg",
        width: 1200,
        height: 630,
        alt: "Midgard - the execution layer for UTXO finance",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Midgard | The execution layer for UTXO finance",
    description:
      "An optimistic rollup for UTXO finance: faster application execution, verified smart contracts, and Cardano settlement.",
    images: ["/og/home.jpg"],
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
      </body>
    </html>
  );
}
