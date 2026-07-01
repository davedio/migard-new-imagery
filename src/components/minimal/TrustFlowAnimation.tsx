"use client";

/* ============================================================
   TrustFlowAnimation — full-width scroll animation for the home
   page. The six protocol lifecycle steps sit in a full-bleed row;
   scrolling the section into view collapses them into a glowing
   "trust band" (why the abstraction is safe), out of which the
   three user-facing steps (Deposit/Transact/Withdraw) crystallize.
   Scrolling back up reverses it — the pipeline never stopped, the
   user just doesn't have to watch it.

   Respects useMotionPref(): when motion is off, everything renders
   already collapsed with no transition (see the CSS reduced-motion
   guard in v2.css for the hydration-flash edge case).
   ============================================================ */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionPref } from "@/lib/motion";

type TrustBadge = { label: string; detail: string };

export function TrustFlowAnimation({
  steps,
  userSteps,
  copy,
}: {
  steps: readonly (readonly [string, string])[];
  userSteps: readonly string[];
  copy: {
    kicker: string;
    title: string;
    lead: string;
    resolved: { kicker: string; title: string; body: string };
    badges: readonly TrustBadge[];
  };
}) {
  const { motionOn } = useMotionPref();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!motionOn) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { threshold: 0.36, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [motionOn]);

  const collapsed = !motionOn || inView;

  return (
    <div
      ref={ref}
      className={`trust-flow${collapsed ? " is-collapsed" : ""}`}
    >
      <div className="trust-flow__pipeline">
        {steps.map(([label, body], i) => {
          const zone = i < 3 ? "speed" : "verify";
          const zi = i < 3 ? i : i - 3;
          return (
            <div
              className="trust-flow__step"
              data-zone={zone}
              style={{ "--zi": zi } as CSSProperties}
              key={label}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <p>{body}</p>
            </div>
          );
        })}
      </div>

      <div className="trust-flow__band">
        <span className="trust-flow__band-rail" aria-hidden="true">
          <i />
        </span>
        <p className="trust-flow__kicker">{copy.resolved.kicker}</p>
        <h3>{copy.resolved.title}</h3>
        <p className="trust-flow__band-body">{copy.resolved.body}</p>
        <div className="trust-flow__badges">
          {copy.badges.map((badge, i) => (
            <div
              className="trust-flow__badge"
              style={{ "--i": i } as CSSProperties}
              key={badge.label}
            >
              <strong>{badge.label}</strong>
              <span>{badge.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="trust-flow__result">
        <p className="trust-flow__kicker">{copy.kicker}</p>
        <h3>{copy.title}</h3>
        <p className="trust-flow__result-lead">{copy.lead}</p>
        <ol className="trust-flow__user-steps" aria-label="What the user sees">
          {userSteps.map((step, i) => (
            <li style={{ "--i": i } as CSSProperties} key={step}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default TrustFlowAnimation;
