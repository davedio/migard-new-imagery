import type { Metadata } from "next";
import HomeV2 from "@/components/v2/HomeV2";

export const metadata: Metadata = {
  title: "Midgard | The execution layer for UTXO finance",
  description:
    "Midgard is an optimistic rollup for UTXO finance, giving applications faster execution with settlement rooted in Cardano.",
  openGraph: {
    title: "Midgard | The execution layer for UTXO finance",
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
