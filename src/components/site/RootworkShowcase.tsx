"use client";

import dynamic from "next/dynamic";
import { type CSSProperties, type ReactNode } from "react";
import { useInView } from "@/lib/useInView";
import { useMotionPref } from "@/lib/motion";

// "Living Roots" trust-architecture set-piece (How It Works). The R3F runtime +
// scene only mount once the frame scrolls into view; under prefers-reduced-motion
// the scene still renders but holds STILL. Pure R3F — no Spline runtime, no GLB
// download (oak-bark textures only).
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
  /** 0..1 overall activity — scales the sap flow speed. */
  activity?: number;
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
  eyebrow = "Living Roots · Interactive",
  caption = "Verified activity flows down the roots, through the six trust layers, into Cardano L1 settlement.",
  height = "clamp(420px, 64vh, 720px)",
  activity = 0.5,
}: Props) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const { motionOn } = useMotionPref();
  const reduced = !motionOn;

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
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        {eyebrow}
      </div>

      <div ref={ref} style={frame}>
        {inView ? (
          <RootworkScene params={{ activity }} motionOn={motionOn} />
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
