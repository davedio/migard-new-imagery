import Link from "next/link";
import { ECONOMICS_MATRIX } from "@/lib/siteCopy";
import css from "./EconomicsMatrix.module.css";

/* ------------------------------------------------------------------ *
 * EconomicsMatrix — the single cross-entity view of network economics
 * (Users / Builders / Operators / Watchers / Cardano), rendered on
 * /#economics. A real table: rows are entities, columns are what
 * they pay and what they get, each row linking to the page that tells
 * its side in full. Static markup, no client JS. Wide content scrolls
 * inside its own container on small screens.
 * ------------------------------------------------------------------ */

export default function EconomicsMatrix() {
  return (
    <div className={css.wrap}>
      <div className={css.scroller} role="region" aria-label="Economics by participant" tabIndex={0}>
        <table className={css.table}>
          <thead>
            <tr>
              <th scope="col">Who</th>
              <th scope="col">What you pay</th>
              <th scope="col">What you get</th>
              <th scope="col" aria-label="Told in full" />
            </tr>
          </thead>
          <tbody>
            {ECONOMICS_MATRIX.rows.map((row) => (
              <tr key={row.who}>
                <th scope="row">{row.who}</th>
                <td>{row.pay}</td>
                <td>{row.get}</td>
                <td className={css.linkCell}>
                  <Link href={row.href}>{row.cta} →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={css.fine}>{ECONOMICS_MATRIX.finePrint}</p>
    </div>
  );
}
