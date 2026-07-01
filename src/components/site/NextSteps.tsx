import Link from "next/link";
import type { ReactNode } from "react";

export type NextStepItem = {
  label: string;
  /** Optional one-line supporting text under the label. */
  sub?: string;
  href?: string;
  /** Optional icon rendered inline before the label (e.g. GitHubIcon). */
  icon?: ReactNode;
};

/**
 * End-of-page "Next steps" block: a titled row of 2–3 arrow-link cards in the
 * brand panel style. Server component, presentational only — styles live in
 * globals.css under "NEXT STEPS".
 *
 *   <NextSteps items={[{ label: "Read security", href: "/participate#security" }]} />
 */
export function NextSteps({
  title = "Next steps",
  items,
}: {
  title?: string;
  items: NextStepItem[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="next-steps" aria-label={title}>
      <div className="next-steps__inner">
        <div className="next-steps__head">
          <span className="eyebrow">{title}</span>
        </div>
        <div className="next-steps__grid">
          {items.map((item) => {
            const external = item.href ? /^https?:\/\//.test(item.href) : false;
            const inner = (
              <>
                <span className="next-steps__label">
                  {item.icon}
                  {item.label}
                  {item.href ? (
                    <span className="next-steps__arrow" aria-hidden>
                      →
                    </span>
                  ) : null}
                </span>
                {item.sub ? (
                  <span className="next-steps__sub">{item.sub}</span>
                ) : null}
              </>
            );
            if (!item.href) {
              return (
                <div key={item.label} className="next-steps__card panel" aria-disabled="true">
                  {inner}
                </div>
              );
            }
            return external ? (
              <a
                key={item.href}
                className="next-steps__card panel"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <Link key={item.href} className="next-steps__card panel" href={item.href}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
