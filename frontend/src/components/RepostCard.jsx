import React from "react";
import { Repeat } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PostCard from "./PostCard";
import styles from "./PostCard.module.css";

export default function RepostCard({ repost, onLike, onComment, onRepost }) {
  if (!repost || !repost.author) {
    console.error("RepostCard received invalid repost data:", repost);
    return (
      <div className={`${styles.postCard} ${styles.error}`}>
        <p>Error: Repost data is incomplete</p>
      </div>
    );
  }

  if (!repost.originalPost) {
    console.error("RepostCard missing originalPost:", repost);
    return (
      <div className={`${styles.postCard} ${styles.error}`}>
        <p>Error: Original post data is missing</p>
      </div>
    );
  }

  return (
    <article className={styles.postCard} data-post-id={repost._id}>
      {/* Repost header */}
      <div className="repost-header">
        <Repeat size={16} color="var(--color-text-secondary)" />
        <img
          src={repost.author?.avatar || "/avatars/default_avatar.png"}
          alt={
            repost.author?.nickname || repost.author?.username || "Unknown User"
          }
          className="repost-author-avatar"
        />
        <span className="repost-info">
          <strong>
            {repost.author?.nickname ||
              repost.author?.username ||
              "Unknown User"}
          </strong>{" "}
          reposted
        </span>
        <time className="repost-time">
          {formatDistanceToNow(new Date(repost.createdAt), { addSuffix: true })}
        </time>
      </div>

      {/* Repost comment if any */}
      {repost.repostComment && (
        <div className="repost-comment">
          <p>{repost.repostComment}</p>
        </div>
      )}

      {/* Original post content */}
      <div className="original-post">
        {repost.originalPost && repost.originalPost.author ? (
          <PostCard
            post={repost.originalPost}
            onLike={null}
            onComment={null}
            onRepost={null}
            isEmbedded={true}
            hideInteractions={true}
          />
        ) : (
          <div className={`${styles.postCard} ${styles.error}`}>
            <p>Original post unavailable</p>
          </div>
        )}
      </div>
    </article>
  );
}
