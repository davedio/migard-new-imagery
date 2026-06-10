import type { Metadata } from "next";
import GatewayPhotoreal from "@/components/GatewayPhotoreal";

export const metadata: Metadata = {
  title: "Midgard",
  description:
    "Midgard is a Cardano-native optimistic rollup. High-throughput Layer 2 performance with a trust path that settles back to Cardano.",
};

export default function HomePage() {
  return <GatewayPhotoreal />;
}
