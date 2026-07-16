"use client";

import { useState } from "react";
import styles from "./contracts.module.css";

function copyWithSelection(value: string) {
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const didCopy = document.execCommand("copy");
  textarea.remove();
  activeElement?.focus();
  return didCopy;
}

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
    let didCopy = false;
    try {
      await navigator.clipboard.writeText(value);
      didCopy = true;
    } catch {
      didCopy = copyWithSelection(value);
    }

    if (!didCopy) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <span className={styles.copyField}>
      {href ? (
        <a
          className={styles.copyValue}
          href={href}
          target="_blank"
          rel="noreferrer"
          title={`${label ? `${label}: ` : ""}open on explorer`}
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
        aria-label={`Copy ${label ?? "value"}`}
        data-copied={copied}
      >
        {copied ? "copied" : "copy"}
      </button>
      {/* polite announcement so keyboard/SR users hear the confirmation the
          button text shows visually */}
      <span role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        {copied ? "Copied to clipboard" : ""}
      </span>
    </span>
  );
}
