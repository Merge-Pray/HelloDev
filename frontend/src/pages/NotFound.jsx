
import { useNavigate } from "react-router";
import React from "react";
import styles from "./notfound.module.css";
import DarkMode from "../components/DarkMode";


const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.wrapper}>
      <div className={styles.toggle}>
        <DarkMode />
      </div>
      <div className={styles.code}>404</div>
      <div className={styles.text}>This page does not exist</div>
      <button
        className={styles.button}
        onClick={() => navigate("/home")}
      >Back to Home</button>
    </div>
  );
};
export default NotFound;
