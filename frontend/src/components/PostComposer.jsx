import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import GifPicker from "gif-picker-react";
import styles from "./PostComposer.module.css";
import { FileImage, Smile, Send, Globe, Users, Lock } from "lucide-react";
import useUserStore from "../hooks/userstore";
import { authenticatedFetch } from "../utils/authenticatedFetch";

export default function PostComposer({ onPostCreated }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const taRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);
  const MAX = 2000;

  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [text]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        gifPickerRef.current &&
        !gifPickerRef.current.contains(event.target)
      ) {
        setShowGifPicker(false);
      }
    };

    if (showEmojiPicker || showGifPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker, showGifPicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = text.trim();
    if ((!payload && !selectedGif) || submitting) return;

    try {
      setSubmitting(true);

      const requestBody = {
        content: payload || "",
        visibility: visibility === "contacts" ? "contacts_only" : visibility,
        hashtags: [],
        imageUrl: selectedGif || null,
      };

      const data = await authenticatedFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (data.success) {
        onPostCreated?.(data.post);
        setText("");
        setVisibility("public");
        setSelectedGif(null);
      } else {
        console.error("Failed to create post:", data.message);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = taRef.current;
    const cursorPosition = textarea.selectionStart;

    const textBefore = text.substring(0, cursorPosition);
    const textAfter = text.substring(cursorPosition);
    const newText = textBefore + emoji + textAfter;

    setText(newText);
    setShowEmojiPicker(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        cursorPosition + emoji.length,
        cursorPosition + emoji.length
      );
    }, 0);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (showGifPicker) setShowGifPicker(false);
  };

  const handleGifClick = (gif) => {
    setSelectedGif(gif.url);
    setShowGifPicker(false);
  };

  const toggleGifPicker = () => {
    setShowGifPicker(!showGifPicker);
    if (showEmojiPicker) setShowEmojiPicker(false);
  };

  const removeSelectedGif = () => {
    setSelectedGif(null);
  };

  const remaining = MAX - text.length;
  const overLimit = remaining < 0;
  const hasContent = text.trim() || selectedGif;

  return (
    <section className={styles.composer} aria-label="Create post">
      <header className={styles.header}>
        <img
          className={styles.avatar}
          src={currentUser?.avatar || "/default-avatar.png"}
          alt={currentUser?.nickname || currentUser?.username || "User"}
          aria-hidden="true"
        />
        <h3 className={styles.title}>Share something</h3>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          ref={taRef}
          className={styles.input}
          placeholder="Hey Nerd 👋 What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          maxLength={MAX + 100}
          aria-label="Post text"
          disabled={submitting}
        />

        {selectedGif && (
          <div className={styles.gifPreview}>
            <img
              src={selectedGif}
              alt="Selected GIF"
              className={styles.gifImage}
            />
            <button
              type="button"
              className={styles.removeGif}
              onClick={removeSelectedGif}
              aria-label="Remove GIF"
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.toolbar}>
          <div
            className={styles.visibilityGroup}
            role="radiogroup"
            aria-label="Post visibility"
          >
            <button
              type="button"
              role="radio"
              aria-checked={visibility === "public"}
              className={`${styles.visBtn} ${
                visibility === "public" ? styles.active : ""
              }`}
              onClick={() => setVisibility("public")}
              disabled={submitting}
            >
              <Globe size={16} aria-hidden="true" />
              <span className={styles.visLabel}>Public</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={visibility === "contacts"}
              className={`${styles.visBtn} ${
                visibility === "contacts" ? styles.active : ""
              }`}
              onClick={() => setVisibility("contacts")}
              disabled={submitting}
            >
              <Users size={16} aria-hidden="true" />
              <span className={styles.visLabel}>Contacts</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={visibility === "private"}
              className={`${styles.visBtn} ${
                visibility === "private" ? styles.active : ""
              }`}
              onClick={() => setVisibility("private")}
              disabled={submitting}
            >
              <Lock size={16} aria-hidden="true" />
              <span className={styles.visLabel}>Private</span>
            </button>
          </div>

          <div className={styles.bottomRow}>
            <div className={styles.toolsLeft}>
              <div className={styles.gifContainer} ref={gifPickerRef}>
                <button
                  type="button"
                  className={`${styles.toolBtn} ${
                    showGifPicker ? styles.active : ""
                  }`}
                  onClick={toggleGifPicker}
                  disabled={submitting}
                  aria-label="Add GIF"
                >
                  <FileImage size={18} aria-hidden="true" />
                  <span className={styles.toolLabel}>GIF</span>
                </button>
                {showGifPicker && (
                  <div className={styles.gifPicker}>
                    <GifPicker
                      tenorApiKey={import.meta.env.VITE_TENOR_API_KEY}
                      onGifClick={handleGifClick}
                      width={350}
                      height={400}
                    />
                  </div>
                )}
              </div>
              <div className={styles.emojiContainer} ref={emojiPickerRef}>
                <button
                  type="button"
                  className={`${styles.toolBtn} ${
                    showEmojiPicker ? styles.active : ""
                  }`}
                  onClick={toggleEmojiPicker}
                  disabled={submitting}
                  aria-label="Add emoji"
                >
                  <Smile size={18} aria-hidden="true" />
                  <span className={styles.toolLabel}>Emoji</span>
                </button>
                {showEmojiPicker && (
                  <div className={styles.emojiPicker}>
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={300}
                      height={400}
                      previewConfig={{
                        showPreview: false,
                      }}
                      skinTonesDisabled
                      searchDisabled={false}
                    />
                  </div>
                )}
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
                disabled={!hasContent || overLimit || submitting}
              >
                <Send size={18} aria-hidden="true" />
                <span>{submitting ? "Posting..." : "Post"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
