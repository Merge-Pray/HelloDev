import React, { useState, useEffect } from 'react';
import styles from '../KlipyGifPicker.module.css';

const SearchBar = ({ onSearch, placeholder = "Search GIFs..." }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(query.trim());
    }
  };

  return (
    <div className={styles.searchForm}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.searchInput}
        autoComplete="off"
      />
    </div>
  );
};

export default SearchBar;