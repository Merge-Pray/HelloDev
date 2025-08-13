import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import styles from "./landingpage.module.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateFavicon(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateFavicon(newTheme);
  };

  const updateFavicon = (mode) => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href =
        mode === "dark"
          ? "/logo/fav_icon_dark.svg"
          : "/logo/fav_icon_light.svg";
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href =
        mode === "dark"
          ? "/logo/fav_icon_dark.svg"
          : "/logo/fav_icon_light.svg";
      document.head.appendChild(link);
    }
  };

  return (
    <div className={styles.landingPage}>
      <h1 className={styles.title}>Landingpage</h1>

      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={() => navigate("/register")}
        >
          Register
        </button>
        <button
          className={styles.button}
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className={styles.button}
          onClick={toggleTheme}
        >
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>
    </div>
  );
};

export default LandingPage;