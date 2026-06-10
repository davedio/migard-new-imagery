"use client";

/* ============================================================================
   CursorWave — the Corn-Revolution header effect: characters near the
   pointer lift and magnify, rippling through the headline as the cursor
   moves. Text is split into per-character spans (words stay unbreakable);
   a lerped rAF loop drives transforms only while the pointer is near, so
   idle cost is zero. Fine pointers + motion-on only.
   ========================================================================== */

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { useMotionPref } from "@/lib/motion";

const RADIUS = 140; // px influence radius around the pointer
const LIFT = 13; // max upward px
const GROW = 0.2; // max extra scale

function splitChars(node: ReactNode, k: { n: number }): ReactNode {
  if (typeof node === "string") {
    return node.split(/(\s+)/).map((seg) => {
      if (seg.length === 0) return null;
      if (seg.trim().length === 0) return seg; // raw whitespace keeps line wrapping
      return (
        <span className="cw-w" key={k.n++}>
          {[...seg].map((ch) => (
            <span className="cw-ch" key={k.n++}>
              {ch}
            </span>
          ))}
        </span>
      );
    });
  }
  if (Array.isArray(node)) return node.map((n) => splitChars(n, k));
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return cloneElement(el, { key: el.key ?? k.n++ }, splitChars(el.props.children, k));
  }
  return node;
}

export function WaveText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { motionOn } = useMotionPref();

  useEffect(() => {
    const root = ref.current;
    if (!root || !motionOn) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const chars = Array.from(root.querySelectorAll<HTMLElement>(".cw-ch"));
    if (chars.length === 0) return;

    let raf = 0;
    let active = false;
    let needMeasure = true;
    let px = -9999;
    let py = -9999;
    const lift = new Array<number>(chars.length).fill(0);
    const centers = new Array<{ x: number; y: number } | null>(chars.length).fill(null);

    const measure = () => {
      for (let i = 0; i < chars.length; i++) {
        const r = chars[i].getBoundingClientRect();
        centers[i] = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      needMeasure = false;
    };

    const near = () => {
      const r = root.getBoundingClientRect();
      return (
        px > r.left - RADIUS &&
        px < r.right + RADIUS &&
        py > r.top - RADIUS &&
        py < r.bottom + RADIUS
      );
    };

    const tick = () => {
      if (needMeasure) measure();
      let energy = 0;
      for (let i = 0; i < chars.length; i++) {
        const c = centers[i];
        if (!c) continue;
        const d = Math.hypot(c.x - px, c.y - py);
        const target = d < RADIUS ? Math.pow(1 - d / RADIUS, 1.7) : 0;
        lift[i] += (target - lift[i]) * 0.16;
        const f = lift[i];
        energy = Math.max(energy, f);
        if (f > 0.004) {
          chars[i].style.transform = `translateY(${(-LIFT * f).toFixed(2)}px) scale(${(
            1 + GROW * f
          ).toFixed(4)})`;
        } else if (chars[i].style.transform) {
          chars[i].style.transform = "";
        }
      }
      if (energy < 0.004 && !near()) {
        active = false; // fully settled and pointer gone — park the loop
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (active) return;
      active = true;
      needMeasure = true;
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!active && near()) wake();
    };
    const onShift = () => {
      needMeasure = true;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onShift, { passive: true });
    window.addEventListener("resize", onShift);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onShift);
      window.removeEventListener("resize", onShift);
      cancelAnimationFrame(raf);
      chars.forEach((c) => (c.style.transform = ""));
    };
  }, [motionOn]);

  return (
    <span ref={ref} className={className}>
      {splitChars(children, { n: 0 })}
    </span>
  );
}
