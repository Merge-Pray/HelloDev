import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import PostActions from "./PostActions";
import CommentSection from "./CommentSection";
import RepostCard from "./RepostCard";
import useUserStore from "../hooks/userstore";
import styles from "./PostCard.module.css";

export default function PostCard({
  post,
  onLike,
  onComment,
  onRepost,
  isEmbedded = false,
}) {
  const [showComments, setShowComments] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);

  if (!post || !post.author) {
    console.error("PostCard received invalid post data:", post);
    return (
      <div className={`${styles.postCard} ${styles.error}`}>
        <p>Error: Post data is incomplete</p>
      </div>
    );
  }

  const renderContent = (content) => {
    let processed = (content || "")

      .replace(/#(\w+)/g, '<span class="hashtag" data-hashtag="$1">#$1</span>')

      .replace(
        /@(\w+)/g,
        '<span class="mention" data-username="$1">@$1</span>'
      );
    return { __html: processed };
  };

  const handleHashtagClick = (hashtag) => {
    window.location.href = `/hashtag/${hashtag}`;
  };

  const handleMentionClick = (username) => {
    window.location.href = `/user/${username}`;
  };

  const handleContentClick = (e) => {
    const t = e.target;
    if (t.classList?.contains("hashtag")) {
      const hashtag = t.dataset.hashtag;
      if (hashtag) handleHashtagClick(hashtag);
    } else if (t.classList?.contains("mention")) {
      const username = t.dataset.username;
      if (username) handleMentionClick(username);
    }
  };

  if (post.isRepost) {
    return (
      <RepostCard
        repost={post}
        onLike={onLike}
        onComment={onComment}
        onRepost={onRepost}
      />
    );
  }

  const cardClass = [styles.postCard, isEmbedded ? styles.isEmbedded : ""].join(
    " "
  );

  return (
    <article className={cardClass} data-post-id={post._id}>
      <header className={styles.header}>
        <img
          src={post.author?.avatar || "/default-avatar.png"}
          alt={post.author?.nickname || post.author?.username || "Unknown User"}
          className={styles.avatar}
          loading="lazy"
          decoding="async"
        />

        <div className={styles.authorInfo}>
          <div className={styles.nameRow}>
            {/* Anzeigename, z. B. voller Name */}
            <span className={styles.displayName}>
              {post.author?.nickname || post.author?.username}
            </span>

            {/* Username / Handle */}
            <span className={styles.handle}>
              @{post.author?.username}.HelloDev.social
            </span>
          </div>

          <div className={styles.meta}>
            <time
              className={styles.time}
              dateTime={new Date(post.createdAt).toISOString()}
              title={new Date(post.createdAt).toLocaleString()}
            >
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </time>
            {post.author?.isOnline && (
              <span className={styles.onlineDot} aria-label="Online" />
            )}
          </div>
        </div>

        {post.visibility !== "public" && (
          <span className={styles.visibilityBadge} title={post.visibility}>
            {post.visibility === "contacts_only" ? "Friends" : "Private"}
          </span>
        )}
      </header>

      {post.content && (
        <div className={styles.content} onClick={handleContentClick}>
          <p dangerouslySetInnerHTML={renderContent(post.content)} />
        </div>
      )}

      {post.imageUrl && (
        <div className={styles.mediaContainer}>
          <img
            src={post.imageUrl}
            alt="Post media"
            className={styles.mediaImage}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
        <div className={styles.hashtags}>
          {post.hashtags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={styles.hashtagPill}
              onClick={() => handleHashtagClick(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <PostActions
        post={post}
        currentUser={currentUser}
        onLike={onLike}
        onRepost={onRepost}
        onToggleComments={() => setShowComments((v) => !v)}
      />

      {showComments && (
        <CommentSection
          postId={post._id}
          comments={post.comments}
          onComment={onComment}
        />
      )}
    </article>
  );
}
