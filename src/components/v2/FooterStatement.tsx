"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* The footer statement carries you to the next review page in the public
   sitemap, so every core page is easy to inspect in sequence. */
const TOUR = ["/", "/learn", "/developers", "/contracts", "/security", "/faq"] as const;

export function FooterStatement() {
  const pathname = usePathname();
  const at = TOUR.indexOf(pathname as (typeof TOUR)[number]);
  const next = at >= 0 ? TOUR[(at + 1) % TOUR.length] : "/learn";

  return (
    <Link href={next} className="v2-footer-statement">
      <span>
        Scale <em>UTXO</em> finance.
      </span>
      <span className="arrow" aria-hidden>
        ↗
      </span>
    </Link>
  );
}
