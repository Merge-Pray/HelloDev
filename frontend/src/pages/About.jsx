
import styles from "./about.module.css";

const About = () => {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.aboutContent}>
        <h1 className={styles.aboutTitle}>About HelloDev</h1>
        <div className={styles.aboutText}>
          <p>
            HelloDev is the final project of our one-year web development course at DCI Digital Carere Institute. It is a full-stack project for which we wrote the front-end and back-end ourselves.
            
          </p>
          <p>
            Who are we?
We are Sarah, Ben and Calle. You can find us on GitHub as:
          </p>
          <p>
            The project was mainly developed between 11 August and 21 September 2025, although we plan to continue working on it. A practice environment has been created, and although we welcome guests to our platform, it is not intended for actual operation. 
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
