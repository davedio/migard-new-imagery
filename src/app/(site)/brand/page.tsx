import type { Metadata } from "next";
import Image from "next/image";
import { PageHero, Section, Prose, Callout } from "@/components/site/ui";
import { NextSteps } from "@/components/site/NextSteps";

export const metadata: Metadata = {
  title: "Midgard Brand Kit",
  description:
    "Official Midgard logos, colors, and typography, plus usage guidance. Download the marks and link back to the official site.",
  openGraph: {
    title: "Midgard Brand Kit",
    images: [{ url: "/og/brand.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/brand.jpg"] },
};

const COLORS: { name: string; hex: string; note: string }[] = [
  { name: "Background", hex: "#060d09", note: "Near-black emerald ground" },
  { name: "Green bright", hex: "#3be863", note: "Primary accent, sap and signals" },
  { name: "Gold", hex: "#cf9a2e", note: "Proof and bridge accents" },
  { name: "Cardano cobalt", hex: "#0033ad", note: "Layer 1 settlement" },
  { name: "Text high", hex: "#eef5ef", note: "Headlines" },
  { name: "Text dim", hex: "#9eb3a4", note: "Supporting copy" },
];

export default function BrandPage() {
  return (
    <main className="page-main">
      <PageHero
        compact
        tone="emerald"
        label="Brand kit"
        title="The Midgard marks"
        sub="Official logos, colors, and typography for press, partners, and community use. When in doubt, link back to the official site and keep the tree intact."
        actions={[
          { label: "Download logo (PNG)", href: "/midgard-logo.png", variant: "primary" },
          { label: "Download icon (PNG)", href: "/midgard-icon.png", variant: "ghost" },
        ]}
      />

      <Section eyebrow="Marks" title="Logo and icon">
        <div className="brand-marks">
          <figure className="brand-mark panel">
            <div className="brand-mark__stage">
              <Image src="/midgard-logo.png" alt="Midgard wordmark logo" width={260} height={80} style={{ height: "auto", maxWidth: "100%", width: "auto", maxHeight: 96 }} />
            </div>
            <figcaption>
              <strong>Wordmark</strong>
              <a href="/midgard-logo.png" download>
                Download PNG
              </a>
            </figcaption>
          </figure>
          <figure className="brand-mark panel">
            <div className="brand-mark__stage">
              <Image src="/midgard-icon.png" alt="Midgard tree-in-circle icon" width={96} height={96} />
            </div>
            <figcaption>
              <strong>Icon</strong>
              <a href="/midgard-icon.png" download>
                Download PNG
              </a>
            </figcaption>
          </figure>
        </div>
        <Callout body="Keep clear space around the marks of at least the icon's radius. Don't recolor, stretch, outline, or place the marks on busy imagery without a scrim." />
      </Section>

      <Section eyebrow="Color" title="The palette">
        <div className="brand-colors">
          {COLORS.map((c) => (
            <div className="brand-color panel" key={c.hex}>
              <span className="brand-color__swatch" style={{ background: c.hex }} aria-hidden />
              <span className="brand-color__name">{c.name}</span>
              <code className="brand-color__hex">{c.hex}</code>
              <span className="brand-color__note">{c.note}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Type" title="Typography">
        <Prose
          items={[
            {
              text: "Display headlines are set in the site's display face, body copy in a humanist sans, and HUD labels, kickers, and telemetry in a monospace. Mono is always uppercase with wide tracking when used as a label.",
            },
            {
              text: "Voice: calm, verifiable, no hype. Claims stay qualified until benchmarked, headlines don't take trailing periods, and 'Layer 2' is spelled out in prose with 'L2' reserved for HUD chips.",
              variant: "dim",
            },
          ]}
        />
      </Section>

      <NextSteps
        items={[
          {
            label: "About Midgard",
            sub: "The story to quote: use cases, features, incentives",
            href: "/about",
          },
          {
            label: "Official links",
            sub: "Canonical URLs to link against",
            href: "/official-links",
          },
        ]}
      />
    </main>
  );
}
