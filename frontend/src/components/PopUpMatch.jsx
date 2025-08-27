import { useState, useEffect } from "react";
import { X, Heart, Users, MessageCircle, UserPlus } from "lucide-react";
import styles from "./popupmatch.module.css";

const MatchConnectedPopup = ({ isOpen, onClose, matchData, onSendMessage }) => {
  const [isVisible, setIsVisible] = useState(false);

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
    onSendMessage(matchData?.user?.id);
    handleClose();
  };

  if (!isOpen) return null;

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
            <Heart
              className={`${styles.heartIcon} ${styles.heartBeat}`}
              size={48}
            />
            <Users className={styles.usersIcon} size={32} />
          </div>
          <h2 className={styles.title}>🎉 It's a Match!</h2>
          <p className={styles.subtitle}>
            You and{" "}
            <strong>
              {matchData?.user?.nickname || matchData?.user?.username}
            </strong>{" "}
            both liked each other!
          </p>
        </div>

        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {matchData?.user?.avatar ? (
              <img
                src={matchData.user.avatar}
                alt={`${
                  matchData.user.nickname || matchData.user.username
                }'s avatar`}
                className={styles.avatarImage}
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
            ) : (
              <img
                src="/default-avatar.png"
                alt="Default avatar"
                className={styles.avatarImage}
              />
            )}
          </div>
          <div className={styles.userDetails}>
            <h3 className={styles.userName}>
              {matchData?.user?.nickname || matchData?.user?.username}
            </h3>
            <p className={styles.userHandle}>
              @{matchData?.user?.username}.HelloDev.social
            </p>
            <p className={styles.userStatus}>
              {matchData?.user?.status || "Developer"}
            </p>
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
          <button className={styles.continueButton} onClick={handleClose}>
            <span>Continue Matching</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchConnectedPopup;
