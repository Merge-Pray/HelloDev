import { useNavigate } from "react-router";
import styles from "./landingpage.module.css";
import DarkMode from "../../components/DarkMode"; // Pfad anpassen!

export default function LandingPage() {
  const navigate = useNavigate();

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

        <h2 className={styles.subheadline}>
          Welcome. Sign up today.
        </h2>

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
    </div>
  );
}