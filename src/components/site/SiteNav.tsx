"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";

/* ------------------------------------------------------------------ */
/*  Nav model                                                           */
/* ------------------------------------------------------------------ */

type DropChild = {
  label: string;
  href: string;
  /** One-line mono subtext shown under the label in the dropdown. */
  sub: string;
};

/** Protocol group — How It Works is the parent, Security/Contracts children. */
const PROTOCOL: readonly DropChild[] = [
  {
    label: "Overview",
    href: "/how-it-works",
    sub: "Ride a transaction from Layer 2 down to Cardano",
  },
  {
    label: "Security",
    href: "/security",
    sub: "Challenge and proof model",
  },
  {
    label: "Contracts",
    href: "/contracts",
    sub: "On-chain addresses you can verify",
  },
] as const;

/** Routes that light the How It Works parent as active. */
const PROTOCOL_ROUTES = ["/how-it-works", "/security", "/contracts"];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Fixed top navigation shared across every page in the (site) route group.
 *
 * Desktop: Home · How It Works (dropdown: Overview / Security / Contracts,
 * two-line HUD-style items) · About · FAQ · GitHub ↗ · Get Started CTA.
 * The dropdown opens on hover and focus-within, toggles on click, closes on
 * Escape and outside click. The parent shows active state on any protocol
 * route. A scrim fades in once the page is scrolled (data-scrolled).
 *
 * Mobile (≤940px): burger menu grouped under mono section labels
 * (Protocol / Company / Resources) instead of one flat list.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ pathname: "", open: false });
  const [drop, setDrop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  const open = menu.open && menu.pathname === pathname;

  /* Scrim once scrolled — content scrolls beneath the transparent nav. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Dropdown closes on route change, Escape, and outside click. */
  useEffect(() => setDrop(false), [pathname]);
  useEffect(() => {
    if (!drop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrop(false);
    };
    const onDown = (e: PointerEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDrop(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [drop]);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const hoverOpen = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    setDrop(true);
  };
  const hoverClose = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setDrop(false), 140);
  };

  const closeMenu = () => setMenu({ pathname, open: false });
  const toggleMenu = () =>
    setMenu((state) => ({
      pathname,
      open: state.pathname === pathname ? !state.open : true,
    }));

  /* Home is active only on exactly "/" — every route starts with "/". */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const protocolActive = PROTOCOL_ROUTES.some((r) => isActive(r));

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
          <Link href="/" {...linkClass("/")}>
            Home
          </Link>

          {/* How It Works — parent link + rich dropdown */}
          <div
            ref={dropRef}
            className="site-nav__group"
            onPointerEnter={hoverOpen}
            onPointerLeave={hoverClose}
            onFocus={hoverOpen}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrop(false);
            }}
          >
            <button
              type="button"
              className="site-nav__link site-nav__group-trigger"
              data-active={protocolActive}
              aria-expanded={drop}
              aria-haspopup="true"
              onClick={() => setDrop((d) => !d)}
            >
              How It Works
              <span className="site-nav__chevron" data-open={drop} aria-hidden>
                ▾
              </span>
            </button>

            <div className="site-nav__drop" data-open={drop} role="menu" aria-label="How It Works">
              {PROTOCOL.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="site-nav__drop-item"
                  data-active={isActive(item.href)}
                  onClick={() => setDrop(false)}
                >
                  <span className="site-nav__drop-label">{item.label}</span>
                  <span className="site-nav__drop-sub">{item.sub}</span>
                </Link>
              ))}
            </div>
          </div>

          <Link href="/about" {...linkClass("/about")}>
            About
          </Link>
          <Link href="/faq" {...linkClass("/faq")}>
            FAQ
          </Link>
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

      {/* Mobile menu — grouped under mono section labels, not one flat list. */}
      <div className="site-nav__mobile" data-open={open}>
        <Link href="/" data-active={isActive("/")} onClick={closeMenu}>
          Home
        </Link>

        <span className="site-nav__mobile-label" aria-hidden>
          Protocol
        </span>
        <Link
          href="/how-it-works"
          data-active={isActive("/how-it-works")}
          onClick={closeMenu}
        >
          How It Works
        </Link>
        <Link
          href="/security"
          className="site-nav__mobile-child"
          data-active={isActive("/security")}
          onClick={closeMenu}
        >
          Security
        </Link>
        <Link
          href="/contracts"
          className="site-nav__mobile-child"
          data-active={isActive("/contracts")}
          onClick={closeMenu}
        >
          Contracts
        </Link>

        <span className="site-nav__mobile-label" aria-hidden>
          Company
        </span>
        <Link href="/about" data-active={isActive("/about")} onClick={closeMenu}>
          About
        </Link>

        <span className="site-nav__mobile-label" aria-hidden>
          Resources
        </span>
        <Link href="/faq" data-active={isActive("/faq")} onClick={closeMenu}>
          FAQ
        </Link>
        <Link
          href="/official-links"
          data-active={isActive("/official-links")}
          onClick={closeMenu}
        >
          Official links
        </Link>
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

        <Link href="/get-started" className="btn btn--primary" onClick={closeMenu}>
          Get Started
        </Link>
      </div>
    </>
  );
}
