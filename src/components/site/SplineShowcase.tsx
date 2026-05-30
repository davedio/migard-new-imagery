"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

// Spline 3D embed (spike). The runtime + scene payload only loads once the
// frame scrolls into view, and not at all under prefers-reduced-motion — keeps
// the initial/mobile load light. Swap `scene` with your own published Spline
// URL; the default below is Spline's public demo scene (placeholder only).
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <Centered>Loading 3D…</Centered>,
});

const DEMO_SCENE = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

type Props = {
  scene?: string;
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

export default function SplineShowcase({
  scene = DEMO_SCENE,
  eyebrow = "Interactive · Spline",
  caption = "Demo scene — placeholder for a Midgard model.",
  height = "clamp(360px, 56vh, 620px)",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showScene = inView && !reduced;

  const frame: CSSProperties = {
    position: "relative",
    width: "100%",
    height,
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    border: "1px solid var(--panel-edge-strong)",
    background:
      "radial-gradient(120% 90% at 70% 8%, var(--green-ghost), transparent 60%), var(--panel)",
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
        {showScene ? (
          <Spline
            scene={scene}
            onLoad={() => setLoaded(true)}
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}

        {showScene && !loaded ? <Centered>Loading 3D…</Centered> : null}

        {!showScene ? (
          <Centered>
            {reduced ? "3D paused · reduced motion" : "3D scene"}
          </Centered>
        ) : null}
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
        </p>
      ) : null}
    </section>
  );
}
