"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    applyTheme(saved === "light" ? "light" : "dark", setTheme);
  }, []);

  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark", setTheme);
  };

  return { theme, toggleTheme };
}

function applyTheme(theme: Theme, setTheme: (value: Theme) => void) {
  setTheme(theme);
  window.localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}
