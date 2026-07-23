/* ============================================================
   StaticHeroHeading — the hero H1, laid out with the exact same
   .v2-shx / shx-line / shx-w / shx-ch span structure the old
   ShatterHeading rendered (so typography is untouched), but with
   no canvas, no listeners, no cursor effect. The rift tear
   (HeroRiftCursor) is the hero's one cursor moment now — direction
   2026-07-23. The same component renders the rift's ghost copy so
   the two universes' headlines match glyph-for-glyph.
   ============================================================ */

import { Fragment } from "react";

export default function StaticHeroHeading({
  lines,
}: {
  lines: readonly string[];
}) {
  return (
    <div className="v2-shx">
      <h1 aria-label={lines.join(" ")}>
        {lines.map((line, li) => (
          <Fragment key={li}>
            {li > 0 ? " " : null}
            <span className="shx-line" aria-hidden>
              {line.split(" ").map((word, wi) => (
                <span key={wi}>
                  {wi > 0 ? " " : null}
                  <span className="shx-w">
                    {word.split("").map((ch, ci) => (
                      <span key={ci} className="shx-ch" data-ch={ch}>
                        {ch}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </h1>
    </div>
  );
}
