import React, { useState, useEffect } from "react";
import styles from "./CookieBanner.module.css";
import { Link } from "react-router";

const COOKIE_KEY = "hellodev_cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={styles.banner}
      style={{
        background: "var(--color-card-bg)",
        color: "var(--color-text)",
        boxShadow: "0 -2px 8px var(--color-card-shadow)",
        borderTop: "1px solid var(--color-card-border)",
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        zIndex: 1000,
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0.5rem 0", fontSize: 16 }}>
        <strong>Cookie Notice:</strong> This website only uses technically necessary cookies.
        <strong> No tracking, analytics or marketing cookies</strong> are set. For more information, see our{' '}
        <Link to="/generaltermsandconditions" target="_blank" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
          privacy policy
        </Link>.
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
          <strong>Cookie-Hinweis:</strong> Diese Website verwendet ausschließlich technisch notwendige Cookies. Keine Tracking-, Analyse- oder Marketing-Cookies. Mehr Infos in der <Link to="/generaltermsandconditions" target="_blank" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>Datenschutzerklärung</Link>.
        </div>
      </div>
      <button
        className="btn btn-primary"
        style={{ marginLeft: 24, minWidth: 120 }}
        onClick={acceptCookies}
      >
        Noted
      </button>
    </div>
  );
};

export default CookieBanner;
