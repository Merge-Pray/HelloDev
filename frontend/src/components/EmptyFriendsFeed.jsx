import React from "react";
import { Users, Search, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import styles from "./emptyfriendsfeed.module.css";

export default function EmptyFriendsFeed({ friendsCount }) {
  const navigate = useNavigate();

  return (
    <div className={styles.emptyFriendsFeed}>
      <div className={styles.emptyIcon}>
        <Users size={48} />
      </div>

      {friendsCount === 0 ? (
        <>
          <h3>No friends yet!</h3>
          <p>Connect with other developers to see their posts here.</p>
          <div className={styles.emptyActions}>
            <button
              onClick={() => navigate("/search")}
              className={styles.primaryBtn}
            >
              <Search size={16} />
              Find Developers
            </button>
            <button
              onClick={() => navigate("/matchoverview")}
              className={styles.secondaryBtn}
            >
              <UserPlus size={16} />
              Discover Matches
            </button>
          </div>
        </>
      ) : (
        <>
          <p>Your friends haven't posted anything yet.</p>
          <p>Encourage them to share their developer journey!</p>
          <div className={styles.emptyActions}>
            <button
              onClick={() => navigate("/search")}
              className={styles.primaryBtn}
            >
              <Search size={16} />
              Find More Developers
            </button>
            <button
              onClick={() => navigate("/matchoverview")}
              className={styles.secondaryBtn}
            >
              <UserPlus size={16} />
              Discover Matches
            </button>
          </div>
        </>
      )}
    </div>
  );
}
