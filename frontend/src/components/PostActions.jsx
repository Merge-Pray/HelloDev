import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Repeat, Share2 } from "lucide-react";
import RepostModal from "./RepostModal";
import { API_URL } from "../lib/config";
import styles from "./PostActions.module.css";

export default function PostActions({
  post,
  currentUser,
  onLike,
  onRepost,
  onToggleComments,
}) {
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkIfLiked = () => {
    if (!post?.likes || !currentUser?._id) return false;
    return post.likes.some((like) => {
      const likeUserId = like.user?._id || like.user;
      return likeUserId === currentUser._id;
    });
  };

  const [isLiked, setIsLiked] = useState(checkIfLiked());

  useEffect(() => {
    setIsLiked(checkIfLiked());
  }, [post?.likes, currentUser?._id]);

  const handleLike = async () => {
    if (isProcessing || !currentUser?._id) return;

    setIsProcessing(true);
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);

    try {
      const endpoint = wasLiked ? "unlike" : "like";
      const response = await fetch(
        `${API_URL}/api/posts/${post._id}/${endpoint}`,
        { method: "POST", credentials: "include" }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        onLike(post._id, !wasLiked, data.likeCount);
      } else {
        setIsLiked(wasLiked);
        console.error("Like operation failed:", data.message);
      }
    } catch (error) {
      setIsLiked(wasLiked);
      console.error("Error toggling like:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepost = async (comment = "") => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${post._id}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment }),
      });

      const data = await response.json();
      if (data.success) {
        setIsReposted(true);
        setShowRepostModal(false);
        onRepost(data.repost);
      }
    } catch (error) {
      console.error("Error reposting:", error);
    }
  };

  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(postUrl);
      // Optional: Toast/Hint einbauen
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const isOwnPost = post?.author?._id === currentUser?._id;
  const likeCount = post?.likeCount || post?.likes?.length || 0;
  const commentCount = post?.commentCount || post?.comments?.length || 0;
  const repostCount = post?.repostCount || 0;

  return (
    <>
      <div className={styles.actions} role="toolbar" aria-label="Post actions">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          disabled={isProcessing}
          aria-pressed={isLiked}
          className={[
            styles.actionBtn,
            styles.like,
            isLiked ? styles.active : "",
            isProcessing ? styles.isProcessing : "",
          ].join(" ")}
        >
          <Heart
            size={20}
            className={styles.icon}
            // Lucide füllt per CSS via currentColor (siehe CSS)
          />
          <span className={styles.count}>{likeCount}</span>
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={onToggleComments}
          className={[styles.actionBtn, styles.comment].join(" ")}
          aria-label="Show comments"
        >
          <MessageCircle size={20} className={styles.icon} />
          <span className={styles.count}>{commentCount}</span>
        </button>

        {/* Repost */}
        <button
          type="button"
          onClick={() => setShowRepostModal(true)}
          disabled={isOwnPost}
          aria-pressed={isReposted}
          className={[
            styles.actionBtn,
            styles.repost,
            isReposted ? styles.active : "",
            isOwnPost ? styles.disabled : "",
          ].join(" ")}
        >
          <Repeat size={20} className={styles.icon} />
          <span className={styles.count}>{repostCount}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className={[styles.actionBtn, styles.share].join(" ")}
          aria-label="Copy post link"
        >
          <Share2 size={20} className={styles.icon} />
        </button>
      </div>

      {showRepostModal && (
        <RepostModal
          post={post}
          onRepost={handleRepost}
          onClose={() => setShowRepostModal(false)}
        />
      )}
    </>
  );
}