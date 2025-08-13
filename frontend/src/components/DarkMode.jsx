import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const DarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="btn"
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
        e.target.style.background = "var(--color-primary)";
        e.target.style.color = "white";
        e.target.style.borderColor = "var(--color-primary)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "var(--color-bg-secondary)";
        e.target.style.color = "var(--color-text)";
        e.target.style.borderColor = "var(--color-card-border)";
      }}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default DarkMode;
