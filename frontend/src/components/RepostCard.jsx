import React from "react";
import { Repeat } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PostCard from "./PostCard";

export default function RepostCard({ repost, onLike, onComment, onRepost }) {
  // Add safety checks
  if (!repost || !repost.author) {
    console.error("RepostCard received invalid repost data:", repost);
    return (
      <div className="repost-card error">
        <p>Error: Repost data is incomplete</p>
      </div>
    );
  }

  if (!repost.originalPost) {
    console.error("RepostCard missing originalPost:", repost);
    return (
      <div className="repost-card error">
        <p>Error: Original post data is missing</p>
      </div>
    );
  }

  return (
    <div className="repost-card">
      {/* Repost header */}
      <div className="repost-header">
        <Repeat size={16} />
        <img
          src={repost.author?.avatar || "/default-avatar.png"}
          alt={repost.author?.username || "Unknown User"}
          className="repost-author-avatar"
        />
        <span className="repost-info">
          <strong>{repost.author?.username || "Unknown User"}</strong> reposted
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

      {/* Original post content - add safety check */}
      <div className="original-post">
        {repost.originalPost && repost.originalPost.author ? (
          <PostCard
            post={repost.originalPost}
            onLike={onLike}
            onComment={onComment}
            onRepost={onRepost}
            isEmbedded={true}
          />
        ) : (
          <div className="error-message">
            <p>Original post unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
}
