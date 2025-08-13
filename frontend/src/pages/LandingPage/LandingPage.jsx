import { useNavigate } from "react-router";
import styles from "./landingpage.module.css";
import DarkMode from "../../components/DarkMode"; // Pfad anpassen

const LandingPage = () => {
  const navigate = useNavigate();

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
        <DarkMode className={styles.button} />
      </div>
    </div>
  );
};

export default LandingPage;