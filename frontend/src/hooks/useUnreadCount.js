import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import useUserStore from "./userstore";

export const useUnreadCount = () => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const socket = useUserStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.currentUser);
  const location = useLocation();

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

  const handleUnreadCountUpdate = useCallback(
    (data) => {
      if (activeChatUserId && data.fromUserId === activeChatUserId) {
        return;
      }
      setTotalUnreadCount(data.totalUnreadCount || 0);
    },
    [activeChatUserId]
  );

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

  useEffect(() => {
    if (location.pathname.startsWith("/chat/")) {
      const pathParts = location.pathname.split("/");
      const userId = pathParts[2];
      if (userId) {
        setActiveChatUserId(userId);
      } else {
        setActiveChatUserId(null);
      }
    } else {
      setActiveChatUserId(null);
    }
  }, [location.pathname]);

  const refreshUnreadCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const markChatAsRead = useCallback(
    async (chatId) => {
      if (!currentUser || !chatId) return;

      try {
        await authenticatedFetch(`/api/chats/${chatId}/mark-read`, {
          method: "PATCH",
        });

        await fetchUnreadCount();
      } catch (error) {
        console.error("Error marking chat as read:", error);
      }
    },
    [currentUser, fetchUnreadCount]
  );

  return {
    totalUnreadCount,
    isLoading,
    refreshUnreadCount: fetchUnreadCount,
    markChatAsRead,
    setActiveChatUserId,
  };
};
