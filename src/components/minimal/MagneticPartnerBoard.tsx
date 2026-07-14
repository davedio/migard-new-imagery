"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { EcosystemPartner } from "@/lib/ecosystemPartners";
import { useTheme } from "@/lib/theme";
import type { PointerEvent as ReactPointerEvent } from "react";

const isSvgLogo = (logo: string) => logo.endsWith(".svg");
const logoImageStyle = { objectFit: "contain" } as const;

type CardSnapshot = {
  element: HTMLDivElement;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
};

function getRowSizes(count: number) {
  if (count <= 4) return [count];
  if (count <= 7) return [3, count - 3];
  const rows = [3, 4];
  let remaining = count - 7;
  while (remaining > 0) {
    rows.push(Math.min(4, remaining));
    remaining -= 4;
  }
  return rows;
}

function chunkPartners(partners: readonly EcosystemPartner[]) {
  const rowSizes = getRowSizes(partners.length);
  let cursor = 0;

  return rowSizes.map((size) => {
    const row = partners.slice(cursor, cursor + size);
    cursor += size;
    return row;
  });
}

export function MagneticPartnerBoard({ partners }: { partners: readonly EcosystemPartner[] }) {
  const { theme } = useTheme();
  const rows = chunkPartners(partners);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<CardSnapshot[]>([]);
  const frameRef = useRef<number | null>(null);
  const pointRef = useRef<{ x: number; y: number } | null>(null);

  const setCardMotion = useCallback(
    (card: HTMLDivElement, x = 0, y = 0, z = 0, rotation = 0, scale = 1, opacity = 1) => {
      card.style.setProperty("--magnet-x", `${x.toFixed(2)}px`);
      card.style.setProperty("--magnet-y", `${y.toFixed(2)}px`);
      card.style.setProperty("--magnet-z", `${z.toFixed(2)}px`);
      card.style.setProperty("--magnet-r", `${rotation.toFixed(2)}deg`);
      card.style.setProperty("--magnet-scale", scale.toFixed(3));
      card.style.setProperty("--magnet-opacity", opacity.toFixed(3));
    },
    [],
  );

  const measureCards = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const cards = Array.from(board.querySelectorAll<HTMLDivElement>(".partner-magnet-card"));
    cardsRef.current = cards.map((element) => {
      setCardMotion(element);
      const box = element.getBoundingClientRect();

      return {
        element,
        centerX: box.left + box.width / 2,
        centerY: box.top + box.height / 2,
        width: box.width,
        height: box.height,
      };
    });
  }, [setCardMotion]);

  const resetCards = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    pointRef.current = null;
    boardRef.current?.removeAttribute("data-active");
    cardsRef.current.forEach(({ element }) => setCardMotion(element));
  }, [setCardMotion]);

  const updateCardMotion = useCallback(() => {
    frameRef.current = null;
    const board = boardRef.current;
    const point = pointRef.current;
    if (!board || !point) return;

    const boardBox = board.getBoundingClientRect();
    board.style.setProperty("--cursor-x", `${(point.x - boardBox.left).toFixed(1)}px`);
    board.style.setProperty("--cursor-y", `${(point.y - boardBox.top).toFixed(1)}px`);

    const radius = Math.min(360, Math.max(250, boardBox.width * 0.48));
    const maxSpread = Math.min(34, Math.max(24, boardBox.width * 0.044));

    cardsRef.current.forEach(({ element, centerX, centerY, width, height }) => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      const distance = Math.hypot(dx, dy);
      const influence = Math.max(0, 1 - distance / radius);

      if (influence <= 0) {
        setCardMotion(element);
        return;
      }

      const power = influence * influence * (3 - 2 * influence);
      const safeDistance = Math.max(distance, 20);
      const normalX = -dx / safeDistance;
      const normalY = -dy / safeDistance;
      const insideCardBoost = Math.max(0, 1 - distance / Math.max(width, height));
      const spread = maxSpread * power + 10 * insideCardBoost;
      const side = centerX >= point.x ? 1 : -1;
      const rowBand = Math.max(0, 1 - Math.abs(dy) / (height * 1.35));
      const sideReach = Math.max(0, 1 - Math.abs(dx) / (radius * 1.35));
      const rowPush = side * maxSpread * 0.42 * rowBand * sideReach;
      const lift = -6 * power;
      const x = Math.max(-34, Math.min(34, normalX * spread + rowPush));
      const y = normalY * spread + lift;
      const z = 18 * power;
      const rotation = Math.max(-6, Math.min(6, (-dx / Math.max(width, 1)) * 5 * power));
      const scale = 1 + 0.026 * power;
      const opacity = 1 - 0.08 * power;

      setCardMotion(element, x, y, z, rotation, scale, opacity);
    });
  }, [setCardMotion]);

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      measureCards();
      boardRef.current?.setAttribute("data-active", "true");
    },
    [measureCards],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch" || !boardRef.current?.hasAttribute("data-active")) return;
      pointRef.current = { x: event.clientX, y: event.clientY };

      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(updateCardMotion);
      }
    },
    [updateCardMotion],
  );

  useEffect(() => {
    return () => resetCards();
  }, [resetCards]);

  return (
    <div
      className="partner-magnet-board"
      onPointerCancel={resetCards}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={resetCards}
      onPointerMove={handlePointerMove}
      ref={boardRef}
    >
      <div className="partner-magnet-board__grid" aria-label="Ecosystem partner logos" role="list">
        {rows.map((row, rowIndex) => (
          <div
            className="partner-magnet-row"
            data-count={row.length}
            data-row={rowIndex + 1}
            key={row.map((partner) => partner.name).join("-")}
          >
            {row.map((partner, index) => {
              // Dark site: use the light-colored logo (partner.logo) so it reads
              // on a dark chip. Light site: use the dark-ink logoLight variant.
              const logo = theme === "dark" ? partner.logo : partner.logoLight;
              const logoClassName = [
                "partner-magnet-card__logo",
                theme === "light" && partner.monochromeOnLight
                  ? "partner-magnet-card__logo--monochrome"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  className="partner-magnet-card"
                  data-logo-shape={partner.logoShape ?? "wide"}
                  data-show-name={partner.showName ? "true" : undefined}
                  data-slot={index + 1}
                  data-tone={partner.tone}
                  aria-label={partner.name}
                  key={partner.name}
                  role="listitem"
                >
                  <span className={logoClassName} aria-hidden="true">
                    <Image
                      src={logo}
                      alt=""
                      fill
                      loading="eager"
                      sizes="180px"
                      style={logoImageStyle}
                      unoptimized={isSvgLogo(logo)}
                    />
                  </span>
                  {partner.showName ? (
                    <span className="partner-magnet-card__name" aria-hidden="true">
                      {partner.name}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
