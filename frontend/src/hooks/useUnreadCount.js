import { useState, useEffect, useCallback } from "react";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import useUserStore from "./userstore";

export const useUnreadCount = () => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const socket = useUserStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.currentUser);

  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) return;

    try {
      const data = await authenticatedFetch("/api/chats/unread-count");
      setTotalUnreadCount(data.totalUnreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setTotalUnreadCount(0);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;

    const handleUnreadCountUpdate = (count) => {
      console.log("🔔 Notification update:", count);
      setTotalUnreadCount(count);
    };

    socket.on("unreadCountUpdate", handleUnreadCountUpdate);

    return () => {
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
    };
  }, [socket]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    totalUnreadCount,
    refreshUnreadCount: fetchUnreadCount,
  };
};
