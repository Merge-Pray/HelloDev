import React, { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import { Smile, Send } from "lucide-react";
import useUserStore from "../hooks/userstore";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import { getAvatarProps } from "../utils/avatarUtils";
import styles from "./CommentSection.module.css";

export default function CommentSection({ postId, comments, onComment }) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const MAX = 500;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [newComment]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = await authenticatedFetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

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

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;

    if (!textarea) {
      setNewComment((prev) => prev + emoji);
      setShowEmojiPicker(false);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const newText =
      currentText.slice(0, start) + emoji + currentText.slice(end);
    const newCursorPos = start + emoji.length;

    setNewComment(newText);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
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

  const remaining = MAX - newComment.length;
  const overLimit = remaining < 0;
  const hasContent = newComment.trim();

  return (
    <div className={styles.commentSection}>
      <div className={styles.commentsList}>
        {comments &&
          comments.map((comment) => (
            <div key={comment._id} className={styles.comment}>
              <div className={styles.commentAvatar}>
                <img
                  {...getAvatarProps(
                    comment.author.avatar,
                    comment.author.nickname || comment.author.username
                  )}
                  className={styles.commentAvatarImage}
                />
              </div>
              <div className={styles.commentContent}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>
                    {comment.author.nickname || comment.author.username}
                  </span>
                  <span className={styles.commentTime}>
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div
                  className={styles.commentText}
                  dangerouslySetInnerHTML={renderCommentContent(
                    comment.content
                  )}
                />
              </div>
            </div>
          ))}
      </div>

      <section className={styles.commentComposer} aria-label="Add comment">
        <header className={styles.composerHeader}>
          <img
            {...getAvatarProps(
              currentUser?.avatar,
              currentUser?.nickname || currentUser?.username || "User"
            )}
            className={styles.composerAvatar}
            aria-hidden="true"
          />
          <h4 className={styles.composerTitle}>Add a comment</h4>
        </header>

        <form className={styles.composerForm} onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className={styles.composerInput}
            placeholder="What do you think?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={1}
            maxLength={MAX + 100}
            aria-label="Comment text"
            disabled={isSubmitting}
          />

          <div className={styles.composerToolbar}>
            <div className={styles.toolsLeft}>
              <div className={styles.emojiContainer} ref={emojiPickerRef}>
                <button
                  type="button"
                  className={`${styles.toolBtn} ${
                    showEmojiPicker ? styles.active : ""
                  }`}
                  onClick={toggleEmojiPicker}
                  disabled={isSubmitting}
                  aria-label="Add emoji"
                >
                  <Smile size={18} aria-hidden="true" />
                  <span className={styles.toolLabel}>Emoji</span>
                </button>
                <div
                  className={styles.emojiPicker}
                  style={{ display: showEmojiPicker ? "block" : "none" }}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={300}
                    height={400}
                    previewConfig={{
                      showPreview: false,
                    }}
                    skinTonesDisabled
                    searchDisabled={false}
                    lazyLoadEmojis={true}
                    categoriesConfig={[
                      {
                        category: "suggested",
                        name: "Recently Used",
                      },
                      {
                        category: "smileys_people",
                        name: "Smileys & People",
                      },
                      {
                        category: "animals_nature",
                        name: "Animals & Nature",
                      },
                      {
                        category: "food_drink",
                        name: "Food & Drink",
                      },
                    ]}
                    emojiStyle="native"
                  />
                </div>
              </div>
            </div>

            <div className={styles.toolsRight}>
              <span
                className={`${styles.counter} ${
                  overLimit ? styles.counterOver : ""
                }`}
                aria-live="polite"
              >
                {remaining}
              </span>
              <button
                type="submit"
                className={styles.submit}
                disabled={!hasContent || overLimit || isSubmitting}
              >
                <Send size={18} aria-hidden="true" />
                <span>{isSubmitting ? "Posting..." : "Comment"}</span>
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
