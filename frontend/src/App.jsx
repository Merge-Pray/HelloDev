import "./App.css";
import { Outlet } from "react-router";
import MainMenu from "./components/MainMenu";
import Sidebar from "./components/Sidebar";
import styles from "./app.layout.module.css";

function App() {
  return (
    <div className={styles.appLayout}>
      <aside className={styles.navigation}>
        <MainMenu />
      </aside>
      
      <main className={styles.content}>
        <Outlet />
      </main>

      <aside className={styles.sidebar}>
        <Sidebar />
      </aside>
    </div>
  );
}

export default App;
