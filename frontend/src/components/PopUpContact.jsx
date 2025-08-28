import { Check, X, User } from "lucide-react";
import styles from "./PopUpContact.module.css";

const PopUpContact = ({ isOpen, onClose, userData }) => {
  if (!isOpen || !userData) return null;

  const user = userData.user;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.content}>
          <div className={styles.successIcon}>
            <Check size={48} />
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
