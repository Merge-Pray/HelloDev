import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  UserCheck,
  UserPlus,
  Heart,
  MessageCircle,
  Check,
  X,
  Clock,
  Users,
  Loader,
  MoreHorizontal,
} from "lucide-react";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import { useNotificationCount } from "../hooks/useNotificationCount";
import Sidebar from "../components/Sidebar/Sidebar";
import styles from "./notifications.module.css";

const Notifications = () => {
  const navigate = useNavigate();
  const { refreshNotificationCount } = useNotificationCount();
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]); // Store all notifications for accurate counts
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const unreadOnly = filter === "unread";
      const response = await authenticatedFetch(
        `/api/contactrequest/notifications`
      );

      if (response.success) {
        // Store all notifications for accurate counts
        setAllNotifications(response.notifications);
        
        let filteredNotifications = response.notifications;

        // Apply unread filter first if selected
        if (filter === "unread") {
          filteredNotifications = response.notifications.filter(
            (n) => !n.isRead
          );
        } else if (filter === "friend_requests") {
          filteredNotifications = response.notifications.filter(
            (n) =>
              n.type === "friend_request" ||
              n.type === "friend_request_accepted"
          );
        } else if (filter === "matches") {
          filteredNotifications = response.notifications.filter(
            (n) => n.type === "match_found"
          );
        }

        setNotifications(filteredNotifications);
      } else {
        setError("Failed to load notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptFriendRequest = async (notificationId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [notificationId]: "accept" }));

      const response = await authenticatedFetch(
        `/api/contactrequest/${notificationId}/accept`,
        {
          method: "PATCH",
        }
      );

      if (response.success) {
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        
        // Also remove from allNotifications for accurate counts
        setAllNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );

        refreshNotificationCount();
      } else {
        setError("Failed to accept friend request");
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setError("Failed to accept friend request");
    } finally {
      setActionLoading((prev) => ({ ...prev, [notificationId]: null }));
    }
  };

  const handleDeclineFriendRequest = async (notificationId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [notificationId]: "decline" }));

      const response = await authenticatedFetch(
        `/api/contactrequest/${notificationId}/decline`,
        {
          method: "PATCH",
        }
      );

      if (response.success) {
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        
        // Also remove from allNotifications for accurate counts
        setAllNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );

        refreshNotificationCount();
      } else {
        setError("Failed to decline friend request");
      }
    } catch (err) {
      console.error("Error declining friend request:", err);
      setError("Failed to decline friend request");
    } finally {
      setActionLoading((prev) => ({ ...prev, [notificationId]: null }));
    }
  };

  const handleMarkAsRead = async (notificationIds) => {
    try {
      await authenticatedFetch("/api/contactrequest/notifications/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n._id) ? { ...n, isRead: true } : n
        )
      );
      
      // Also update allNotifications for accurate counts
      setAllNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n._id) ? { ...n, isRead: true } : n
        )
      );
      
      // Refresh notification count
      refreshNotificationCount();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await authenticatedFetch("/api/contactrequest/notifications/mark-all-read", {
        method: "PATCH",
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      
      // Also update allNotifications for accurate counts
      setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      
      // Refresh notification count (should be 0 after mark all as read)
      refreshNotificationCount();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleCardClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead([notification._id]);
    }

    navigate(`/profile/${notification.user1._id}`);
  };

  const handleSendMessage = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "friend_request":
        return <UserPlus size={20} className={styles.iconRequest} />;
      case "friend_request_accepted":
        return <UserCheck size={20} className={styles.iconSuccess} />;
      case "match_found":
        return <Heart size={20} className={styles.iconMatch} />;
      default:
        return <Users size={20} className={styles.iconDefault} />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const renderNotificationActions = (notification) => {
    const loadingState = actionLoading[notification._id];

    if (
      notification.type === "friend_request" &&
      notification.status === "pending"
    ) {
      return (
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionBtn} ${styles.acceptBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              handleAcceptFriendRequest(notification._id);
            }}
            disabled={loadingState}
          >
            {loadingState === "accept" ? (
              <Loader size={16} className={styles.spinner} />
            ) : (
              <Check size={16} />
            )}
            <span>Accept</span>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.declineBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDeclineFriendRequest(notification._id);
            }}
            disabled={loadingState}
          >
            {loadingState === "decline" ? (
              <Loader size={16} className={styles.spinner} />
            ) : (
              <X size={16} />
            )}
            <span>Decline</span>
          </button>
        </div>
      );
    }

    if (notification.type === "friend_request_accepted") {
      return (
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionBtn} ${styles.messageBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSendMessage(notification.user1._id);
            }}
          >
            <MessageCircle size={16} />
            <span>Send Message</span>
          </button>
        </div>
      );
    }

    if (notification.type === "match_found") {
      return (
        <div className={styles.matchBadge}>
          <Heart size={14} />
          <span>New Match!</span>
        </div>
      );
    }

    return null;
  };

  const getFilterCount = (filterType) => {
    switch (filterType) {
      case "unread":
        return notifications.filter((n) => !n.isRead).length;
      case "friend_requests":
        return notifications.filter(
          (n) =>
            n.type === "friend_request" || n.type === "friend_request_accepted"
        ).length;
      case "matches":
        return notifications.filter((n) => n.type === "match_found").length;
      default:
        return notifications.length;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.center}>
          <div className={styles.container}>
            <div className={styles.loadingContainer}>
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          </div>
        </main>
        <aside className={styles.right}>
          <Sidebar />
        </aside>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.center}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Notifications</h1>
              <p className={styles.subtitle}>
                Stay updated with your connections and matches
              </p>
            </div>
            <div className={styles.headerRight}>
              <button
                className={styles.markAllBtn}
                onClick={handleMarkAllAsRead}
                disabled={notifications.every((n) => n.isRead)}
              >
                <Check size={16} />
                <span>Mark all as read</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            {[
              { key: "all", label: "All", count: allNotifications.length },
              {
                key: "unread",
                label: "Unread",
                count: allNotifications.filter((n) => !n.isRead).length,
              },
              {
                key: "friend_requests",
                label: "Friend Requests",
                count: allNotifications.filter(
                  (n) =>
                    n.type === "friend_request" ||
                    n.type === "friend_request_accepted"
                ).length,
              },
              {
                key: "matches",
                label: "Matches",
                count: allNotifications.filter((n) => n.type === "match_found")
                  .length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`${styles.filterTab} ${
                  filter === tab.key ? styles.active : ""
                }`}
                onClick={() => setFilter(tab.key)}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={styles.count}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && <div className={styles.error}>{error}</div>}

          {/* Notifications List */}
          <div className={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={48} className={styles.emptyIcon} />
                <h3>No notifications yet</h3>
                <p>
                  When you receive friend requests or find new matches, they'll
                  appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`${styles.notificationCard} ${
                    !notification.isRead ? styles.unread : ""
                  }`}
                  onClick={() => handleCardClick(notification)}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && <div className={styles.unreadDot} />}

                  {/* Avatar */}
                  <div className={styles.avatar}>
                    <img
                      src={
                        notification.user1?.avatar ||
                        "/avatars/default_avatar.png"
                      }
                      alt={`${
                        notification.user1?.nickname ||
                        notification.user1?.username
                      }'s avatar`}
                      className={styles.avatarImage}
                      onError={(e) => {
                        e.target.src = "/avatars/default_avatar.png";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className={styles.content}>
                    <div className={styles.notificationHeader}>
                      <div className={styles.iconAndUser}>
                        {getNotificationIcon(notification.type)}
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>
                            {notification.user1?.nickname ||
                              notification.user1?.username}
                          </span>
                          <span className={styles.userHandle}>
                            @{notification.user1?.username}
                          </span>
                        </div>
                      </div>
                      <div className={styles.timeAndMore}>
                        <span className={styles.time}>
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        <button className={styles.moreBtn}>
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.message}>{notification.message}</div>

                    {/* Actions */}
                    <div className={styles.actions}>
                      {renderNotificationActions(notification)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <aside className={styles.right}>
        <Sidebar />
      </aside>
    </div>
  );
};

export default Notifications;
