import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, Link, Users, MessageCircle, UserPlus, User } from "lucide-react";
import styles from "./popupmatch.module.css";

const PopUpMatch = ({ isOpen, onClose, matchData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleSendMessage = () => {
    // Navigate to chat with the matched user
    if (matchData?.user?.id || matchData?.user?._id) {
      const userId = matchData.user.id || matchData.user._id;
      navigate(`/chat/${userId}`);
    }
    handleClose();
  };

  const handleViewProfile = () => {
    // Navigate to the matched user's profile
    if (matchData?.user?.id || matchData?.user?._id) {
      const userId = matchData.user.id || matchData.user._id;
      navigate(`/profile/${userId}`);
    }
    handleClose();
  };

  if (!isOpen) return null;

  // Debug logging
  console.log('PopUpMatch received matchData:', matchData);

  // Fallback für fehlende User-Daten
  const user = matchData?.user || {};
  const displayName = user.nickname || user.username || "Unknown User";
  const userName = user.username || "unknown";
  const avatar = user.avatar || "/avatars/default_avatar.png";
  const status = user.status || "Developer";

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ""}`}>
      <div
        className={`${styles.popup} ${isVisible ? styles.popupVisible : ""}`}
      >
        {/* Close Button */}
        <button className={styles.closeButton} onClick={handleClose}>
          <X size={20} />
        </button>

        {/* Header with Animation */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <Link
              className={`${styles.linkIcon} ${styles.linkPulse}`}
              size={48}
            />
            <Users className={styles.usersIcon} size={32} />
          </div>
          <h2 className={styles.title}>🤝 Connected!</h2>
          <p className={styles.subtitle}>
            You and{" "}
            <strong>{displayName}</strong>{" "}
            are now connected!
          </p>
        </div>

        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <img
              src={avatar}
              alt={`${displayName}'s avatar`}
              className={styles.avatarImage}
              onError={(e) => {
                e.target.src = "/avatars/default_avatar.png";
              }}
            />
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>{displayName}</h3>
            <p className={styles.userHandle}>@{userName}.HelloDev.social</p>
            <p className={styles.userStatus}>{status}</p>
          </div>
        </div>

        {/* Connection Message */}
        <div className={styles.connectionMessage}>
          <div className={styles.messageBox}>
            <UserPlus size={20} className={styles.messageIcon} />
            <p>
              You're now connected! You can see each other's posts and start
              collaborating.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.messageButton} onClick={handleSendMessage}>
            <MessageCircle size={18} />
            <span>Send Message</span>
          </button>
          
          <button className={styles.profileButton} onClick={handleViewProfile}>
            <User size={18} />
            <span>View Profile</span>
          </button>
          
          <button className={styles.continueButton} onClick={handleClose}>
            <span>Continue Matching</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUpMatch;
