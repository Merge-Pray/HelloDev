import { X } from "lucide-react";
import styles from "./popupcontact.module.css";
import useUserStore from "../hooks/userstore";

const PopUpContact = ({ isOpen, onClose, userData }) => {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!isOpen || !userData) return null;

  const user = userData.user;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.content}>
          <div className={styles.avatarAnimation}>
            <div className={styles.avatarContainer}>
              {/* Current User Avatar - flies from left */}
              <div className={`${styles.animatedAvatar} ${styles.avatarLeft}`}>
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={`${
                      currentUser.nickname || currentUser.username
                    }'s avatar`}
                    className={styles.avatarImage}
                    onError={(e) => {
                      e.target.src = "/avatars/default_avatar.png";
                    }}
                  />
                ) : (
                  <img
                    src="/avatars/default_avatar.png"
                    alt="Your avatar"
                    className={styles.avatarImage}
                  />
                )}
              </div>

              {/* Connection Line */}
              <div className={styles.connectionLine}></div>

              {/* Other User Avatar - flies from right */}
              <div className={`${styles.animatedAvatar} ${styles.avatarRight}`}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.nickname || user.username}'s avatar`}
                    className={styles.avatarImage}
                    onError={(e) => {
                      e.target.src = "/avatars/default_avatar.png";
                    }}
                  />
                ) : (
                  <img
                    src="/avatars/default_avatar.png"
                    alt="Default avatar"
                    className={styles.avatarImage}
                  />
                )}
              </div>
            </div>
          </div>

          <h2 className={styles.title}>Contact Sent!</h2>

          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.nickname || user.username}'s avatar`}
                  className={styles.avatarImage}
                  onError={(e) => {
                    e.target.src = "/avatars/default_avatar.png";
                  }}
                />
              ) : (
                <img
                  src="/avatars/default_avatar.png"
                  alt="Default avatar"
                  className={styles.avatarImage}
                />
              )}
            </div>
            <div className={styles.userDetails}>
              <h3>{user?.nickname || user?.username}</h3>
              <p>@{user?.username}.HelloDev.social</p>
            </div>
          </div>

          <p className={styles.message}>
            Your contact request has been sent to{" "}
            {user?.nickname || user?.username}.
          </p>

          <div className={styles.actions}>
            <button className={styles.continueButton} onClick={onClose}>
              Continue Matching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopUpContact;
