"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from "react";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OfficialSocialLinks } from "@/components/site/OfficialSocialLinks";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { useTheme } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/*  Nav model                                                           */
/* ------------------------------------------------------------------ */

type NavLink = {
  label: string;
  href: string;
  children?: readonly NavChild[];
};

type NavChild = {
  label: string;
  description: string;
  href: string;
  external?: boolean;
  icon?: ReactNode;
};

const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  {
    label: "Learn",
    href: "/learn",
    children: [
      { label: "How Midgard works", description: "Execution, verification, and Cardano settlement.", href: "/learn" },
      { label: "Security", description: "Trust path, Watchers, fault proofs, and Cardano settlement.", href: "/learn#security" },
      { label: "FAQ", description: "Common questions about roles, settlement, and security.", href: "/faq" },
      { label: "Glossary", description: "Short definitions for Midgard protocol terms.", href: "/glossary" },
    ],
  },
  /* Users is its own destination, not a Learn child (Dave, 2026-07-11). */
  { label: "Users", href: "/users" },
  { label: "Economics", href: "/economics" },
  {
    label: "Developers",
    href: "/developers",
    children: [
      { label: "Developer overview", description: "Source, docs, contracts, and review paths.", href: "/developers" },
      { label: "Contracts", description: "Preprod validators, anchors, scripts, and topology.", href: "/developers#contracts" },
      {
        label: "GitHub",
        description: "Repository, issues, and implementation history.",
        href: OFFICIAL_LINKS.github,
        external: true,
        icon: <GitHubIcon size={14} aria-hidden />,
      },
    ],
  },
  {
    label: "Participate",
    href: "/participate",
    children: [
      { label: "Overview", description: "Operator, Watcher, and ecosystem participation paths.", href: "/participate" },
      { label: "Operators and Watchers", description: "Network roles that order activity and verify state.", href: "/participate#roles" },
      { label: "Economics", description: "Fees, rewards, bonds, and network incentives.", href: "/participate#economics" },
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Fixed top navigation shared across every page in the (site) route group.
 *
 * Desktop: first-level pages stay visible, with dropdowns for their subpages.
 * A scrim fades in once the page is scrolled (data-scrolled).
 *
 * Mobile: burger menu with the same grouped page list.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ pathname: "", open: false });
  const [desktopDropdown, setDesktopDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  /* the dropdown panel is much wider than its trigger, so a mouse moving
     diagonally toward a side item can cross a sliver of dead space between
     them — a closeTimer grace period (not an instant close) survives that
     without requiring a pixel-perfect hover path */
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openDropdown = (label: string) => {
    clearCloseTimer();
    setDesktopDropdown(label);
  };
  const scheduleCloseDropdown = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setDesktopDropdown(null), 260);
  };
  useEffect(() => clearCloseTimer, []);

  /* Close any open dropdown the instant the page scrolls. Without this, a
     trackpad scroll gesture (which can produce a few px of incidental
     cursor drift, especially on a non-perfectly-vertical swipe) can leave
     the cursor resting over a DIFFERENT nav item while the previous
     dropdown is still technically open — that item's real onMouseEnter
     then fires and swaps in its own list, reading as "scrolling brought up
     a different menu." Every polished mega-menu closes on scroll for
     exactly this reason; only attached while something is actually open. */
  useEffect(() => {
    if (!desktopDropdown) return;
    const onScroll = () => {
      clearCloseTimer();
      setDesktopDropdown(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [desktopDropdown]);

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu({ pathname, open: false });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pathname]);

  const closeMenu = () => setMenu({ pathname, open: false });
  const toggleMenu = () =>
    setMenu((state) => ({
      pathname,
      open: state.pathname === pathname ? !state.open : true,
    }));
  const closeDesktopDropdown = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    clearCloseTimer();
    setDesktopDropdown(null);
  };

  /* Home is active only on exactly "/" — every route starts with "/". */
  const isActive = (href: string) => {
    if (!href.startsWith("/")) return false;
    if (href.startsWith("/#")) return false;
    if (href.includes("#")) return false;
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  };

  const isNavItemActive = (item: NavLink) =>
    isActive(item.href) || item.children?.some((child) => isActive(child.href)) === true;

  const linkClass = (href: string, className = "site-nav__link") => ({
    className,
    "data-active": isActive(href),
  });

  return (
    <>
      <nav className="site-nav" data-scrolled={scrolled}>
        <Link href="/" className="site-nav__logo" aria-label="Midgard home">
          <Image src="/midgard-icon.png" alt="" aria-hidden width={28} height={28} priority unoptimized />
          <span className="wm">Midgard</span>
        </Link>

        <div className="site-nav__links">
          {NAV_LINKS.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="site-nav__group"
                data-open={desktopDropdown === item.label}
                onMouseEnter={() => openDropdown(item.label)}
                onMouseLeave={scheduleCloseDropdown}
                onFocus={() => openDropdown(item.label)}
                onBlur={closeDesktopDropdown}
              >
                <Link
                  href={item.href}
                  className="site-nav__link site-nav__heading"
                  data-active={isNavItemActive(item)}
                  onClick={() => {
                    /* A click navigates immediately, but the cursor stays put —
                       if the destination page renders the same nav (it always
                       does), that item's dropdown would otherwise reopen on
                       landing and cover the new page's own heading until the
                       mouse moves. Closing on click makes navigation a clean
                       break from the menu. */
                    clearCloseTimer();
                    setDesktopDropdown(null);
                  }}
                >
                  {item.label}
                </Link>
                <div className="site-nav__dropdown" role="menu" aria-label={`${item.label} links`}>
                  {item.children.map((child, i) =>
                    child.external ? (
                      <a
                        key={child.label}
                        href={child.href}
                        className="site-nav__dropdown-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        style={{ "--i": i } as CSSProperties}
                      >
                        <span className="site-nav__dropdown-label">
                          {child.icon}
                          {child.label}
                        </span>
                        <span className="site-nav__dropdown-desc">{child.description}</span>
                      </a>
                    ) : (
                      <Link
                        key={child.label}
                        href={child.href}
                        {...linkClass(child.href, "site-nav__dropdown-link")}
                        role="menuitem"
                        style={{ "--i": i } as CSSProperties}
                        onClick={() => {
                          clearCloseTimer();
                          setDesktopDropdown(null);
                        }}
                      >
                        <span className="site-nav__dropdown-label">
                          {child.icon}
                          {child.label}
                        </span>
                        <span className="site-nav__dropdown-desc">{child.description}</span>
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <Link key={item.label} href={item.href} {...linkClass(item.href)}>
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="site-nav__right">
          <OfficialSocialLinks className="site-nav__social" linkClassName="site-nav__social-link" iconSize={17} />
          <button
            type="button"
            className="site-nav__theme"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title="Toggle dark mode"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M12 2.6v2.4M12 19v2.4M4.6 12H2.2M21.8 12h-2.4M5.6 5.6 7.3 7.3M16.7 16.7l1.7 1.7M18.4 5.6 16.7 7.3M7.3 16.7l-1.7 1.7" />
                </g>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 14.2A8 8 0 1 1 9.8 4 6.4 6.4 0 0 0 20 14.2Z" fill="currentColor" />
              </svg>
            )}
          </button>
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

      {/* Mobile menu — same grouped page list as desktop. */}
      <div className="site-nav__mobile" data-open={open} aria-hidden={!open} inert={!open}>
        {NAV_LINKS.map((item) =>
          item.children ? (
            <div key={item.label} className="site-nav__mobile-group">
              <Link
                href={item.href}
                className="site-nav__mobile-title"
                data-active={isNavItemActive(item)}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
              {item.children.map((child) =>
                child.external ? (
                  <a
                    key={child.label}
                    href={child.href}
                    className="site-nav__mobile-child"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                  >
                    <span className="site-nav__mobile-label">
                      {child.icon}
                      {child.label}
                    </span>
                    <span className="site-nav__mobile-desc">{child.description}</span>
                  </a>
                ) : (
                  <Link
                    key={child.label}
                    href={child.href}
                    className="site-nav__mobile-child"
                    data-active={isActive(child.href)}
                    onClick={closeMenu}
                  >
                    <span className="site-nav__mobile-label">{child.label}</span>
                    <span className="site-nav__mobile-desc">{child.description}</span>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <Link key={item.label} href={item.href} data-active={isActive(item.href)} onClick={closeMenu}>
              {item.label}
            </Link>
          ),
        )}
        <OfficialSocialLinks
          className="site-nav__mobile-social"
          linkClassName="site-nav__mobile-social-link"
          iconSize={18}
          showLabels
          onNavigate={closeMenu}
        />
      </div>
    </>
  );
}
