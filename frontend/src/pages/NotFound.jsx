
import { useNavigate } from "react-router";
import React from "react";
import useUserStore from "../hooks/userstore";
import styles from "./notfound.module.css";
import logoColor from "/public/logo/HelloDev_Logo_Color.svg";
import logoWhite from "/public/logo/HelloDev_Logo_White.svg";
import DarkMode from "../components/DarkMode";


const NotFound = () => {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);

  const handleGoBack = () => {
    if (currentUser) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <img
          src={logoColor}
          alt="HelloDev Logo"
          className={styles.logoImg + " " + styles.logoLight}
        />
        <img
          src={logoWhite}
          alt="HelloDev Logo"
          className={styles.logoImg + " " + styles.logoDark}
        />
      </div>
      <div className={styles.toggle}>
        <DarkMode />
      </div>
      <div className={styles.code}>404</div>
      <div className={styles.text}>You had one job, router!</div>
      <button
        className={styles.button}
        onClick={handleGoBack}
      >
        {currentUser ? "Back to Home" : "Back to HelloDev"}
      </button>
    </div>
  );
};
export default NotFound;
