import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const themes = [
  { id: "emerald", label: "Emerald Green", swatch: ["#0f8a55", "#3ec98a", "#f6fbf8"] },
  { id: "forest", label: "Forest Green", swatch: ["#1d5c3a", "#4f9f5f", "#f4f8f2"] },
  { id: "ocean", label: "Ocean Blue", swatch: ["#0d6ea8", "#3fb6dd", "#f3f8fc"] },
  { id: "midnight", label: "Midnight Dark", swatch: ["#0e1418", "#2fd6a6", "#1b2429"] },
  { id: "earth", label: "Warm Earth", swatch: ["#9a5b2c", "#d79a5b", "#faf5ee"] },
  { id: "light", label: "Modern Light", swatch: ["#2b2f36", "#7b828e", "#ffffff"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

const STORAGE_KEY = "mm.theme";
const DARK_THEMES: ThemeId[] = ["midnight"];

type Ctx = { theme: ThemeId; setTheme: (t: ThemeId) => void };
const ThemeContext = createContext<Ctx>({ theme: "emerald", setTheme: () => {} });

function apply(theme: ThemeId) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", DARK_THEMES.includes(theme));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("emerald");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    const next = stored && themes.some((t) => t.id === stored) ? stored : "emerald";
    setThemeState(next);
    apply(next);
  }, []);

  const setTheme = (next: ThemeId) => {
    setThemeState(next);
    apply(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
