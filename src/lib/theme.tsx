"use client";

/* ============================================================
   Theme preference — single source of truth.

   "dark" is the canonical Midgard look (night tree, luminous sap).
   "light" is the same tree at dawn — morning mist, gold light, the
   blue bedrock veins gone faint. The preference persists in
   localStorage and is reflected as `data-theme` on <html>, which the
   CSS token overrides and the plate-image variables key off. A tiny
   inline script in the root layout applies the stored value before
   first paint so there is no dark->light flash.
   ============================================================ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

export type Theme = "dark" | "light";

const STORAGE_KEY = "midgard:theme";

/** Runs before paint via the inline script in src/app/layout.tsx. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="light")document.documentElement.dataset.theme="light";}catch(e){}`;

/** The day/night world-tree plates — one tree, two times of day.
 *  `wide` is the cinematic landscape (home hero on desktop); `tall` is the
 *  portrait crop (mobile home + the How It Works vertical descent). */
export const TREE_PLATES: Record<Theme, { wide: string; tall: string }> = {
  dark: {
    wide: "/plates/worldtree-night-wide.avif",
    tall: "/plates/worldtree-night-tall.avif",
  },
  light: {
    wide: "/plates/worldtree-day-wide.avif",
    tall: "/plates/worldtree-day-tall.avif",
  },
};

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Hydrate the stored preference after mount (the boot script already
  // applied the attribute, so this only syncs React state — no repaint).
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted pref after mount; the boot script set the attribute pre-paint so the frame never flashes
      if (v === "light" || v === "dark") setThemeState(v);
    } catch {
      /* localStorage unavailable — stay dark */
    }
  }, []);

  const apply = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore persistence failures */
    }
    if (t === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
  }, []);

  /* Flip inside a View Transition where supported so night<->day reads
     as one crossfade instead of a hard swap (flushSync makes the React
     commit land inside the transition's snapshot window). */
  const setTheme = useCallback(
    (t: Theme) => {
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      };
      if (typeof doc.startViewTransition === "function") {
        doc.startViewTransition(() => {
          flushSync(() => apply(t));
        });
      } else {
        apply(t);
      }
    },
    [apply],
  );

  /* Warm the OTHER theme's plates once the page has settled, so the first
     theme flip crossfades into an already-decoded image instead of a blank.
     Warm whichever orientation this viewport actually uses. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      const other = TREE_PLATES[theme === "dark" ? "light" : "dark"];
      const portrait = window.innerWidth < window.innerHeight * 0.9;
      const img = new window.Image();
      img.src = portrait ? other.tall : other.wide;
    }, 2500);
    return () => window.clearTimeout(id);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Read the shared theme. Works outside a ThemeProvider too (permanently
 * dark, no-op controls), so individual components stay resilient.
 */
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return { theme: "dark", setTheme: () => {}, toggle: () => {} };
}
