import { X, UserPlus, UserCheck } from "lucide-react";
import styles from "./popupcontact.module.css";
import useUserStore from "../hooks/userstore";

const PopUpContact = ({ isOpen, onClose, userData }) => {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!isOpen || !userData) return null;

  const user = userData.user;
  const isFriendRequest = userData.type === "friendRequest";

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

          {/* Dynamischer Titel basierend auf dem Typ */}
          <h2 className={styles.title}>
            {isFriendRequest ? (
              <>
                <UserPlus size={24} className={styles.titleIcon} />
                Friend Request Sent!
              </>
            ) : (
              <>
                <UserCheck size={24} className={styles.titleIcon} />
                Contact Sent!
              </>
            )}
          </h2>

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

          {/* Dynamische Nachricht basierend auf dem Typ */}
          <p className={styles.message}>
            {isFriendRequest ? (
              <>
                Your friend request has been sent to{" "}
                <strong>{user?.nickname || user?.username}</strong>. It will be
                notified and can accept or decline your request.
              </>
            ) : (
              <>
                Your contact request has been sent to{" "}
                <strong>{user?.nickname || user?.username}</strong>.
              </>
            )}
          </p>

          <div className={styles.actions}>
            <button className={styles.continueButton} onClick={onClose}>
              {isFriendRequest ? "Continue Searching" : "Continue Matching"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopUpContact;
