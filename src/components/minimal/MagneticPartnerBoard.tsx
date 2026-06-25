"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import type { EcosystemPartner } from "@/lib/ecosystemPartners";

type LayoutSlot = {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

const LAYOUT: Record<string, LayoutSlot> = {
  WingRiders: { col: 1, row: 1, colSpan: 4, rowSpan: 2 },
  "Anvil Dev Agency": { col: 5, row: 1, colSpan: 3, rowSpan: 2 },
  Tweag: { col: 8, row: 1, colSpan: 3, rowSpan: 2 },
  "Modus Create": { col: 1, row: 3, colSpan: 3, rowSpan: 2 },
  Minswap: { col: 4, row: 3, colSpan: 2, rowSpan: 2 },
  Liqwid: { col: 6, row: 3, colSpan: 3, rowSpan: 2 },
  USDCx: { col: 9, row: 3, colSpan: 2, rowSpan: 2 },
  Midgard: { col: 2, row: 5, colSpan: 4, rowSpan: 2 },
  "Anastasia Labs": { col: 6, row: 5, colSpan: 5, rowSpan: 2 },
};

const DEFAULT_SLOT: LayoutSlot = { col: 1, row: 1, colSpan: 2, rowSpan: 2 };

type PartnerCardState = {
  element: HTMLElement;
  base: DOMRect;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  phase: number;
};

const isSvgLogo = (logo: string) => logo.endsWith(".svg");

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCardRect(state: PartnerCardState) {
  const { base, targetX, targetY } = state;
  return {
    left: base.left + targetX,
    right: base.right + targetX,
    top: base.top + targetY,
    bottom: base.bottom + targetY,
    centerX: base.left + base.width / 2 + targetX,
    centerY: base.top + base.height / 2 + targetY,
  };
}

function separateCards(states: PartnerCardState[]) {
  const margin = 5;

  for (let pass = 0; pass < 3; pass += 1) {
    for (let a = 0; a < states.length; a += 1) {
      for (let b = a + 1; b < states.length; b += 1) {
        const cardA = getCardRect(states[a]);
        const cardB = getCardRect(states[b]);
        const overlapX = Math.min(cardA.right, cardB.right) - Math.max(cardA.left, cardB.left) + margin;
        const overlapY = Math.min(cardA.bottom, cardB.bottom) - Math.max(cardA.top, cardB.top) + margin;

        if (overlapX <= 0 || overlapY <= 0) {
          continue;
        }

        if (overlapX < overlapY) {
          const direction = cardA.centerX <= cardB.centerX ? -1 : 1;
          const push = overlapX / 2;
          states[a].targetX += direction * push;
          states[b].targetX -= direction * push;
        } else {
          const direction = cardA.centerY <= cardB.centerY ? -1 : 1;
          const push = overlapY / 2;
          states[a].targetY += direction * push;
          states[b].targetY -= direction * push;
        }

        states[a].targetX = clamp(states[a].targetX, -44, 44);
        states[a].targetY = clamp(states[a].targetY, -34, 34);
        states[b].targetX = clamp(states[b].targetX, -44, 44);
        states[b].targetY = clamp(states[b].targetY, -34, 34);
      }
    }
  }
}

export function MagneticPartnerBoard({ partners }: { partners: readonly EcosystemPartner[] }) {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!board || reduceMotion) {
      return undefined;
    }

    const cardElements = Array.from(board.querySelectorAll<HTMLElement>("[data-magnet-card]"));
    const pointer = { x: 0, y: 0, active: false };
    let states: PartnerCardState[] = [];
    let frame = 0;

    const refreshGeometry = () => {
      states = cardElements.map((element, index) => ({
        element,
        base: element.getBoundingClientRect(),
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        phase: index * 0.72,
      }));
    };

    const updateTargets = (time: number) => {
      const boardRect = board.getBoundingClientRect();
      const radius = clamp(boardRect.width * 0.32, 180, 310);

      for (const state of states) {
        const centerX = state.base.left + state.base.width / 2;
        const centerY = state.base.top + state.base.height / 2;
        const dx = centerX - pointer.x;
        const dy = centerY - pointer.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const strength = pointer.active ? Math.max(0, 1 - distance / radius) : 0;
        const easedStrength = strength * strength;
        const idleX = Math.sin(time / 1800 + state.phase) * 2.4;
        const idleY = Math.cos(time / 2100 + state.phase) * 2.1;

        state.targetX = (dx / distance) * easedStrength * 38 + idleX;
        state.targetY = (dy / distance) * easedStrength * 30 + idleY;
      }

      separateCards(states);
    };

    const animate = (time: number) => {
      updateTargets(time);

      for (const state of states) {
        state.x += (state.targetX - state.x) * 0.16;
        state.y += (state.targetY - state.y) * 0.16;

        const rotation = clamp(state.x * 0.035, -1.25, 1.25);
        const lift = pointer.active ? 1.012 : 1;
        state.element.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(
          2,
        )}px, 0) rotate(${rotation.toFixed(3)}deg) scale(${lift})`;
      }

      frame = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    refreshGeometry();
    board.addEventListener("pointermove", onPointerMove);
    board.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", refreshGeometry);
    frame = window.requestAnimationFrame(animate);

    return () => {
      board.removeEventListener("pointermove", onPointerMove);
      board.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", refreshGeometry);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="partner-magnet-board" ref={boardRef}>
      <ul className="partner-magnet-board__grid" aria-label="Ecosystem partner logos">
        {partners.map((partner) => {
          const slot = LAYOUT[partner.name] ?? DEFAULT_SLOT;
          const style = {
            gridColumn: `${slot.col} / span ${slot.colSpan}`,
            gridRow: `${slot.row} / span ${slot.rowSpan}`,
          } satisfies CSSProperties;

          return (
            <li
              className="partner-magnet-card"
              data-logo-shape={partner.logoShape ?? "wide"}
              data-magnet-card
              data-tone={partner.tone}
              key={partner.name}
              style={style}
            >
              <span className="partner-magnet-card__logo" aria-hidden="true">
                <Image
                  src={partner.logo}
                  alt=""
                  width={partner.width}
                  height={partner.height}
                  loading="eager"
                  unoptimized={isSvgLogo(partner.logo)}
                />
              </span>
              <span className="partner-magnet-card__name">{partner.name}</span>
            </li>
          );
        })}
        <li className="partner-magnet-pyramid" aria-hidden="true">
          <span>
            <i />
          </span>
          <span>
            <i />
            <i />
          </span>
          <span>
            <i />
            <i />
            <i />
          </span>
          <span>
            <i />
            <i />
            <i />
            <i />
          </span>
        </li>
      </ul>
    </div>
  );
}
