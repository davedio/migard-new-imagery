import type { Metadata } from "next";
import DeveloperLanding from "@/components/minimal/DeveloperLanding";

export const metadata: Metadata = {
  title: "Developers | Midgard",
  description:
    "Developer paths for Midgard: source code, contracts, protocol review, and Protocol Role participation.",
  openGraph: {
    title: "Developers | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

export default function DevelopersPage() {
  return <DeveloperLanding />;
}
