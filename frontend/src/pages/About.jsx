import styles from "./about.module.css";
import { useNavigate } from "react-router";

// kleines GitHub-Logo als wiederverwendbare Komponente (SVG)
const GitHubIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ verticalAlign: "text-bottom", marginLeft: 4 }}
  >
    <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.43 7.86 10.96.58.1.79-.25.79-.56 
    0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.07-.73.08-.72.08-.72 
    1.18.08 1.8 1.22 1.8 1.22 1.05 1.8 2.76 1.28 3.43.98.11-.76.41-1.28.74-1.57-2.55-.29-5.23-1.28-5.23-5.7 
    0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.45.11-3.02 0 0 .98-.31 3.2 1.18a11.2 11.2 0 0 1 5.82 0 
    c2.22-1.5 3.2-1.18 3.2-1.18.63 1.57.23 2.73.11 3.02.75.82 1.2 1.84 1.2 3.1 0 4.43-2.69 5.4-5.26 5.69 
    .42.36.8 1.07.8 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.67.8.56 
    A10.52 10.52 0 0 0 23.5 12c0-6.28-5.23-11.5-11.5-11.5z" />
  </svg>
);

const About = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.aboutPage}>
      <div className={styles.aboutContent}>
        <h1 className={styles.aboutTitle}>About HelloDev</h1>
        <div className={styles.aboutText}>
          <p>
            <strong>HelloDev</strong> is the capstone project of our one-year
            Web Development course at the <strong>Digital Career Institute (DCI)</strong>  
            (September 2024 – September 2025). It’s a full-stack application we
            designed and built end-to-end.
          </p>

          <p>
            The goal: create a modern, developer-focused social network with
            real-time features and privacy-first data handling — from encrypted
            private chats to selective profile visibility.
          </p>

          <p>
            <strong>Who are we?</strong>  
            We are three developers working together as <strong>Merge &amp; Pray</strong>:
          </p>

          <ul className={styles.teamList}>
            <li>
              <strong>Sarah</strong>{" "}
              <a
                href="https://github.com/SarahDomscheit"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
              >
                GitHub <GitHubIcon />
              </a>
            </li>
            <li>
              <strong>Ben</strong>{" "}
              <a
                href="https://github.com/benNurtjipta"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
              >
                GitHub <GitHubIcon />
              </a>
            </li>
            <li>
              <strong>Calle</strong>{" "}
              <a
                href="https://github.com/cmgoersch"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubLink}
              >
                GitHub <GitHubIcon />
              </a>
            </li>
          </ul>

          <p>
            The project lives inside our course organization{" "}
            <a
              href="https://github.com/Merge-Pray"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              Merge &amp; Pray <GitHubIcon />
            </a>{" "}
            — repository:{" "}
            <a
              href="https://github.com/Merge-Pray/HelloDev"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              HelloDev <GitHubIcon />
            </a>.
          </p>

          <p>
            Core development took place between <strong>11 August and 21 September 2025</strong>,
            and we plan to keep iterating when possible.  
            HelloDev is a <strong>practice environment</strong>: guests are welcome to explore,
            but it is <strong>not intended for production use</strong> or permanent data storage.
          </p>

          <p>
            By sharing this project openly, we hope it serves as a learning resource and
            inspiration for fellow developers who want to build privacy-conscious,
            community-oriented applications.
          </p>
        </div>

        <button className={styles.aboutBackBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    </div>
  );
};

export default About;