import type { Metadata } from "next";
import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Midgard | Cardano-Native L2 Scaling",
  description:
    "Midgard is a Cardano-native optimistic rollup for applications that need more throughput without leaving Cardano's security assumptions, wallets, tooling, and ecosystem alignment.",
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
        <div className="world-bg" aria-hidden />
        <Providers>{children}</Providers>
        <div className="world-grain" aria-hidden />
      </body>
    </html>
  );
}
