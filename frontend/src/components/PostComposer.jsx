import React, { useState, useRef, useEffect } from "react";
import styles from "./PostComposer.module.css";
import { Image as ImageIcon, Smile, Send, Globe, Users, Lock } from "lucide-react";

export default function PostComposer({ onPostCreated }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibility, setVisibility] = useState("public"); // 'public' | 'contacts' | 'private'
  const taRef = useRef(null);
  const MAX = 2000;

  // Auto-Resize
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [text]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = text.trim();
    if (!payload || submitting) return;

    try {
      setSubmitting(true);
      // hier würdest du posten
      const newPost = {
        _id: String(Date.now()),
        text: payload,
        visibility, // <-- Sichtbarkeit mitgeben
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        comments: [],
        likes: [],
      };
      onPostCreated?.(newPost);
      setText("");
      setVisibility("public");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX - text.length;
  const overLimit = remaining < 0;

  return (
    <section className={styles.composer} aria-label="Create post">
      <header className={styles.header}>
        <img className={styles.avatar} src="/avatars/default.png" alt="" aria-hidden="true" />
        <h3 className={styles.title}>Share something</h3>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          ref={taRef}
          className={styles.input}
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          maxLength={MAX + 100}
          aria-label="Post text"
        />

        {/* Sichtbarkeit + Tools + Submit */}
       <div className={styles.toolbar}>
  {/* Zeile 1: Sichtbarkeit */}
  <div className={styles.visibilityGroup} role="radiogroup" aria-label="Post visibility">
    <button
      type="button"
      role="radio"
      aria-checked={visibility === "public"}
      className={`${styles.visBtn} ${visibility === "public" ? styles.active : ""}`}
      onClick={() => setVisibility("public")}
    >
      <Globe size={16} aria-hidden="true" />
      <span className={styles.visLabel}>Public</span>
    </button>
    <button
      type="button"
      role="radio"
      aria-checked={visibility === "contacts"}
      className={`${styles.visBtn} ${visibility === "contacts" ? styles.active : ""}`}
      onClick={() => setVisibility("contacts")}
    >
      <Users size={16} aria-hidden="true" />
      <span className={styles.visLabel}>Contacts</span>
    </button>
    <button
      type="button"
      role="radio"
      aria-checked={visibility === "private"}
      className={`${styles.visBtn} ${visibility === "private" ? styles.active : ""}`}
      onClick={() => setVisibility("private")}
    >
      <Lock size={16} aria-hidden="true" />
      <span className={styles.visLabel}>Private</span>
    </button>
  </div>

  {/* Zeile 2: Tools + Submit */}
  <div className={styles.bottomRow}>
    <div className={styles.toolsLeft}>
      <button type="button" className={styles.toolBtn}>
        <ImageIcon size={18} aria-hidden="true" />
        <span className={styles.toolLabel}>Image</span>
      </button>
      <button type="button" className={styles.toolBtn}>
        <Smile size={18} aria-hidden="true" />
        <span className={styles.toolLabel}>Emoji</span>
      </button>
    </div>

    <div className={styles.toolsRight}>
      <span
        className={`${styles.counter} ${overLimit ? styles.counterOver : ""}`}
        aria-live="polite"
      >
        {remaining}
      </span>
      <button
        type="submit"
        className={styles.submit}
        disabled={!text.trim() || overLimit || submitting}
      >
        <Send size={18} aria-hidden="true" />
        <span>Post</span>
      </button>
    </div>
  </div>
</div>
      </form>
    </section>
  );
}