"use client";

/* ============================================================
   Preview theme — single light direction.

   Dark mode is intentionally disabled for this preview branch. The dark
   assets remain in the repo for a later pass, but no UI path should let a
   reviewer switch modes while we tune the light visual system.
   ============================================================ */

import { createContext, useContext, type ReactNode } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "midgard:theme";

/** Runs before paint via the inline script in src/app/layout.tsx. */
export const THEME_BOOT_SCRIPT = `try{document.documentElement.dataset.theme="light";localStorage.removeItem("${STORAGE_KEY}");}catch(e){document.documentElement.dataset.theme="light";}`;

/** The day/night world-tree plates — one tree, two times of day. */
export const TREE_PLATES: Record<Theme, string> = {
  dark: "/plates/worldtree-night-tall.avif",
  light: "/plates/worldtree-day-tall.avif",
};

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

const FIXED_LIGHT_THEME: ThemeState = {
  theme: "light",
  setTheme: () => {},
  toggle: () => {},
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={FIXED_LIGHT_THEME}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Read the shared theme. Works outside a ThemeProvider too, so individual
 * components stay resilient.
 */
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return FIXED_LIGHT_THEME;
}
