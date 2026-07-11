import type { Metadata } from "next";
import MinimalHome from "@/components/minimal/MinimalHome";

export const metadata: Metadata = {
  title: "Midgard | Scaling UTXO finance",
  description:
    "Midgard is an optimistic rollup that helps apps run faster and at a lower cost while keeping settlement and security anchored on Cardano.",
  openGraph: {
    title: "Midgard | Scaling UTXO finance",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

/**
 * Canonical home at `/`, inside the (site) group so it shares nav + footer.
 * This branch uses the minimalist tree-themed direction as the primary
 * experience.
 */
export default function HomePage() {
  return <MinimalHome />;
}
