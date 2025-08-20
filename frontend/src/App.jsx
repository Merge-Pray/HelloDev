import "./App.css";
import { Outlet } from "react-router";
import MainMenu from "./components/MainMenu";
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
    </div>
  );
}

export default App;
