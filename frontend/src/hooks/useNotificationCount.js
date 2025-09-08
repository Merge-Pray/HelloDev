import { useState, useEffect, useCallback } from "react";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import useUserStore from "./userstore";

export const useNotificationCount = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const socket = useUserStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.currentUser);

  const fetchNotificationCount = useCallback(async () => {
    if (!currentUser) return;

    try {
      const data = await authenticatedFetch("/api/contactrequest/unread-count");
      setNotificationCount(data.unreadNotificationCount || 0);
    } catch (error) {
      console.error("Error fetching notification count:", error);
      setNotificationCount(0);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      setNotificationCount((prev) => prev + 1);
    };

    const handleNotificationCountUpdate = (count) => {
      setNotificationCount(count);
    };

    const handleReconnect = () => {
      fetchNotificationCount();
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("notificationCountUpdate", handleNotificationCountUpdate);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("notificationCountUpdate", handleNotificationCountUpdate);
      socket.off("connect", handleReconnect);
    };
  }, [socket, fetchNotificationCount]);

  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount]);

  return {
    notificationCount,
    refreshNotificationCount: fetchNotificationCount,
  };
};
