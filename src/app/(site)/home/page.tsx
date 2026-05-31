import type { Metadata } from "next";
import Gateway from "@/components/Gateway";

export const metadata: Metadata = {
  title: "Midgard | Built to Scale. Secured by Math",
  description:
    "Midgard is a Cardano-native optimistic rollup. High-throughput Layer 2 performance with a trust path that settles back to Cardano L1. Fees are paid in ADA.",
};

export default function HomePage() {
  return <Gateway />;
}
