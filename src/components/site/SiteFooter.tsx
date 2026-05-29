import Link from "next/link";

const EXPLORE = [
  { label: "Users", href: "/users" },
  { label: "Builders", href: "/builders" },
  { label: "Partners", href: "/partners" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Security", href: "/security" },
] as const;

const RESOURCES = [
  { label: "Docs", href: "/docs" },
  { label: "Testnet", href: "/testnet" },
  { label: "FAQ", href: "/faq" },
  { label: "Official Links", href: "/official-links" },
] as const;

// Placeholder destinations — Dave supplies the real URLs / legal pages later.
const LEGAL = [
  "Terms",
  "Privacy",
  "Testnet Terms",
  "Risks",
  "Support",
  "GitHub",
] as const;

/**
 * Shared footer for the (site) route group. Server component — purely static
 * markup. Legal/support links are placeholders (#) until Dave provides real
 * destinations.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <img src="/midgard-logo.png" alt="Midgard" />
          <p>
            A Cardano-native Layer 2 built for throughput and secured by math.
            Fees are paid in ADA.
          </p>
          <div className="chips">
            <span className="chip chip--demo">
              <span className="dot" />
              Simulated data
            </span>
            <span className="chip chip--testnet">
              <span className="dot" />
              Pre-alpha
            </span>
          </div>
        </div>

        <div className="site-footer__col">
          <h4>Explore</h4>
          <ul>
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h4>Resources</h4>
          <ul>
            {RESOURCES.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__legal">
          {LEGAL.map((label) => (
            <a key={label} href="#">
              {label}
            </a>
          ))}
        </div>
        <span className="meta">
          © 2026 Midgard · Simulated · connects to live data at launch
        </span>
      </div>
    </footer>
  );
}
