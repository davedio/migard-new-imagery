import type { Metadata } from "next";
import DeveloperLanding from "@/components/minimal/DeveloperLanding";

export const metadata: Metadata = {
  title: "Developers | Midgard",
  description:
    "Developer paths for Midgard: source code, Cardano preprod launch updates, protocol review, and future protocol role participation.",
  openGraph: {
    title: "Developers | Midgard",
    images: [{ url: "/og/get-started.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/get-started.jpg"] },
};

export default function DevelopersPage() {
  return <DeveloperLanding />;
}
