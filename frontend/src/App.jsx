import "./App.css";
import { Outlet, useLocation } from "react-router";
import { useEffect, useRef } from "react";
// import { io } from "socket.io-client";
import MainMenu from "./components/MainMenu";
import useUserStore from "./hooks/userstore";
// import { authenticatedFetch } from "./utils/authenticatedFetch";
import styles from "./app.layout.module.css";

function App() {
  const currentUser = useUserStore((state) => state.currentUser);
  // const setSocket = useUserStore((state) => state.setSocket);
  const clearUser = useUserStore((state) => state.clearUser);
  const location = useLocation();
  // const socketRef = useRef(null);

  const isRegisterPage = location.pathname === "/register";
  const isLoginPage = location.pathname === "/login";

  // useEffect(() => {
  //   if (currentUser && !socketRef.current) {
  //     const connectSocket = async () => {
  //       try {
  //         const socket = io(import.meta.env.VITE_BACKENDPATH, {
  //           withCredentials: true,
  //         });

  //         socket.on("connect", () => {
  //           console.log("Socket connected:", socket.id);
  //         });

  //         socket.on("connect_error", async (error) => {
  //           if (error.message === "Authentication failed") {
  //             try {
  //               await authenticatedFetch("/api/user/refresh");
  //               setTimeout(() => socket.connect(), 1000);
  //             } catch (refreshError) {
  //               clearUser();
  //               window.location.href = "/login";
  //             }
  //           }
  //         });

  //         socketRef.current = socket;
  //         setSocket(socket);
  //       } catch (err) {
  //         console.error("Socket connection error:", err);
  //       }
  //     };

  //     connectSocket();
  //   }

  //   if (!currentUser && socketRef.current) {
  //     socketRef.current.disconnect();
  //     socketRef.current = null;
  //     setSocket(null);
  //   }
  // }, [currentUser, setSocket, clearUser]);

  return (
    <div
      className={`${styles.appLayout} ${!currentUser ? styles.noUser : ""} ${
        isRegisterPage && !currentUser ? styles.allowScroll : ""
      } ${isLoginPage && !currentUser ? styles.allowScroll : ""}`}
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
            isRegisterPage || isLoginPage ? styles.allowScroll : ""
          }`}
        >
          <Outlet />
        </main>
      )}
    </div>
  );
}

export default App;
