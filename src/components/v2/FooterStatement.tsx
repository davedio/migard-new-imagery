"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TOUR = [
  {
    href: "/",
    title: "Home",
    detail: "Return to the main UTXO finance overview.",
    cta: "Back to home",
  },
  {
    href: "/how-it-works",
    title: "How it works",
    detail: "Ride a transaction from submit to Cardano settlement.",
    cta: "Open How it works",
  },
  {
    href: "/developers",
    title: "Developers",
    detail: "Review source, contracts, and integration paths.",
    cta: "Open Developers",
  },
  {
    href: "/participate",
    title: "Participate",
    detail: "Review Operators, Watchers, security, and economics.",
    cta: "Open Participate",
  },
] as const;

export function FooterStatement() {
  const pathname = usePathname();
  const at = TOUR.findIndex((item) => item.href === pathname);
  const next = TOUR[at >= 0 ? (at + 1) % TOUR.length : 1];

  return (
    <Link href={next.href} className="v2-footer-statement">
      <span className="v2-footer-statement__kicker">Next page</span>
      <span className="v2-footer-statement__main">
        <strong>{next.title}</strong>
        <em>{next.detail}</em>
      </span>
      <span className="v2-footer-statement__cta">
        {next.cta}
        <span aria-hidden>-&gt;</span>
      </span>
    </Link>
  );
}
