import type { CSSProperties, ReactNode } from "react";

/* =========================================================================
   HUD overlay kit — "ancient-tech instrument" chrome built from pure CSS/SVG
   (classes defined in globals.css). Zero WebGL cost; all motion is disabled
   automatically under prefers-reduced-motion. Server components.

   The primary tool for filling below-fold content sections with legible
   signal without paying for a canvas.
   ========================================================================= */

/** Four L-shaped corner brackets. Drop inside any position:relative box. */
export function CornerBrackets() {
  return (
    <>
      <span className="hud-bracket hud-bracket--tl" aria-hidden />
      <span className="hud-bracket hud-bracket--tr" aria-hidden />
      <span className="hud-bracket hud-bracket--bl" aria-hidden />
      <span className="hud-bracket hud-bracket--br" aria-hidden />
    </>
  );
}

/** CRT-style scanline overlay. Set `animated` for a slow vertical drift. */
export function Scanlines({ animated = false }: { animated?: boolean }) {
  return (
    <div
      className={`hud-scanlines${animated ? " hud-scanlines--animated" : ""}`}
      aria-hidden
    />
  );
}

export type ReadoutRow = {
  k: string;
  v: ReactNode;
  /** Tint the value gold (proof / settlement) instead of green. */
  gold?: boolean;
  /** Append a blinking terminal cursor after the value. */
  cursor?: boolean;
};

/** Monospace key/value telemetry block. */
export function DataReadout({
  rows,
  style,
}: {
  rows: ReadoutRow[];
  style?: CSSProperties;
}) {
  return (
    <dl className="hud-readout" style={style}>
      {rows.map((r) => (
        <div className="hud-readout__row" key={r.k}>
          <dt className="hud-readout__k">{r.k}</dt>
          <dd
            className={`hud-readout__v${r.gold ? " hud-readout__v--gold" : ""}${
              r.cursor ? " hud-cursor" : ""
            }`}
          >
            {r.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A relative frame that layers corner brackets (and optional scanlines) over
 * its children — wrap a card, scene, or stat panel to give it instrument chrome.
 */
export function HudFrame({
  children,
  scanlines = false,
  animatedScanlines = false,
  className,
  style,
}: {
  children: ReactNode;
  scanlines?: boolean;
  animatedScanlines?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`hud-frame${className ? ` ${className}` : ""}`} style={style}>
      {children}
      {scanlines ? <Scanlines animated={animatedScanlines} /> : null}
      <CornerBrackets />
    </div>
  );
}

/**
 * A full-width section divider with a travelling light node and an optional
 * mono label on each side — a cheap "data is flowing through here" beat
 * between content sections.
 */
export function HudDivider({
  left,
  right,
}: {
  left?: string;
  right?: string;
}) {
  return (
    <div className="hud-divider" role="presentation">
      {left ? <span>{left}</span> : null}
      <span className="hud-divider__line" aria-hidden />
      {right ? <span>{right}</span> : null}
    </div>
  );
}
