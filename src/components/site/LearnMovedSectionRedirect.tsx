"use client";

import { useEffect } from "react";

/* Fragments never reach the server. Preserve direct links to sections that
   moved from Learn to the homepage without leaving visitors at an empty spot. */
const REDIRECTS: Record<string, string> = {
  "#economics": "/#economics",
  "#comparison": "/#comparison",
};

export default function LearnMovedSectionRedirect() {
  useEffect(() => {
    const target = REDIRECTS[window.location.hash];
    if (target) window.location.replace(target);
  }, []);

  return null;
}
