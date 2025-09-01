import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import useUserStore from "../../hooks/userstore";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import styles from "./landingpage.module.css";
import DarkMode from "../../components/DarkMode";

export default function LandingPage() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const [error, setError] = useState(null);

  // Weiterleitung zur Home-Seite wenn bereits eingeloggt
  useEffect(() => {
    if (currentUser) {
      navigate("/home", { replace: true });
    }
  }, [currentUser, navigate]);

  // Wenn User eingeloggt ist, zeige nichts an (wird eh weitergeleitet)
  if (currentUser) {
    return null;
  }

  const handleGoogleSuccess = () => {
    // User is already set in GoogleAuthButton, just let useEffect handle navigation
  };

  const handleGoogleError = (errorMessage) => {
    console.error('Google Auth error on landing page:', errorMessage);
    // Could show error toast here if you have a toast system
  };

  return (
    <div className={styles.container}>
      {/* Dark Mode Button fix oben rechts */}
      <div className={styles.darkModeWrapper}>
        <DarkMode />
      </div>

      {/* Linke Seite mit Logo */}
      <div className={styles.left}>
        {/* Light-Logo */}
        <img
          src="/logo/HelloDev_Logo_Color.svg"
          alt="HelloDev"
          className={`${styles.logo} ${styles.logoLight}`}
        />
        {/* Dark-Logo */}
        <img
          src="/logo/HelloDev_Logo_White.svg"
          alt="HelloDev"
          className={`${styles.logo} ${styles.logoDark}`}
        />
      </div>

      {/* Rechte Seite mit Text & Buttons */}
      <div className={styles.right}>
        <h1 className={styles.headline}>
          The network for nerds and hackers in software development
        </h1>

        <h2 className={styles.subheadline}>Welcome. Sign up today.</h2>

        <button
          className={styles.createAccountBtn}
          onClick={() => navigate("/register")}
        >
          Create account
        </button>

        <GoogleAuthButton 
          text="Continue with Google"
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <div className={styles.loginBox}>
          <span>Already have an account?</span>
          <button
            className={styles.loginBtn}
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
