import { useState } from "react";
import NewsfeedContainer from "../../components/NewsfeedContainer";
import Sidebar from "../../components/Sidebar/Sidebar";
import styles from "./home.module.css";

const Home = () => {
  const [reloadKey, setReloadKey] = useState(0);

  window.reloadNewsfeed = () => {
    setReloadKey(prev => prev + 1);
  };

  return (
    <div className={styles.page}>
      <main className={styles.center}>
        <NewsfeedContainer key={reloadKey} />
      </main>

      <aside className={styles.right}>
        <Sidebar />
      </aside>
    </div>
  );
};
export default Home;
