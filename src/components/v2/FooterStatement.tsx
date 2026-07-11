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
    href: "/learn",
    title: "Learn",
    detail: "Follow a transaction through Midgard and review the security path.",
    cta: "Open Learn",
  },
  {
    href: "/users",
    title: "Users",
    detail: "See what Midgard changes for normal app users.",
    cta: "Open Users",
  },
  /* No Economics stop: it's a section (/learn#economics), not a page, and a
     hash href can never match pathname — it made the tour loop Learn <-> Users
     forever instead of ever reaching Developers/Participate. */
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
