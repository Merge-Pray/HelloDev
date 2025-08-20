import React, { useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ onSearch, onClear, isActive, query }) {
  const [searchInput, setSearchInput] = useState(query || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleClear = () => {
    setSearchInput("");
    onClear?.();
  };

  const onKeyDown = (e) => {
    // UX: ESC leert das Feld, falls aktiv/gefüllt
    if (e.key === "Escape") {
      if (searchInput) {
        e.preventDefault();
        handleClear();
      }
    }
  };

  return (
    <div
      className={styles.wrapper}
      data-active={isActive ? "true" : "false"}
    >
      <form className={styles.form} onSubmit={handleSubmit} role="search">
        {/* Accessible Label (visually hidden) */}
        <label htmlFor="searchInput" className={styles.srOnly}>
          Search posts
        </label>

        <input
          id="searchInput"
          type="text"
          className={styles.input}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search posts..."
          aria-label="Search posts"
          autoComplete="off"
        />

        <button
          type="submit"
          className={`${styles.button} ${styles.searchButton}`}
          disabled={!searchInput.trim()}
          aria-label="Search"
          title="Search"
        >
          {/* Optional: Icon-Slot, falls du eins setzen willst */}
          {/* <span className={styles.icon} aria-hidden="true">🔍</span> */}
          Search
        </button>

        {isActive && (
          <button
            type="button"
            className={`${styles.button} ${styles.clearButton}`}
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear"
          >
            {/* <span className={styles.icon} aria-hidden="true">✖</span> */}
            Clear
          </button>
        )}
      </form>
    </div>
  );
}