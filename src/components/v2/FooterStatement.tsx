"use client";

/* The footer sign-off line, with the header cursor-wave. Client island so
   the (server) SiteFooter can keep its static markup. */

import Link from "next/link";
import { WaveText } from "./CursorWave";

export function FooterStatement() {
  return (
    <Link href="/get-started" className="v2-footer-statement">
      <WaveText>
        Take <em>root</em> on Cardano.
      </WaveText>
      <span className="arrow" aria-hidden>
        ↗
      </span>
    </Link>
  );
}
