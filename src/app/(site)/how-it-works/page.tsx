import type { Metadata } from "next";
import HowItWorksExperience from "@/components/HowItWorksExperience";

export const metadata: Metadata = {
  title: "How Midgard Works",
  description:
    "How Midgard runs as a Cardano-native optimistic rollup: submit, sequence, commit, watch, and settle back to Cardano.",
};

export default function HowItWorksPage() {
  // The flagship 3D transaction journey IS the page: scroll RIDES a transaction
  // from the canopy down to Cardano L1, and the floating on-tree stage graphic
  // explains the full lifecycle on its own. The at-a-glance stats, the eUTXO
  // comparison, the roadmap, and the CTA now live on the /home-alt landing page.
  return <HowItWorksExperience>{null}</HowItWorksExperience>;
}
