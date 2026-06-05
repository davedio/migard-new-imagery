"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavLeaf = {
  label: string;
  href: string;
};

const NAV: readonly NavLeaf[] = [
  { label: "Home", href: "/home" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Security", href: "/security" },
  { label: "Testnet", href: "/contracts" },
  { label: "FAQ", href: "/faq" },
  { label: "Docs", href: "/docs" },
] as const;

/**
 * Fixed top navigation shared across every page in the (site) route group.
 * Collapses to a burger menu at <= 940px (see globals.css).
 */
export function SiteNav() {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ pathname: "", open: false });
  const open = menu.open && menu.pathname === pathname;

  const closeMenu = () => {
    setMenu({ pathname, open: false });
  };
  const toggleMenu = () =>
    setMenu((state) => ({
      pathname,
      open: state.pathname === pathname ? !state.open : true,
    }));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) => ({
    className: "site-nav__link",
    "data-active": isActive(href),
  });

  return (
    <>
      <nav className="site-nav">
        <Link href="/home" className="site-nav__logo" aria-label="Midgard home">
          <Image src="/midgard-icon.png" alt="" aria-hidden width={28} height={28} />
          <span className="wm">Midgard</span>
        </Link>

        <div className="site-nav__links">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} {...linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="site-nav__right">
          <Link href="/get-started" className="btn btn--primary site-nav__cta-desktop">
            Get Started
          </Link>
          <button
            type="button"
            className="site-nav__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={toggleMenu}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      <div className="site-nav__mobile" data-open={open}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-active={isActive(item.href)}
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
        <Link href="/get-started" className="btn btn--primary" onClick={closeMenu}>
          Get Started
        </Link>
      </div>
    </>
  );
}
