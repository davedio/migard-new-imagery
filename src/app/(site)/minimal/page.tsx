import type { Metadata } from "next";
import MinimalHome from "@/components/minimal/MinimalHome";

export const metadata: Metadata = {
  title: "Minimal Preview | Midgard",
  description:
    "A minimalist Midgard homepage preview with a heavy tree theme, role routing, concept animation, and official channels.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Minimal Preview | Midgard",
    images: [{ url: "/og/home.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.jpg"] },
};

export default function MinimalPreviewPage() {
  return <MinimalHome />;
}
