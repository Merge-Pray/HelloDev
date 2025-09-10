import { useNavigate } from "react-router";
import { useEffect } from "react";
import useUserStore from "../../hooks/userstore";
import styles from "./landingpage.module.css";
import DarkMode from "../../components/DarkMode";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import GitHubAuthButton from "../../components/GitHubAuthButton";

export default function LandingPage() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);

  // Weiterleitung zur Home-Seite wenn bereits eingeloggt
  useEffect(() => {
    if (currentUser) {
      navigate("/home", { replace: true });
    }
  }, [currentUser, navigate]);

  const handleGoogleSuccess = (data) => {
    console.log('🔐 GOOGLE LANDING: Success', data);
  };

  const handleGoogleError = (error) => {
    console.error('🔐 GOOGLE LANDING: Error', error);
  };

  const handleGitHubSuccess = (data) => {
    console.log('🔐 GITHUB LANDING: Success', data);
  };

  const handleGitHubError = (error) => {
    console.error('🔐 GITHUB LANDING: Error', error);
  };

  // Wenn User eingeloggt ist, zeige nichts an (wird eh weitergeleitet)
  if (currentUser) {
    return null;
  }

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

        {/* OAuth Buttons */}
        <div className={styles.oauthContainer}>
          <GoogleAuthButton 
            text="Sign up with Google"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            className={styles.oauthBtn}
          />
          
          <GitHubAuthButton 
            text="Sign up with GitHub"
            onSuccess={handleGitHubSuccess}
            onError={handleGitHubError}
            className={styles.oauthBtn}
          />
        </div>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          className={styles.createAccountBtn}
          onClick={() => navigate("/register")}
        >
          Create account
        </button>

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

      {/* Footer unterhalb von left und right im Grid */}
      <div className={styles.footer}>
        <p>Hallo</p>
      </div>
    </div>
  );
}
