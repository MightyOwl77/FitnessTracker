
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check if user has already set a preference
    if (typeof window !== "undefined") {
      // Check localStorage
      const savedTheme = localStorage.getItem("color-theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      
      // Check system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
    }
  }, [isDark]);
  
  return (
    <button
      type="button"
      className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
      onClick={() => setIsDark(!isDark)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
