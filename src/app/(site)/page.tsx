import type { Metadata } from "next";
import HomeV2 from "@/components/v2/HomeV2";

export const metadata: Metadata = {
  title: "Midgard | Scale UTXO finance. Keep L1 security.",
  description:
    "Midgard is an optimistic rollup that gives UTXO applications faster execution with settlement anchored to L1.",
  openGraph: {
    title: "Midgard | Scale UTXO finance. Keep L1 security.",
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
