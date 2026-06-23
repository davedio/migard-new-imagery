import type { Metadata } from "next";
import MinimalHome from "@/components/minimal/MinimalHome";

export const metadata: Metadata = {
  title: "Midgard | The execution layer for eUTXO finance",
  description:
    "Midgard is the execution layer for eUTXO finance: faster application execution with mathematically verified security and final settlement anchored to L1.",
  openGraph: {
    title: "Midgard | The execution layer for eUTXO finance",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

/**
 * Canonical home at `/`, inside the (site) group so it shares nav + footer.
 * This branch uses the minimalist tree-themed direction as the primary
 * experience; the cinematic version remains available at `/home` for review.
 */
export default function HomePage() {
  return <MinimalHome />;
}
