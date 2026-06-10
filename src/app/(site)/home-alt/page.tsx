import type { Metadata } from "next";
import Gateway from "@/components/Gateway";

export const metadata: Metadata = {
  title: "Midgard — Classic tree hero (alt)",
  description:
    "Alternate Midgard home hero: the original stylized world-tree with live sap particles, settling to Cardano.",
};

export default function HomeAltPage() {
  return <Gateway />;
}
