import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import useUserStore from "./userstore";
import { authenticatedFetch } from "../utils/authenticatedFetch";

export const useSocket = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setSocket = useUserStore((state) => state.setSocket);
  const clearUser = useUserStore((state) => state.clearUser);
  const socketRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser && !socketRef.current) {
      const connectSocket = async () => {
        try {
          const socket = io(import.meta.env.VITE_BACKENDPATH, {
            withCredentials: true,
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: 3,
            transports: ["websocket", "polling"],
          });

          socket.on("connect", () => {
            console.log("Socket connected successfully");
            queryClient.invalidateQueries(["user-profile"]);
          });

          socket.on("connect_error", async (error) => {
            console.log("Socket connection error:", error.message);
            if (error.message === "Authentication failed") {
              try {
                await authenticatedFetch("/api/user/refresh");
                setTimeout(() => socket.connect(), 2000);
              } catch (refreshError) {
                console.log("Token refresh failed, redirecting to login");
                clearUser();
                window.location.href = "/login";
              }
            } else {
              setTimeout(() => socket.connect(), 5000);
            }
          });

          socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            if (reason === "io server disconnect") {
              socket.connect();
            }
          });

          socketRef.current = socket;
          setSocket(socket);
        } catch (err) {
          console.log("Socket initialization error:", err);
        }
      };

      connectSocket();
    }

    if (!currentUser && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, [currentUser, setSocket, clearUser, queryClient]);

  return socketRef.current;
};
