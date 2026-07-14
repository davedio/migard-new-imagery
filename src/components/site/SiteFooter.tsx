import Link from "next/link";
import Image from "next/image";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OfficialSocialLinks } from "@/components/site/OfficialSocialLinks";
import { NetworkChip } from "@/components/site/NetworkChip";
import { FooterStatement } from "@/components/v2/FooterStatement";

type FooterLink = {
  label: string;
  href?: string;
  external?: boolean;
  github?: boolean;
};

const COLUMNS: ReadonlyArray<{ title: string; links: readonly FooterLink[] }> = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Learn", href: "/learn" },
      { label: "Users", href: "/users" },
      { label: "Economics", href: "/learn#economics" },
      { label: "Developers", href: "/developers" },
      { label: "Participate", href: "/participate" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Developer Overview", href: "/developers" },
      { label: "Contracts", href: "/developers#contracts" },
      { label: "GitHub", href: OFFICIAL_LINKS.github, external: true, github: true },
      { label: "Intake Form", href: OFFICIAL_LINKS.intakeForm, external: true },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "How Midgard works", href: "/learn" },
      { label: "Users", href: "/users" },
      { label: "Security", href: "/learn#security" },
      { label: "Questions", href: "/faq" },
      { label: "Glossary", href: "/glossary" },
      { label: "Security policy", href: OFFICIAL_LINKS.securityPolicy },
    ],
  },
  {
    title: "Official",
    links: [
      { label: "Official links", href: "/official-links" },
      { label: "Network status", href: "/status" },
      { label: "Whitepaper", href: "https://anastasia-labs.github.io/midgard/midgard.pdf", external: true },
      { label: "Discord", href: OFFICIAL_LINKS.discord, external: true },
      { label: "X · @midgardprotocol", href: OFFICIAL_LINKS.x, external: true },
    ],
  },
];

const LEGAL = [
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
] as const;

/**
 * Shared footer for the (site) route group — the full sitemap. Static server
 * markup except the compact NetworkChip, which is its own client island.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      {/* Compact next-step link above the sitemap. */}
      <FooterStatement />
      <div className="site-footer__top site-footer__top--sitemap">
        <div className="site-footer__brand">
          <div className="lock">
            <Image src="/midgard-icon.png" alt="" aria-hidden width={24} height={24} loading="eager" unoptimized />
            <span className="wm">Midgard</span>
          </div>
          <p>Grown on Cardano. Every block checkable, every claim inspectable.</p>

          <OfficialSocialLinks className="site-footer__social" linkClassName="site-footer__social-link" iconSize={20} />
        </div>

        {COLUMNS.map((col) => (
          <div className="site-footer__col" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  {!l.href ? (
                    <span>{l.label}</span>
                  ) : l.external ? (
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
          {LEGAL.map((l) => (
            <Link href={l.href} key={l.label}>
              {l.label}
            </Link>
          ))}
        </div>
        <NetworkChip />
        <span className="meta">© 2026 Midgard Labs · Always start from official links</span>
      </div>
    </footer>
  );
}
