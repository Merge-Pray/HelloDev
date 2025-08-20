import SidebarNotifications from "../components/Sidebar/SidebarNotifications";
import styles from "./notifications.module.css";

const Notifications = () => {
  return (
    <div className={styles.page}>
      <main className={styles.center}>Notifications</main>

      <aside className={styles.right}>
        <SidebarNotifications />
      </aside>
    </div>
  );
};
export default Notifications;
