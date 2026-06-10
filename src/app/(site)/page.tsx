import type { Metadata } from "next";
import { cookies } from "next/headers";
import GatewayPhotoreal from "@/components/GatewayPhotoreal";
import { SplashOverlay } from "@/components/site/SplashOverlay";

export const metadata: Metadata = {
  title: "Midgard",
  description:
    "Midgard is a Cardano-native optimistic rollup. High-throughput Layer 2 performance with a trust path that settles back to Cardano.",
  openGraph: {
    title: "Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

/**
 * Canonical home at `/`, inside the (site) group so it shares nav + footer.
 *
 * First-time visitors get the one-time SplashOverlay (the old `/` title card,
 * now a fixed layer above the chrome). Entering sets the `midgard_entered`
 * cookie; because this is an async server component that reads cookies(),
 * returning visitors never render the overlay at all — no flash, no client
 * check. The old standalone splash route (src/app/page.tsx) is gone and
 * /home permanently redirects here.
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  const entered = cookieStore.has("midgard_entered");

  return (
    <>
      {!entered ? <SplashOverlay /> : null}
      <GatewayPhotoreal />
    </>
  );
}
