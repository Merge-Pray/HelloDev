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

const DarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const userChoseManually = useRef(false); // merkt sich, ob User aktiv getoggelt hat

  // Initialisierung + System-Änderungen beobachten
  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(QUERY);
    const saved = getSavedTheme();

    const dark = saved ? saved === DARK : media.matches;
    setIsDarkMode(dark);
    setThemeAttr(dark ? DARK : LIGHT);


    const onSystemChange = (e) => {
      if (userChoseManually.current) return; // User hat explizit gewählt → nicht überschreiben
      const nowDark = e.matches;
      setIsDarkMode(nowDark);
      setThemeAttr(nowDark ? DARK : LIGHT);
    };

    // addEventListener fallback für ältere Browser
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onSystemChange);
      return () => media.removeEventListener("change", onSystemChange);
    } else {
      media.addListener(onSystemChange);
      return () => media.removeListener(onSystemChange);
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    userChoseManually.current = true;
    setIsDarkMode(next);
    setThemeAttr(next ? DARK : LIGHT);
    saveTheme(next ? DARK : LIGHT);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="btn"
      aria-pressed={isDarkMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        background: "var(--color-bg-secondary)",
        border: "2px solid var(--color-card-border)",
        borderRadius: "8px",
        padding: "8px",
        cursor: "pointer",
        color: "var(--color-text)",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--color-primary)";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.borderColor = "var(--color-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--color-bg-secondary)";
        e.currentTarget.style.color = "var(--color-text)";
        e.currentTarget.style.borderColor = "var(--color-card-border)";
      }}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default DarkMode;