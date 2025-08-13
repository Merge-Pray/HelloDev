import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  // Theme State
  const [theme, setTheme] = useState("light");

  // Theme beim Laden setzen (optional aus localStorage laden)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateFavicon(savedTheme);
  }, []);

  // Funktion zum Wechseln des Themes
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateFavicon(newTheme);
  };

  // Favicon ändern
  const updateFavicon = (mode) => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = mode === "dark" ? "/logo/fav_icon_dark.svg" : "/logo/fav_icon_light.svg";
    } else {
      // Falls noch kein Favicon vorhanden ist, neu anlegen
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = mode === "dark" ? "/logo/fav_icon_dark.svg" : "/logo/fav_icon_light.svg";
      document.head.appendChild(link);
    }
  };

  return (
    <div className="landing-page">
      <h1>Landingpage</h1>

      <div className="button-group">
        <button onClick={() => navigate("/register")}>Register</button>
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={toggleTheme}>
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>
    </div>
  );
};

export default LandingPage;