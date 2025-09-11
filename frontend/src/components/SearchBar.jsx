import React, { useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ onSearch, onClear, isActive, query, onFilterClick, filtersOpen }) {
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

        {/* Filter-Button nur mobil anzeigen */}
        <button
          type="button"
          className={styles.filterToggleBtn}
          onClick={onFilterClick}
          aria-label={filtersOpen ? "Filter ausblenden" : "Filter anzeigen"}
        >
          <span className={styles.filterIcon} aria-hidden="true">
            {/* Simple Filter SVG */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          {/* <span className={styles.filterText}>{filtersOpen ? "" : ""}</span> */}
        </button>

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

  {/* Clear-Button entfernt, da bei Search Results vorhanden */}
      </form>
    </div>
  );
}