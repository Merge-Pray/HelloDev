import SidebarMessages from "../components/Sidebar/SidebarMessages";
import styles from "../pages/messages.module.css";
const Messages = () => {
  return (
    <div className={styles.page}>
      <main className={styles.center}>Messages</main>

      <aside className={styles.right}>
        <SidebarMessages />
      </aside>
    </div>
  );
};
export default Messages;
