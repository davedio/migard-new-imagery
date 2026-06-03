"use client";

import { useState } from "react";
import styles from "./contracts.module.css";

/**
 * A monospace value (address / hash / UTxO ref) with a copy-to-clipboard
 * button and an optional explorer link. The full value is always present in
 * the DOM for screen readers and select-all; the visible text may be
 * truncated by CSS.
 */
export function CopyField({
  value,
  href,
  label,
}: {
  value: string;
  href?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard blocked (e.g. insecure context) — selection still works.
    }
  };

  return (
    <span className={styles.copyField}>
      {href ? (
        <a
          className={styles.copyValue}
          href={href}
          target="_blank"
          rel="noreferrer"
          title={`${label ? `${label} — ` : ""}open on explorer`}
        >
          {value}
        </a>
      ) : (
        <span className={styles.copyValue}>{value}</span>
      )}
      <button
        type="button"
        className={styles.copyBtn}
        onClick={copy}
        aria-label={copied ? "Copied" : `Copy ${label ?? "value"}`}
        data-copied={copied}
      >
        {copied ? "copied" : "copy"}
      </button>
    </span>
  );
}
