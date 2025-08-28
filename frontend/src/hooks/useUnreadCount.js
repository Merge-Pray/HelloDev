import { useState, useEffect, useCallback } from "react";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import useUserStore from "./userstore";

export const useUnreadCount = () => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useUserStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.currentUser);

  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const data = await authenticatedFetch("/api/chats/unread-count");
      setTotalUnreadCount(data.totalUnreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setTotalUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleUnreadCountUpdate = useCallback((data) => {
    setTotalUnreadCount(data.totalUnreadCount || 0);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("unreadCountUpdate", handleUnreadCountUpdate);

      return () => {
        socket.off("unreadCountUpdate", handleUnreadCountUpdate);
      };
    }
  }, [socket, handleUnreadCountUpdate]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    totalUnreadCount,
    isLoading,
    refreshUnreadCount,
  };
};
