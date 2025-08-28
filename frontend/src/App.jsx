import "./App.css";
import { Outlet, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import MainMenu from "./components/MainMenu";
import useUserStore from "./hooks/userstore";
import { authenticatedFetch } from "./utils/authenticatedFetch";
import styles from "./app.layout.module.css";

function App() {
  const currentUser = useUserStore((state) => state.currentUser);
  const setSocket = useUserStore((state) => state.setSocket);
  const location = useLocation();
  const socketRef = useRef(null);

  const isRegisterPage = location.pathname === "/register";

  useEffect(() => {
    if (currentUser && !socketRef.current) {
      const connectSocket = async () => {
        try {
          const socketUrl = import.meta.env.VITE_BACKENDPATH;

          const socket = io(socketUrl, {
            withCredentials: true,
          });

          socket.on("connect", () => {
            console.log("Socket connected to server:", socket.id);
          });

          socket.on("connect_error", async (error) => {
            console.error("Socket connection error:", error);

            if (error.message === "Authentication failed.") {
              try {
                await authenticatedFetch("/api/user/refresh");
                socket.connect();
              } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
              }
            }
          });

          socket.on("disconnect", (reason) => {
            console.log("Disconnected from server, reason:", reason);
          });

          socketRef.current = socket;
          setSocket(socket);
        } catch (err) {
          console.error("Socket connection error:", err);
        }
      };

      connectSocket();
    }

    if (!currentUser && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, [currentUser, setSocket]);

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
