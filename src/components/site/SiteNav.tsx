"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* ------------------------------------------------------------------ */
/*  Nav model                                                           */
/* ------------------------------------------------------------------ */

type NavLink = {
  label: string;
  href: string;
};

/* Trimmed 2026-06-11: Security lives at the bottom of /contracts now;
   Official Links is reachable from the footer site index only; Brand and
   Changelog are gone. */
const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contracts", href: "/contracts" },
  { label: "Get Started", href: "/get-started" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Fixed top navigation shared across every page in the (site) route group.
 *
 * Desktop: the real first-level pages are all exposed as plain links so the
 * site map can be reviewed directly. A scrim fades in once the page is
 * scrolled (data-scrolled).
 *
 * Mobile: burger menu with the same page list.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ pathname: "", open: false });
  const [scrolled, setScrolled] = useState(false);

  const open = menu.open && menu.pathname === pathname;

  /* Scrim once scrolled — content scrolls beneath the transparent nav. */
  useEffect(() => {
    let last = false;
    const syncInitial = window.requestAnimationFrame(() => {
      last = window.scrollY > 16;
      setScrolled(last);
    });
    const onScroll = () => {
      const next = window.scrollY > 16;
      if (next === last) return;
      last = next;
      setScrolled(next);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(syncInitial);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMenu = () => setMenu({ pathname, open: false });
  const toggleMenu = () =>
    setMenu((state) => ({
      pathname,
      open: state.pathname === pathname ? !state.open : true,
    }));

  /* Home is active only on exactly "/" — every route starts with "/". */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) => ({
    className: "site-nav__link",
    "data-active": isActive(href),
  });

  return (
    <>
      <nav className="site-nav" data-scrolled={scrolled}>
        <Link href="/" className="site-nav__logo" aria-label="Midgard home">
          <Image src="/midgard-icon.png" alt="" aria-hidden width={28} height={28} />
          <span className="wm">Midgard</span>
        </Link>

        <div className="site-nav__links">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} {...linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
          <a
            href={OFFICIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="site-nav__link site-nav__link--external"
          >
            GitHub
            <GitHubIcon size={15} aria-hidden />
          </a>
        </div>

        <div className="site-nav__right">
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

      {/* Mobile menu — same page list as desktop. */}
      <div className="site-nav__mobile" data-open={open}>
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-active={isActive(item.href)}
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={OFFICIAL_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="site-nav__mobile-link--external"
          onClick={closeMenu}
        >
          GitHub
          <GitHubIcon size={16} aria-hidden />
        </a>
      </div>
    </>
  );
}
