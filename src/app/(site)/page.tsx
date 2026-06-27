import type { Metadata } from "next";
import MinimalHome from "@/components/minimal/MinimalHome";

export const metadata: Metadata = {
  title: "Midgard | The execution layer for UTXO finance",
  description:
    "Midgard is an optimistic rollup for UTXO finance: faster application execution, verified smart contracts, and Cardano settlement.",
  openGraph: {
    title: "Midgard | The execution layer for UTXO finance",
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
