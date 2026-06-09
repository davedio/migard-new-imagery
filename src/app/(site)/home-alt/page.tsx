import type { Metadata } from "next";
import GatewayPhotoreal from "@/components/GatewayPhotoreal";

export const metadata: Metadata = {
  title: "Midgard — Photoreal hero (alt)",
  description:
    "Alternate Midgard home hero: a photoreal world-tree that scans from the canopy down to the Cardano-L1 roots as you scroll, with ambient sap orbs.",
};

export default function HomeAltPage() {
  return <GatewayPhotoreal />;
}
