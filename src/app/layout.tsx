import type { Metadata } from "next";
import { Poppins, Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
        url: "/hero-tree-green.png",
        width: 1672,
        height: 941,
        alt: "Midgard world-tree protocol architecture",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Midgard | Cardano-Native L2 Scaling",
    description:
      "A Cardano-native optimistic rollup for faster L2 execution with settlement back to Cardano L1.",
    images: ["/hero-tree-green.png"],
  },
  icons: {
    icon: "/midgard-icon.png",
    apple: "/midgard-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${syne.variable}`}
    >
      <body>
        <div className="world-bg" aria-hidden />
        <Providers>{children}</Providers>
        <div className="world-grain" aria-hidden />
      </body>
    </html>
  );
}
