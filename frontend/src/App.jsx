import "./App.css";
import { Outlet, useLocation } from "react-router";
import MainMenu from "./components/MainMenu";
import useUserStore from "./hooks/userstore";
import { useSocket } from "./hooks/useSocket";
import { getLayoutClasses } from "./utils/layoutUtils";
import styles from "./app.layout.module.css";

function App() {
  const currentUser = useUserStore((state) => state.currentUser);
  const location = useLocation();
  const { appClasses, mainClasses } = getLayoutClasses(
    styles,
    currentUser,
    location.pathname
  );

  useSocket();

  return (
    <div className={appClasses}>
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
        <main className={mainClasses}>
          <Outlet />
        </main>
      )}
    </div>
  );
}

export default App;
