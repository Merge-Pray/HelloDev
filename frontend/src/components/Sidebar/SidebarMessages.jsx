import styles from "./Sidebar.module.css";

export default function SidebarMessages() {
  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <div className={styles.title}>Search</div>
        <input
          className={styles.input}
          placeholder="Search…"
          disabled
          aria-disabled="true"
        />
        <div className={styles.note}>Kommt später ✨</div>
      </div>

      <div className={styles.section}>
        <div className={styles.title}>Last active contacts</div>
        <div className={styles.placeholder}>Platzhalter-Content …</div>
      </div>
    </div>
  );
}
