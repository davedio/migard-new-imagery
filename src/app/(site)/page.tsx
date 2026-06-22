import type { Metadata } from "next";
import HomeV2 from "@/components/v2/HomeV2";

export const metadata: Metadata = {
  title: "Midgard",
  description:
    "Midgard is a Cardano-native optimistic rollup. High-throughput Layer 2 performance with a trust path that settles back to Cardano.",
  openGraph: {
    title: "Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

/**
 * Canonical home at `/`, inside the (site) group so it shares nav + footer.
 */
export default function HomePage() {
  return <HomeV2 />;
}
