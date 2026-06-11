"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* The footer statement is a TOUR step (review 2026-06-11): from any page it
   carries you to the NEXT page in the nav order, so reading the site end to
   end is just "scroll, take root, repeat". Unknown routes fall back to the
   start of the journey. */
const TOUR = [
  "/",
  "/how-it-works",
  "/contracts",
  "/get-started",
  "/roadmap",
  "/about",
  "/faq",
] as const;

export function FooterStatement() {
  const pathname = usePathname();
  const at = TOUR.indexOf(pathname as (typeof TOUR)[number]);
  const next = at >= 0 ? TOUR[(at + 1) % TOUR.length] : "/how-it-works";

  return (
    <Link href={next} className="v2-footer-statement">
      <span>
        Take <em>root</em> on Cardano.
      </span>
      <span className="arrow" aria-hidden>
        ↗
      </span>
    </Link>
  );
}
