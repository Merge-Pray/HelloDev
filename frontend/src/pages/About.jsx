import styles from "./about.module.css";
import { useNavigate } from "react-router";

const About = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.aboutPage}>
  <div className={styles.aboutContent}>
        <h1 className={styles.aboutTitle}>About HelloDev</h1>
        <div className={styles.aboutText}>
          <p>
            HelloDev is the capstone project of our one-year Web Development course at the DCI (September 2024 – September 2025). It’s a full-stack application; we built both the front end and back end ourselves.
          </p>
          <p>
            Who are we? We are Sarah, Ben, and Calle. Find us on GitHub:
            {" "}
            <a href="https://github.com/SarahDomscheit" target="_blank" rel="noopener noreferrer">Sarah</a>,
            <a href="https://github.com/benNurtjipta" target="_blank" rel="noopener noreferrer">Ben</a>,
            <a href="https://github.com/cmgoersch" target="_blank" rel="noopener noreferrer">Calle</a>.
            
            The project lives in our course organization{" "}
            <a href="https://github.com/Merge-Pray" target="_blank" rel="noopener noreferrer">Merge & Pray</a>
            {" "}— repository:{" "}
            <a href="https://github.com/Merge-Pray/HelloDev" target="_blank" rel="noopener noreferrer">HelloDev</a>.
          </p>
          <p>
            Primary development took place between 11 August and 21 September 2025, and we plan to keep iterating. This is a practice environment—guests are welcome to explore, but it’s not intended for production use.
          </p>
        </div>
        <button className={styles.aboutBackBtn} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );
};

export default About;