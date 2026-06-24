"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  description: string;
  external?: boolean;
  github?: boolean;
};

type NavGroup = {
  label: string;
  items: readonly NavLink[];
};

const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "Learn",
    items: [
      { label: "Learn overview", href: "/learn", description: "Plain-language model" },
      { label: "How it works", href: "/how-it-works", description: "Transaction flow" },
      { label: "FAQ", href: "/faq", description: "Trust-model answers" },
    ],
  },
  {
    label: "Developers",
    items: [
      { label: "Developer overview", href: "/developers", description: "Builder and Protocol Role paths" },
      { label: "Contracts", href: "/contracts", description: "Topology, addresses, scripts" },
      {
        label: "GitHub",
        href: OFFICIAL_LINKS.github,
        description: "Source and issues",
        external: true,
        github: true,
      },
      {
        label: "Intake form",
        href: OFFICIAL_LINKS.intakeForm,
        description: "Builder and Protocol Role interest",
        external: true,
      },
    ],
  },
  {
    label: "Security",
    items: [
      {
        label: "Security overview",
        href: "/security",
        description: "Trust path, assumptions, reporting route",
      },
      { label: "FAQ", href: "/faq", description: "L2 tradeoffs and common questions" },
    ],
  },
] as const;

/* Sun/moon toggle — flips between the night tree and the dawn tree. */
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={!dark}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
      title={dark ? "Switch to day mode" : "Switch to night mode"}
    >
      {dark ? (
        /* moon — night is active, clicking brings the dawn */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        /* sun — day is active, clicking brings back the night */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

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
  const navRef = useRef<HTMLElement>(null);
  const hoverCloseTimer = useRef<number | null>(null);
  const [menu, setMenu] = useState({ pathname: "", open: false });
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [pinnedGroup, setPinnedGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const open = menu.open && menu.pathname === pathname;
  const openGroup = pinnedGroup ?? hoverGroup;

  const clearHoverClose = () => {
    if (!hoverCloseTimer.current) return;
    window.clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = null;
  };

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
      clearHoverClose();
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      setPinnedGroup(null);
      setHoverGroup(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setPinnedGroup(null);
      setHoverGroup(null);
      setMenu({ pathname, open: false });
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pathname]);

  const closeMenu = () => setMenu({ pathname, open: false });
  const toggleMenu = () =>
    setMenu((state) => ({
      pathname,
      open: state.pathname === pathname ? !state.open : true,
    }));

  /* Home is active only on exactly "/" — every route starts with "/". */
  const isActive = (href: string) => {
    if (!href.startsWith("/")) return false;
    if (href.startsWith("/#")) return false;
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) => ({
    className: "site-nav__link",
    "data-active": isActive(href),
  });

  const isGroupActive = (group: NavGroup) => group.items.some((item) => isActive(item.href));

  const openPinnedGroup = (label: string) => {
    clearHoverClose();
    setPinnedGroup((current) => (current === label ? null : label));
    setHoverGroup(label);
  };

  const closeDropdown = () => {
    clearHoverClose();
    setPinnedGroup(null);
    setHoverGroup(null);
  };

  const openHoverGroup = (label: string) => {
    clearHoverClose();
    setHoverGroup(label);
  };

  const scheduleHoverClose = () => {
    if (pinnedGroup) return;
    clearHoverClose();
    hoverCloseTimer.current = window.setTimeout(() => {
      setHoverGroup(null);
      hoverCloseTimer.current = null;
    }, 320);
  };

  const renderDropdownLink = (item: NavLink, mobile = false) => {
    const active = isActive(item.href);
    const content = (
      <>
        <span className={mobile ? "site-nav__mobile-label" : "site-nav__dropdown-label"}>
          {item.github ? <GitHubIcon size={14} aria-hidden /> : null}
          {item.label}
        </span>
        <span className={mobile ? "site-nav__mobile-desc" : "site-nav__dropdown-desc"}>
          {item.description}
        </span>
      </>
    );
    if (item.external) {
      return (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          data-active={active}
          onClick={mobile ? closeMenu : closeDropdown}
          className={mobile ? "site-nav__mobile-child" : "site-nav__dropdown-link"}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        key={item.label}
        href={item.href}
        data-active={active}
        onClick={mobile ? closeMenu : closeDropdown}
        className={mobile ? "site-nav__mobile-child" : "site-nav__dropdown-link"}
      >
        {content}
      </Link>
    );
  };

  return (
    <>
      <nav ref={navRef} className="site-nav" data-scrolled={scrolled}>
        <Link href="/" className="site-nav__logo" aria-label="Midgard home">
          <Image src="/midgard-icon.png" alt="" aria-hidden width={28} height={28} priority unoptimized />
          <span className="wm">Midgard</span>
        </Link>

        <div className="site-nav__links">
          <Link href="/" {...linkClass("/")}>
            Home
          </Link>
          {NAV_GROUPS.map((group) => {
            const groupOpen = openGroup === group.label;
            return (
              <div
                key={group.label}
                className="site-nav__group"
                data-open={groupOpen}
                onMouseEnter={() => openHoverGroup(group.label)}
                onMouseLeave={scheduleHoverClose}
              >
                <button
                  type="button"
                  className="site-nav__link site-nav__heading"
                  data-active={isGroupActive(group)}
                  aria-expanded={groupOpen}
                  aria-haspopup="true"
                  onClick={() => openPinnedGroup(group.label)}
                >
                  {group.label}
                  <span className="site-nav__chevron" aria-hidden>
                    ↓
                  </span>
                </button>
                <div
                  className="site-nav__dropdown"
                  role="menu"
                  aria-label={`${group.label} links`}
                  aria-hidden={!groupOpen}
                  inert={!groupOpen}
                >
                  {group.items.map((item) => renderDropdownLink(item))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="site-nav__right">
          <OfficialSocialLinks className="site-nav__social" linkClassName="site-nav__social-link" iconSize={17} />
          <ThemeToggle />
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
      <div className="site-nav__mobile" data-open={open} aria-hidden={!open} inert={!open}>
        <Link href="/" data-active={isActive("/")} onClick={closeMenu}>
          Home
        </Link>
        <OfficialSocialLinks
          className="site-nav__mobile-social"
          linkClassName="site-nav__mobile-social-link"
          iconSize={18}
          showLabels
          onNavigate={closeMenu}
        />
        {NAV_GROUPS.map((group) => (
          <div className="site-nav__mobile-group" key={group.label}>
            <div className="site-nav__mobile-title">{group.label}</div>
            {group.items.map((item) => renderDropdownLink(item, true))}
          </div>
        ))}
      </div>
    </>
  );
}
