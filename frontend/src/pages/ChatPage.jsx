import Sidebar from "../components/Sidebar/Sidebar";
import styles from "../pages/messages.module.css";
const ChatPage = () => {
  return (
    <div className={styles.page}>
      <main className={styles.center}>Chat</main>

      <aside className={styles.right}>
        <Sidebar />
      </aside>
    </div>
  );
};
export default ChatPage;
