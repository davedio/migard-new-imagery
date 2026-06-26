"use client";

/* Light / dark theme with localStorage persistence (default light).
   Toggling cross-fades via the View Transitions API (quick ~0.32s). */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "midgard:theme";

/** Runs before paint via the inline script in src/app/layout.tsx. Reads the
 *  saved theme (default light) and sets data-theme so there is no flash. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="dark"&&t!=="light"){t="light";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}`;

/** World-tree hero plate per theme. Night assets live under /dark. */
export const TREE_PLATES: Record<Theme, string> = {
  light: "/plates/worldtree-day-tall.avif",
  dark: "/dark/plates/worldtree-day-tall.avif",
};

/** Prefix an asset path for the active theme (night assets live under /dark). */
export function themedAsset(path: string, theme: Theme): string {
  return theme === "dark" ? `/dark${path}` : path;
}

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeState | null>(null);

function persist(t: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = t;
  }
}

/** Apply a theme change, cross-fading via the View Transitions API when
 *  available and the visitor has not asked for reduced motion. */
function withTransition(run: () => void) {
  if (typeof document === "undefined") {
    run();
    return;
  }
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const startVT = (
    document as Document & {
      startViewTransition?: (cb: () => void) => void;
    }
  ).startViewTransition;
  if (startVT && !reduce) {
    startVT.call(document, run);
  } else {
    run();
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const themeRef = useRef<Theme>("light");

  const set = useCallback((t: Theme) => {
    themeRef.current = t;
    withTransition(() => {
      setThemeState(t);
      persist(t);
    });
  }, []);

  // Sync to whatever the boot script already applied (avoids a flash).
  useEffect(() => {
    const attr = document.documentElement.dataset.theme;
    if (attr === "dark" || attr === "light") {
      themeRef.current = attr;
      setThemeState(attr);
    }
  }, []);

  const toggle = useCallback(() => {
    set(themeRef.current === "dark" ? "light" : "dark");
  }, [set]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: set, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Read the shared theme. Resilient outside a provider. */
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return { theme: "light", setTheme: () => {}, toggle: () => {} };
}
