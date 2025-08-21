import React, { useState, useRef, useEffect } from "react";
import styles from "./PostComposer.module.css";
import {
  Image as ImageIcon,
  Smile,
  Send,
  Globe,
  Users,
  Lock,
} from "lucide-react";
import useUserStore from "../hooks/userstore";
import { API_URL } from "../lib/config";

export default function PostComposer({ onPostCreated }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const taRef = useRef(null);
  const MAX = 2000;

  const currentUser = useUserStore((state) => state.currentUser);

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

      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: payload,
          visibility: visibility === "contacts" ? "contacts_only" : visibility,
          hashtags: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        onPostCreated?.(data.post);
        setText("");
        setVisibility("public");
      } else {
        console.error("Failed to create post:", data.message);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX - text.length;
  const overLimit = remaining < 0;

  return (
    <section className={styles.composer} aria-label="Create post">
      <header className={styles.header}>
        <img
          className={styles.avatar}
          src={currentUser?.avatar || "/default-avatar.png"}
          alt={currentUser?.username || "User"}
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

        {/* Sichtbarkeit + Tools + Submit */}
        <div className={styles.toolbar}>
          {/* Sichtbarkeit */}
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

          {/* Zeile 2: Tools + Submit */}
          <div className={styles.bottomRow}>
            <div className={styles.toolsLeft}>
              <button
                type="button"
                className={styles.toolBtn}
                disabled={submitting}
              >
                <ImageIcon size={18} aria-hidden="true" />
                <span className={styles.toolLabel}>Image</span>
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                disabled={submitting}
              >
                <Smile size={18} aria-hidden="true" />
                <span className={styles.toolLabel}>Emoji</span>
              </button>
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
                disabled={!text.trim() || overLimit || submitting}
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
