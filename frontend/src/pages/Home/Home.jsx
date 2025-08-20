import NewsfeedContainer from "../../components/NewsfeedContainer";
import Sidebar from "../../components/Sidebar";
import styles from "./home.module.css";

const Home = () => {
  return (
    <div className={styles.page}>
      <main className={styles.center}>
        <NewsfeedContainer />
      </main>

      <aside className={styles.right}>
        <Sidebar />
      </aside>
    </div>
  );
};
export default Home;
