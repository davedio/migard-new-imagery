import type { Metadata } from "next";
import HomeV2 from "@/components/v2/HomeV2";

export const metadata: Metadata = {
  title: "Cinematic Preview | Midgard",
  robots: { index: false, follow: false },
};

export default function CinematicHomePreview() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/plates/worldtree-night-tall.avif"
        fetchPriority="high"
      />
      <HomeV2 />
    </>
  );
}
