import Link from "next/link";

export function FooterStatement() {
  return (
    <Link href="/get-started" className="v2-footer-statement">
      <span>
        Take <em>root</em> on Cardano.
      </span>
      <span className="arrow" aria-hidden>
        ↗
      </span>
    </Link>
  );
}
