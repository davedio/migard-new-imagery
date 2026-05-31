import Link from "next/link";
import Image from "next/image";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

const EXPLORE = [
  { label: "Home", href: "/home" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Security", href: "/security" },
  { label: "Get Started", href: "/get-started" },
  { label: "About", href: "/about" },
] as const;

const RESOURCES = [
  { label: "Testnet status", href: "/testnet" },
  { label: "FAQ", href: "/faq" },
  { label: "Official links", href: "/official-links" },
  { label: "Security contact", href: "/official-links#security-contact" },
] as const;

const CHANNELS = [
  { label: "Docs", href: OFFICIAL_LINKS.docs },
  { label: "GitHub", href: OFFICIAL_LINKS.github },
  { label: "Discord", href: OFFICIAL_LINKS.discord },
  { label: "X", href: OFFICIAL_LINKS.x },
] as const;

// Placeholder destinations — Dave supplies the real legal/support pages later.
const LEGAL = [
  "Terms",
  "Privacy",
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
          <div className="lock">
            <Image src="/midgard-icon.png" alt="" aria-hidden width={24} height={24} />
            <span className="wm">Midgard</span>
          </div>
          <p>
            Built by Anastasia Labs. A Cardano-native Layer 2 built for
            throughput and a trust path you can inspect.
          </p>
          <div className="chips">
            <span className="chip chip--demo">
              <span className="dot" />
              Fees paid in ADA
            </span>
            <span className="chip chip--testnet">
              <span className="dot" />
              Settles on Cardano L1
            </span>
            <span className="chip chip--demo">
              <span className="dot" />
              Pre-alpha testnet
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

        <div className="site-footer__col">
          <h4>Channels</h4>
          <ul>
            {CHANNELS.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
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
          © 2026 Midgard · Always start from official links
        </span>
      </div>
    </footer>
  );
}
