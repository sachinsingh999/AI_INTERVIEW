import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState("dark");

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (currentTheme) => {
      let resolved = "dark";
      if (currentTheme === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        resolved = systemPrefersDark ? "dark" : "light";
      } else {
        resolved = currentTheme;
      }

      setResolvedTheme(resolved);

      if (resolved === "dark") {
        root.classList.add("dark");
        document.body.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        document.body.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        document.body.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        document.body.setAttribute("data-theme", "light");
      }
    };

    applyTheme(theme);

    // Sync theme across tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === "theme" || !e.key) {
        const storedTheme = localStorage.getItem("theme") || "system";
        setThemeState(storedTheme);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // If system theme, listen to changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
