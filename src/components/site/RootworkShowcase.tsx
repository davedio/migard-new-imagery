"use client";

import dynamic from "next/dynamic";
import { type CSSProperties, type ReactNode } from "react";
import { useInView } from "@/lib/useInView";
import { useMotionPref } from "@/lib/motion";
import { useNetworkSnapshot } from "@/lib/useNetworkSnapshot";
import type { ProofStatus } from "@/lib/network";

// "Living Roots" trust-architecture set-piece (How It Works / Security). The
// R3F runtime + scene only mount once the frame scrolls into view; under
// prefers-reduced-motion the scene still renders but holds STILL. Pure R3F —
// no Spline runtime, no GLB download (oak-bark textures only).
// NOTE: activity and proofStatus are derived from the SIMULATED network
// snapshot (source: "demo"). Data is NOT verified live protocol data.
const RootworkScene = dynamic(
  () => import("@/components/scene/RootworkScene"),
  {
    ssr: false,
    loading: () => <Centered>Loading 3D…</Centered>,
  },
);

type Props = {
  eyebrow?: string;
  caption?: string;
  height?: string;
};

function Centered({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        color: "var(--text-dim)",
        font: "0.8rem/1.4 var(--font-mono)",
        letterSpacing: "0.04em",
        pointerEvents: "none",
      }}
    >
      <span>{children}</span>
    </div>
  );
}

export default function RootworkShowcase({
  eyebrow = "SIMULATED · Living Roots · Trust Architecture",
  caption = "Sap-flow speed and proof-ring intensity reflect simulated L2 activity. Data source: demo feed — not verified live protocol data.",
  height = "clamp(420px, 64vh, 720px)",
}: Props) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const { motionOn } = useMotionPref();
  const reduced = !motionOn;

  // Derive activity and proofStatus from the simulated network snapshot.
  // throughput is 0..~40 ops/s (mock); clamp to 0..1 for the scene.
  const { data: snap } = useNetworkSnapshot();
  const activity = Math.min(1, Math.max(0, snap.l2.throughput / 40));
  const proofStatus: ProofStatus = snap.l2.latestProofStatus;

  const frame: CSSProperties = {
    position: "relative",
    width: "100%",
    height,
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    border: "1px solid var(--panel-edge-strong)",
    background:
      "radial-gradient(120% 90% at 50% 0%, var(--green-ghost), transparent 55%), #060f09",
  };

  return (
    <section
      style={{
        maxWidth: "var(--maxw)",
        margin: "0 auto",
        padding: "clamp(24px, 4vh, 56px) var(--gut)",
      }}
    >
      {/* SIMULATED eyebrow — makes the demo nature of the data unambiguous */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div className="eyebrow">{eyebrow}</div>
        <span className="chip chip--demo" aria-label="Simulated feed — not live data">
          Simulated feed
        </span>
      </div>

      <div ref={ref} style={frame}>
        {inView ? (
          <RootworkScene
            params={{ activity, proofStatus }}
            motionOn={motionOn}
          />
        ) : (
          <Centered>3D scene</Centered>
        )}
      </div>

      {caption ? (
        <p
          style={{
            marginTop: 12,
            color: "var(--text-dim)",
            font: "0.85rem/1.4 var(--font-mono)",
          }}
        >
          {caption}
          {reduced ? " · motion paused" : ""}
        </p>
      ) : null}
    </section>
  );
}
