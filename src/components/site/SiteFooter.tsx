import Link from "next/link";
import Image from "next/image";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { NetworkChip } from "@/components/site/NetworkChip";
import { FooterStatement } from "@/components/v2/FooterStatement";
import { SITE_COPY } from "@/lib/siteCopy";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  github?: boolean;
};

const COLUMNS: ReadonlyArray<{ title: string; links: readonly FooterLink[] }> = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Learn", href: "/learn" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Developer Overview", href: "/developers" },
      { label: "Contracts", href: "/contracts" },
      { label: "GitHub", href: OFFICIAL_LINKS.github, external: true, github: true },
      {
        label: "Whitepaper",
        href: OFFICIAL_LINKS.whitepaper,
        external: true,
      },
    ],
  },
  {
    title: "Security",
    links: [
      { label: "Security", href: "/security" },
      { label: "Security Policy", href: OFFICIAL_LINKS.securityPolicy },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Choose your path", href: "/#paths" },
      { label: "Discord", href: OFFICIAL_LINKS.discord, external: true },
      { label: "Intake Form", href: OFFICIAL_LINKS.intakeForm, external: true },
      { label: "X / Twitter", href: OFFICIAL_LINKS.x, external: true },
    ],
  },
];

const LEGAL = ["Terms publishing soon", "Privacy publishing soon"] as const;

// Recognizable brand glyphs for the official channels. Inline SVG keeps the
// footer a static server component with no extra dependencies.
const SOCIAL = [
  {
    label: "GitHub",
    href: OFFICIAL_LINKS.github,
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden focusable="false">
        <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.34-1.74-1.34-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.49.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.66 1.64.24 2.86.12 3.16.77.83 1.24 1.88 1.24 3.17 0 4.53-2.81 5.53-5.49 5.82.43.36.81 1.09.81 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.22.68.83.56C20.56 21.91 24 17.5 24 12.29 24 5.78 18.63.5 12 .5z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: OFFICIAL_LINKS.x,
    icon: (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden focusable="false">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: OFFICIAL_LINKS.discord,
    icon: (
      <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden focusable="false">
        <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.21.375-.444.88-.608 1.28a18.27 18.27 0 0 0-5.487 0A12.6 12.6 0 0 0 9.18 3a19.74 19.74 0 0 0-4.435 1.37C1.93 8.59 1.16 12.71 1.54 16.77a19.93 19.93 0 0 0 6.06 3.06c.49-.67.93-1.38 1.3-2.13-.71-.27-1.39-.6-2.03-.99.17-.12.34-.25.5-.38a14.23 14.23 0 0 0 12.18 0c.16.13.33.26.5.38-.64.39-1.32.72-2.03.99.37.75.81 1.46 1.3 2.13a19.9 19.9 0 0 0 6.06-3.06c.45-4.69-.77-8.78-3.2-12.4zM8.02 14.33c-1.18 0-2.15-1.09-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.15 2.42 0 1.33-.95 2.42-2.15 2.42zm7.96 0c-1.18 0-2.15-1.09-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.15 2.42 0 1.33-.94 2.42-2.15 2.42z" />
      </svg>
    ),
  },
];

/**
 * Shared footer for the (site) route group — the full sitemap. Static server
 * markup except the compact NetworkChip, which is its own client island.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      {/* V2 statement line — display type with the cursor-wave effect. */}
      <FooterStatement />
      <div className="site-footer__top site-footer__top--sitemap">
        <div className="site-footer__brand">
          <div className="lock">
            <Image src="/midgard-icon.png" alt="" aria-hidden width={24} height={24} loading="eager" unoptimized />
            <span className="wm">Midgard</span>
          </div>
          <p>{SITE_COPY.hero.lead}</p>

          <div
            className="site-footer__social"
            style={{ display: "flex", gap: 16, marginTop: 18 }}
            aria-label="Official channels"
          >
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                title={s.label}
                style={{ display: "inline-flex", color: "var(--text-dim)" }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div className="site-footer__col" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={l.github ? "site-footer__link--external" : undefined}
                    >
                      {l.label}
                      {l.github ? <GitHubIcon size={14} aria-hidden /> : null}
                    </a>
                  ) : (
                    <Link href={l.href}>{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__legal">
          {LEGAL.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <NetworkChip />
        <span className="meta">© 2026 Midgard Labs · Always start from official links</span>
      </div>
    </footer>
  );
}
