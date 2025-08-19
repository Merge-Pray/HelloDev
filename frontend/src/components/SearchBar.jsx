import React, { useState } from 'react';

export default function SearchBar({ onSearch, onClear, isActive, query }) {
  const [searchInput, setSearchInput] = useState(query || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleClear = () => {
    setSearchInput('');
    onClear();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search posts..."
        />
        <button type="submit">Search</button>
        {isActive && (
          <button type="button" onClick={handleClear}>
            Clear
          </button>
        )}
      </form>
    </div>
  );
}