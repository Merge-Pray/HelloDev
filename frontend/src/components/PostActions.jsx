import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Repeat, Share2 } from "lucide-react";
import RepostModal from "./RepostModal";
import { API_URL } from "../lib/config";

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

  // Simple check if current user liked this post
  const checkIfLiked = () => {
    if (!post?.likes || !currentUser?._id) return false;

    return post.likes.some((like) => {
      const likeUserId = like.user?._id || like.user;
      return likeUserId === currentUser._id || likeUserId === currentUser.userID;
    });
  };

  const [isLiked, setIsLiked] = useState(checkIfLiked());

  // Update when post or user changes
  useEffect(() => {
    setIsLiked(checkIfLiked());
  }, [post?.likes, currentUser?._id]);

  const handleLike = async () => {
    if (isProcessing || !currentUser?._id) return;

    setIsProcessing(true);
    const wasLiked = isLiked;
    
    // Optimistic update
    setIsLiked(!wasLiked);

    try {
      const endpoint = wasLiked ? "unlike" : "like";
      const response = await fetch(
        `${API_URL}/api/posts/${post._id}/${endpoint}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update parent component with the actual like count from server
        onLike(post._id, !wasLiked, data.likeCount);
      } else {
        // Revert optimistic update on failure
        setIsLiked(wasLiked);
        console.error("Like operation failed:", data.message);
      }
    } catch (error) {
      // Revert optimistic update on error
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
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const isOwnPost = post?.author?._id === currentUser?._id;
  const likeCount = post?.likeCount || post?.likes?.length || 0;

  return (
    <div
      className="post-actions"
      style={{
        display: "flex",
        gap: "16px",
        padding: "12px 0",
      }}
    >
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={isProcessing}
        style={{
          background: "none",
          border: "none",
          cursor: isProcessing ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          opacity: isProcessing ? 0.6 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <Heart
          size={20}
          fill={isLiked ? "#dc2626" : "none"}
          color={isLiked ? "#dc2626" : "#64748b"}
          style={{
            transition: "all 0.2s ease",
          }}
        />
        <span style={{ 
          color: isLiked ? "#dc2626" : "#64748b",
          fontWeight: isLiked ? "600" : "normal",
          transition: "all 0.2s ease",
        }}>
          {likeCount}
        </span>
      </button>

      {/* Comment Button */}
      <button
        onClick={onToggleComments}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "#64748b",
        }}
      >
        <MessageCircle size={20} />
        <span>{post?.commentCount || post?.comments?.length || 0}</span>
      </button>

      {/* Repost Button */}
      <button
        onClick={() => setShowRepostModal(true)}
        disabled={isOwnPost}
        style={{
          background: "none",
          border: "none",
          cursor: isOwnPost ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: isReposted ? "#059669" : "#64748b",
          opacity: isOwnPost ? 0.5 : 1,
        }}
      >
        <Repeat size={20} />
        <span>{post?.repostCount || 0}</span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64748b",
        }}
      >
        <Share2 size={20} />
      </button>

      {/* Repost Modal */}
      {showRepostModal && (
        <RepostModal
          post={post}
          onRepost={handleRepost}
          onClose={() => setShowRepostModal(false)}
        />
      )}
    </div>
  );
}
