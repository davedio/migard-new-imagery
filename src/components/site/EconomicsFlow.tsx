import { Fragment } from "react";
import styles from "./EconomicsFlow.module.css";

export type EconomicsFlowStep = {
  title: string;
  body: string;
  tone: "green" | "gold" | "cobalt";
};

/** A plain, directional reading of the network economics: fee → reward → bond. */
export default function EconomicsFlow({
  steps,
  ariaLabel,
}: {
  steps: readonly EconomicsFlowStep[];
  ariaLabel?: string;
}) {
  return (
    <div className={styles.flow} role="list" aria-label={ariaLabel}>
      {steps.map((step, i) => (
        <Fragment key={step.title}>
          <div className={styles.card} role="listitem" data-tone={step.tone}>
            <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.body}>{step.body}</p>
          </div>
          {i < steps.length - 1 ? (
            <span className={styles.arrow} data-tone={step.tone} aria-hidden="true">
              →
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
