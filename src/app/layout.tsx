import type { Metadata } from "next";
import { Poppins, Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import "./v2.css";
import { Providers } from "./providers";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

/* Original Midgard type system: Syne/Poppins display, Inter body,
   JetBrains Mono data — the V2 layout keeps its scale and choreography
   but speaks in the brand's own voice. */
const display = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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
  metadataBase: new URL("https://midgard-gateway.vercel.app"),
  title: "Midgard | The execution layer for UTXO finance",
  description:
    "Midgard is an optimistic rollup for UTXO finance: faster application execution, public fault-proof verification, and Cardano L1 settlement after verification.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Midgard | The execution layer for UTXO finance",
    description:
      "An optimistic rollup for UTXO finance: faster application execution, public fault-proof verification, and Cardano L1 settlement after verification.",
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
      "An optimistic rollup for UTXO finance: faster application execution, public fault-proof verification, and Cardano L1 settlement after verification.",
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
      "@id": "https://midgard-gateway.vercel.app/#org",
      name: "Midgard Labs",
      url: "https://midgard-gateway.vercel.app",
      logo: "https://midgard-gateway.vercel.app/midgard-icon.png",
      sameAs: [
        "https://github.com/Anastasia-Labs/midgard",
        "https://x.com/midgardprotocol",
        "https://discord.gg/ZpjgHKWaZx",
      ],
    },
    {
      "@type": "WebSite",
      name: "Midgard",
      url: "https://midgard-gateway.vercel.app",
      publisher: { "@id": "https://midgard-gateway.vercel.app/#org" },
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
        {/* applies the stored theme before first paint — no dark->light flash */}
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
