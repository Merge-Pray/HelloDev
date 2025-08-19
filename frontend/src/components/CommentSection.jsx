import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { API_URL } from "../lib/config";
import useUserStore from "../hooks/userstore";
import { useProfile } from "../hooks/useProfile";

export default function CommentSection({ postId, comments, onComment }) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const { data: profile } = useProfile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setNewComment("");
        onComment(postId, data.comment);
      } else {
        console.error("Error adding comment:", data.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const renderCommentContent = (content) => {
    let processedContent = content.replace(
      /#(\w+)/g,
      '<span class="hashtag" data-hashtag="$1">#$1</span>'
    );

    processedContent = processedContent.replace(
      /@(\w+)/g,
      '<span class="mention" data-username="$1">@$1</span>'
    );

    return { __html: processedContent };
  };

  return (
    <div className="comment-section">
      {/* Comments list */}
      <div className="comments-list">
        {comments &&
          comments.map((comment) => (
            <div key={comment._id} className="comment">
              <img
                src={comment.author.avatar || "/default-avatar.png"}
                alt={comment.author.username}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-header">
                  <strong className="comment-author">
                    {comment.author.username}
                  </strong>
                  <span className="comment-time">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p
                  className="comment-text"
                  dangerouslySetInnerHTML={renderCommentContent(
                    comment.content
                  )}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <img
          src={profile?.avatar || "/default-avatar.png"}
          alt="Your avatar"
          className="comment-form-avatar"
        />
        <div className="comment-input-container">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            maxLength={500}
            className="comment-input"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="comment-submit"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
