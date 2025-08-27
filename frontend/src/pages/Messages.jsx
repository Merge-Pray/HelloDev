import Sidebar from "../components/Sidebar/Sidebar";
import styles from "../pages/messages.module.css";
const Messages = () => {
  return (
    <div className={styles.page}>
      <main className={styles.center}>Messages</main>

      <aside className={styles.right}>
        <Sidebar />
      </aside>
    </div>
  );
};
export default Messages;
