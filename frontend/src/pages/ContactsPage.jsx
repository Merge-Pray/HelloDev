import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import styles from "./contactspage.module.css";

export default function ContactsPage() {
  return (
    <div className={styles.contactsPage}>
      <div className={styles.contactsContainer}>
        <div className={styles.contactsContent}>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
