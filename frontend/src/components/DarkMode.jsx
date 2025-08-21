import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "theme";
const DARK = "dark";
const LIGHT = "light";
const QUERY = "(prefers-color-scheme: dark)";

function setThemeAttr(theme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export default function DarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const userChoseManually = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(QUERY);
    const saved = getSavedTheme();

    const dark = saved ? saved === DARK : media.matches;
    setIsDarkMode(dark);
    setThemeAttr(dark ? DARK : LIGHT);

    const onSystemChange = (e) => {
      if (userChoseManually.current) return;
      const nowDark = e.matches;
      setIsDarkMode(nowDark);
      setThemeAttr(nowDark ? DARK : LIGHT);
    };

    media.addEventListener?.("change", onSystemChange);
    return () => media.removeEventListener?.("change", onSystemChange);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    userChoseManually.current = true;
    setIsDarkMode(next);
    setThemeAttr(next ? DARK : LIGHT);
    saveTheme(next ? DARK : LIGHT);
  };

  return (
    <>
      <button
        onClick={toggleDarkMode}
        className="darkmode-btn"
        aria-pressed={isDarkMode}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <style>{`
        .darkmode-btn {
          background: var(--color-bg);
          color: var(--color-text);
          border: none;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background .2s ease, color .2s ease;
        }

        .darkmode-btn:hover,
        .darkmode-btn:focus-visible {
          background: var(--color-primary);
          color: #fff;
        }

        .darkmode-btn:active {
          transform: scale(0.96); /* kleines Feedback beim Klicken */
        }
      `}</style>
    </>
  );
}