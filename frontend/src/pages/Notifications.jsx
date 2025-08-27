import Sidebar from "../components/Sidebar/Sidebar";
import styles from "./notifications.module.css";

const Notifications = () => {
  return (
    <div className={styles.page}>
      <main className={styles.center}>Notifications</main>

      <aside className={styles.right}>
        <Sidebar />
      </aside>
    </div>
  );
};
export default Notifications;
