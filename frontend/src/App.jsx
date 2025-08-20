import "./App.css";
import { Outlet, useLocation } from "react-router";
import MainMenu from "./components/MainMenu";
import useUserStore from "./hooks/userstore";
import styles from "./app.layout.module.css";

function App() {
  const currentUser = useUserStore((state) => state.currentUser);
  const location = useLocation();

  // ✅ Prüfe ob wir auf der Register-Seite sind
  const isRegisterPage = location.pathname === "/register";

  return (
    <div
      className={`${styles.appLayout} ${!currentUser ? styles.noUser : ""} ${
        isRegisterPage && !currentUser ? styles.allowScroll : ""
      }`}
    >
      {currentUser ? (
        <>
          <aside className={styles.navigation}>
            <MainMenu />
          </aside>
          <main className={styles.content}>
            <Outlet />
          </main>
        </>
      ) : (
        <main
          className={`${styles.fullWidth} ${
            isRegisterPage ? styles.allowScroll : ""
          }`}
        >
          <Outlet />
        </main>
      )}
    </div>
  );
}

export default App;
