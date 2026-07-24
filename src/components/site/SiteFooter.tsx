import Link from "next/link";
import Image from "next/image";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OfficialSocialLinks } from "@/components/site/OfficialSocialLinks";
import { NetworkChip } from "@/components/site/NetworkChip";
import { ExternalLinkNotice } from "@/components/site/ExternalLinkNotice";

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
      { label: "Participate", href: "/participate" },
      { label: "Users", href: "/users" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Developer Overview", href: "/developers" },
      { label: "Preprod contracts", href: "/developers#contracts" },
      { label: "GitHub", href: OFFICIAL_LINKS.github, external: true, github: true },
      { label: "Intake form", href: OFFICIAL_LINKS.intakeForm, external: true },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "How Midgard works", href: "/learn" },
      { label: "Users", href: "/users" },
      { label: "FAQs", href: "/learn#faq" },
      { label: "Glossary", href: "/learn#glossary" },
    ],
  },
  {
    title: "Official",
    links: [
      { label: "Official links", href: "/official-links" },
      { label: "Network status", href: "/status" },
      { label: "Technical specification", href: OFFICIAL_LINKS.technicalSpec, external: true },
      { label: "X · @midgardprotocol", href: OFFICIAL_LINKS.x, external: true },
      { label: "Security Policy", href: OFFICIAL_LINKS.securityPolicy },
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Notice", href: "/cookies" },
      { label: "Official Channels", href: "/official-channels" },
    ],
  },
];

/**
 * Shared footer for the (site) route group — the full sitemap. Static server
 * markup except the compact NetworkChip, which is its own client island.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top site-footer__top--sitemap">
        <div className="site-footer__brand">
          <div className="lock">
            <Image src="/midgard-icon.png" alt="" aria-hidden width={24} height={24} loading="eager" unoptimized />
            <span className="wm">Midgard</span>
          </div>

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
                      <ExternalLinkNotice />
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
        <NetworkChip />
        <span className="meta">© 2026 Midgard Labs, Inc.</span>
      </div>
    </footer>
  );
}
