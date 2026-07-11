import type { Metadata } from "next";
import FaqSections from "@/components/site/FaqSections";
import JumpChips from "@/components/site/JumpChips";
import PageBackdrop from "@/components/site/PageBackdrop";
import { PageHero } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "FAQ | Midgard",
  description:
    "Short answers about Midgard product status, security assumptions, protocol roles, and what to check before relying on it.",
  openGraph: {
    title: "FAQ | Midgard",
    images: [{ url: "/og/faq.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/faq.jpg"] },
};

export default function FaqPage() {
  return (
    <main className="page-main">
      <PageBackdrop name="forest-path" variant="full" focus="50% 48%" />
      <PageHero
        compact
        tone="moss"
        label="FAQ"
        title="Questions."
        sub="Short answers on what Midgard is, how its security works, and what to check before relying on it."
        actions={[
          { label: "See glossary", href: "/glossary", variant: "primary" },
          { label: "Learn how it works", href: "/learn", variant: "ghost" },
        ]}
      />

      {/* One chip per FAQ group (ids from faqGroupId in ui.tsx), so the bar
          actually navigates a ~21-question page instead of decorating it. */}
      <JumpChips
        items={[
          { id: "faq-product-status", label: "Status" },
          { id: "faq-costs-wallets-funds", label: "Costs & wallets" },
          { id: "faq-security", label: "Security" },
          { id: "faq-protocol-roles-and-status", label: "Roles" },
          { id: "comparison", label: "Compare" },
        ]}
      />

      <FaqSections />
    </main>
  );
}
