import type { Metadata } from "next";
import { Fraunces, Schibsted_Grotesk, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import "./v2.css";
import { Providers } from "./providers";

/* V2 type system — "Dark Ancient Tech": a carved old-style serif for display
   (Fraunces, variable weight + optical size + italic), a crisp grotesk for
   UI/body (Schibsted), and a HUD mono for data (Spline Sans Mono). */
const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const body = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});
const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-splinemono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://midgard-gateway.vercel.app"),
  title: "Midgard | Cardano-Native L2 Scaling",
  description:
    "Midgard is a Cardano-native optimistic rollup for applications that need faster L2 execution with settlement back to Cardano L1.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Midgard | Cardano-Native L2 Scaling",
    description:
      "A Cardano-native optimistic rollup for faster L2 execution with settlement back to Cardano L1.",
    url: "/",
    siteName: "Midgard",
    images: [
      {
        url: "/og/home.jpg",
        width: 1200,
        height: 630,
        alt: "Midgard — built to scale, rooted in Cardano",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Midgard | Cardano-Native L2 Scaling",
    description:
      "A Cardano-native optimistic rollup for faster L2 execution with settlement back to Cardano L1.",
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
      name: "Midgard",
      url: "https://midgard-gateway.vercel.app",
      logo: "https://midgard-gateway.vercel.app/midgard-icon.png",
      sameAs: [
        "https://github.com/Anastasia-Labs/midgard",
        "https://x.com/midgardprotocol",
        "https://discord.gg/ZpjgHKWaZx",
      ],
      parentOrganization: { "@type": "Organization", name: "Anastasia Labs" },
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
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
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
