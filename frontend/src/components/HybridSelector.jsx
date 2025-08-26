import React, { useState, useEffect } from "react";
import { API_URL } from "../lib/config";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import "./HybridSelector.css";

function HybridSelector({
  category,
  selectedValues = [],
  onSelectionChange,
  placeholder = "Search for more options...",
  maxSelections = null,
  allowMultiple = true,
  showButtons = true,
  showSkillLevel = false,
}) {
  const [popularOptions, setPopularOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  useEffect(() => {
    if (showButtons) {
      fetchPopularOptions();
    }
  }, [category, showButtons]);

  useEffect(() => {
    if (searchInput.length >= 2) {
      const timeoutId = setTimeout(searchOptions, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setSelectedSuggestionIndex(-1);
    }
  }, [searchInput]);

  const fetchPopularOptions = async () => {
    try {
      const data = await authenticatedFetch(
        `/api/suggestions/popular/${category}`
      );
      if (data.suggestions) {
        setPopularOptions(data.suggestions);
      }
    } catch (error) {
      console.error("Failed to fetch popular options:", error);
    }
  };

  const searchOptions = async () => {
    setIsLoading(true);

    try {
      const data = await authenticatedFetch(
        `/api/suggestions/search/${category}?q=${encodeURIComponent(
          searchInput
        )}`
      );
      if (data.suggestions && data.suggestions.length > 0) {
        setSearchResults(data.suggestions);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to search options:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelection = (value) => {
    if (!allowMultiple) {
      onSelectionChange([value]);
      return;
    }

    if (showSkillLevel) {
      const existingIndex = selectedValues.findIndex((item) =>
        Array.isArray(item) ? item[0] === value : item === value
      );

      if (existingIndex !== -1) {
        onSelectionChange(
          selectedValues.filter((_, index) => index !== existingIndex)
        );
      } else {
        if (!maxSelections || selectedValues.length < maxSelections) {
          onSelectionChange([...selectedValues, [value, 5]]);
        }
      }
    } else {
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter((v) => v !== value));
      } else {
        if (!maxSelections || selectedValues.length < maxSelections) {
          onSelectionChange([...selectedValues, value]);
        }
      }
    }
  };

  const handleCustomAdd = (valueToAdd = null) => {
    const value = valueToAdd || searchInput.trim();
    if (value) {
      if (showSkillLevel) {
        const existingIndex = selectedValues.findIndex((item) =>
          Array.isArray(item) ? item[0] === value : item === value
        );

        if (existingIndex === -1) {
          if (!maxSelections || selectedValues.length < maxSelections) {
            onSelectionChange([...selectedValues, [value, 5]]);
          }
        }
      } else {
        if (!allowMultiple) {
          onSelectionChange([value]);
        } else {
          if (!selectedValues.includes(value)) {
            if (!maxSelections || selectedValues.length < maxSelections) {
              onSelectionChange([...selectedValues, value]);
            }
          }
        }
      }
      setSearchInput("");
      setSearchResults([]);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        selectedSuggestionIndex >= 0 &&
        searchResults[selectedSuggestionIndex]
      ) {
        handleCustomAdd(searchResults[selectedSuggestionIndex].value);
      } else {
        handleCustomAdd();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : -1));
    }
  };

  return (
    <div className="hybrid-selector">
      {showButtons && popularOptions.length > 0 && (
        <div className="popular-options">
          <div className="button-grid">
            {popularOptions.map((option) => {
              const isSelected = showSkillLevel
                ? selectedValues.some((item) =>
                    Array.isArray(item)
                      ? item[0] === option.value
                      : item === option.value
                  )
                : selectedValues.includes(option.value);

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`option-button ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelection(option.value)}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="search-section">
        <div className="search-input-container">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a custom option..."
            className="search-input"
            autoComplete="off"
          />

          {isLoading && <div className="loading">Searching...</div>}

          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  className={`search-result ${
                    index === selectedSuggestionIndex ? "highlighted" : ""
                  }`}
                  onClick={() => handleCustomAdd(result.value)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  {result.value}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleCustomAdd()}
            className="add-custom-btn"
            disabled={!searchInput.trim()}
          >
            + Add{searchInput.trim() ? ` "${searchInput}"` : ""}
          </button>
        </div>
      </div>

      {selectedValues.length > 0 && (
        <div className="selected-values">
          {allowMultiple ? (
            <div className="selected-tags">
              {selectedValues.map((value, index) => {
                if (showSkillLevel && Array.isArray(value)) {
                  const [language, skillLevel] = value;
                  return (
                    <div key={index} className="selected-skill-item">
                      <div className="skill-header">
                        <span className="skill-language">{language}</span>
                        <button
                          type="button"
                          onClick={() => handleSelection(language)}
                          className="remove-tag"
                        >
                          ×
                        </button>
                      </div>
                      <div className="skill-slider-container">
                        <span className="skill-level-label">
                          Skill Level: {skillLevel}/10
                        </span>
                        <div className="slider-wrapper">
                          <span className="slider-min">1</span>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={skillLevel}
                            className="skill-slider"
                            onChange={(e) => {
                              const newLevel = parseInt(e.target.value);
                              const updatedValues = selectedValues.map(
                                (item, i) =>
                                  i === index ? [language, newLevel] : item
                              );
                              onSelectionChange(updatedValues);
                            }}
                          />
                          <span className="slider-max">10</span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const displayValue = Array.isArray(value) ? value[0] : value;
                  return (
                    <span key={index} className="selected-tag">
                      {displayValue}
                      <button
                        type="button"
                        onClick={() => handleSelection(displayValue)}
                        className="remove-tag"
                      >
                        ×
                      </button>
                    </span>
                  );
                }
              })}
            </div>
          ) : (
            <div className="selected-single">
              <span className="selected-value">{selectedValues[0]}</span>
              <button
                type="button"
                onClick={() => onSelectionChange([])}
                className="clear-selection"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HybridSelector;
