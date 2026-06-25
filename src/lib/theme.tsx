"use client";

/* ============================================================
   Preview theme — single light direction.
   ============================================================ */

import { createContext, useContext, type ReactNode } from "react";

export type Theme = "light";

const STORAGE_KEY = "midgard:theme";

/** Runs before paint via the inline script in src/app/layout.tsx. */
export const THEME_BOOT_SCRIPT = `try{document.documentElement.dataset.theme="light";localStorage.removeItem("${STORAGE_KEY}");}catch(e){document.documentElement.dataset.theme="light";}`;

/** The current world-tree plate used across the light site. */
export const TREE_PLATES: Record<Theme, string> = {
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
