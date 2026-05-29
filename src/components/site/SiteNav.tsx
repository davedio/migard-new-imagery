"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Users", href: "/users" },
  { label: "Builders", href: "/builders" },
  { label: "Partners", href: "/partners" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Security", href: "/security" },
  { label: "Docs", href: "/docs" },
  { label: "Testnet", href: "/testnet" },
] as const;

/**
 * Fixed top navigation shared across every page in the (site) route group.
 * Collapses to a burger menu at <= 940px (see globals.css). The primary CTA
 * ("Build On Midgard") routes to /builders.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav className="site-nav">
        <Link href="/home" className="site-nav__logo" aria-label="Midgard home">
          <img src="/midgard-logo.png" alt="Midgard" />
        </Link>

        <div className="site-nav__links">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav__link"
              data-active={isActive(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="site-nav__right">
          <Link
            href="/builders"
            className="btn btn--primary site-nav__cta-desktop"
          >
            Build On Midgard
          </Link>
          <button
            type="button"
            className="site-nav__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      <div className="site-nav__mobile" data-open={open}>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} data-active={isActive(item.href)}>
            {item.label}
          </Link>
        ))}
        <Link href="/builders" className="btn btn--primary">
          Build On Midgard
        </Link>
      </div>
    </>
  );
}
