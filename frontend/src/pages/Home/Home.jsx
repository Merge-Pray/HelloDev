import MainMenu from "../../components/MainMenu";
import NewsfeedContainer from "../../components/NewsfeedContainer";
import Sidebar from "../../components/Sidebar";
import styles from "./home.module.css";

const Home = () => {
  return (
    <div className={styles.page}>
      <aside className={styles.left}>
        <MainMenu />
      </aside>

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
