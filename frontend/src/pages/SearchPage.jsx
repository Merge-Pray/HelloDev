import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import {
  Search,
  MapPin,
  Code,
  Wrench,
  User,
  UserPlus,
  Calendar,
  X,
  Heart,
  Clock,
  ExternalLink,
  MessageCircle,
  UserCheck,
  Filter,
  ChevronDown,
} from "lucide-react";
import useUserStore from "../hooks/userstore";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import Sidebar from "../components/Sidebar/Sidebar";
import styles from "./searchpage.module.css";

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const currentUser = useUserStore((state) => state.currentUser);
  const searchInputRef = useRef(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [friendshipFilter, setFriendshipFilter] = useState("all");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState([]);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const cityDropdownRef = useRef(null);

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Developers" },
    { value: "friends", label: "Friends Only" },
    { value: "non-friends", label: "Non-Friends Only" },
  ];

  // Load available cities on component mount
  useEffect(() => {
    fetchAvailableCities();
  }, []);

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setCityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get query and filter from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryFromUrl = params.query || urlParams.get("q");
    const filterFromUrl = params.filter || urlParams.get("filter");
    const cityFromUrl = urlParams.get("city");

    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
    if (
      filterFromUrl &&
      ["all", "friends", "non-friends"].includes(filterFromUrl)
    ) {
      setFriendshipFilter(filterFromUrl);
    }
    if (cityFromUrl) {
      setSelectedCity(cityFromUrl);
    }

    if (queryFromUrl || cityFromUrl) {
      performSearch(
        queryFromUrl || "",
        filterFromUrl || "all",
        cityFromUrl || ""
      );
    }
  }, [params.query, params.filter, location.search]);

  // Debounced search on input change - FIXED
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || selectedCity) {
        performSearch(searchQuery, friendshipFilter, selectedCity);
      } else {
        setSearchResults([]);
        setHasSearched(false);
        setTotalCount(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, friendshipFilter, selectedCity]);

  const fetchAvailableCities = async () => {
    try {
      const response = await authenticatedFetch("/api/search/cities?limit=50");
      if (response.success) {
        setAvailableCities(response.cities || []);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const performSearch = async (
    query = searchQuery,
    filter = friendshipFilter,
    city = selectedCity
  ) => {
    // Allow search with either query OR city (or both)
    if (!query.trim() && !city) {
      setSearchResults([]);
      setHasSearched(false);
      setTotalCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchParams = new URLSearchParams();

      // Add query parameter if provided
      if (query && query.trim()) {
        searchParams.append("q", query.trim());
      }

      // Add city parameter if provided
      if (city) {
        searchParams.append("city", city);
      }

      // Add friendship filter if not "all"
      if (filter && filter !== "all") {
        searchParams.append("friendshipFilter", filter);
      }

      console.log("Search params:", searchParams.toString());

      const response = await authenticatedFetch(
        `/api/search/users?${searchParams.toString()}`
      );

      if (response.success) {
        setSearchResults(response.users || []);
        setTotalCount(response.users?.length || 0);

        // Update URL
        updateURL(query, filter, city);
      } else {
        setError(response.message || "Search failed");
        setSearchResults([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search users. Please try again.");
      setSearchResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const updateURL = (query, filter, city) => {
    const searchParams = new URLSearchParams();

    if (filter !== "all") {
      searchParams.append("filter", filter);
    }
    if (city) {
      searchParams.append("city", city);
    }

    let path = "/search";
    if (query?.trim()) {
      path += `/${encodeURIComponent(query.trim())}`;
    }

    const finalPath = searchParams.toString()
      ? `${path}?${searchParams.toString()}`
      : path;

    navigate(finalPath, { replace: true });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setTotalCount(0);
    setFriendshipFilter("all");
    setSelectedCity("");
    navigate("/search", { replace: true });
  };

  const handleFilterChange = (newFilter) => {
    setFriendshipFilter(newFilter);
    // Trigger search with current query and city
    if (searchQuery.trim() || selectedCity) {
      performSearch(searchQuery, newFilter, selectedCity);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setCityDropdownOpen(false);
    // Trigger search immediately with current query
    performSearch(searchQuery, friendshipFilter, city);
  };

  const clearCityFilter = () => {
    setSelectedCity("");
    // Continue search with current query but no city filter
    if (searchQuery.trim()) {
      performSearch(searchQuery, friendshipFilter, "");
    } else {
      // If no search query, clear all results
      setSearchResults([]);
      setHasSearched(false);
      setTotalCount(0);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      searchhelp: {
        label: "Seeking Help",
        bgColor: "rgba(245, 158, 11, 0.2)",
        borderColor: "#f59e0b",
        keywords: ["seeking help", "help"],
      },
      offerhelp: {
        label: "Offering Help",
        bgColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10b981",
        keywords: ["offering help", "offer help", "offerhelp"],
      },
      networking: {
        label: "Networking",
        bgColor: "rgba(var(--color-primary-rgb), 0.2)",
        borderColor: "var(--color-primary)",
        keywords: ["networking", "network"],
      },
      learnpartner: {
        label: "Learning Partner",
        bgColor: "rgba(139, 92, 246, 0.2)",
        borderColor: "#8b5cf6",
        keywords: [
          "learning partner",
          "learn partner",
          "partner",
          "learningpartner",
        ],
      },
    };

    return (
      statusMap[status] || {
        label: status,
        bgColor: "var(--color-bg-secondary)",
        borderColor: "var(--color-border)",
        keywords: [],
      }
    );
  };

  const formatDevExperience = (experience) => {
    if (!experience) return "";
    return (
      experience.charAt(0).toUpperCase() + experience.slice(1).toLowerCase()
    );
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className={styles.highlight}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getLastSeenText = (lastSeen, isOnline) => {
    if (isOnline) return "Online now";
    if (!lastSeen) return "";

    const now = new Date();
    const last = new Date(lastSeen);
    const diffMs = now - last;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleSendMessage = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const handleSendFriendRequest = async (userId, event) => {
    event.stopPropagation();
    try {
      console.log(`Sending friend request to user ${userId}`);
      alert("Friend request functionality will be implemented soon!");
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const renderUserCard = (user) => {
    const displayName = user.nickname || user.username;
    const location = [user.city, user.country].filter(Boolean).join(", ");
    const statusInfo = getStatusBadge(user.status);
    const lastSeenText = getLastSeenText(user.lastSeen, user.isOnline);

    return (
      <div key={user._id} className={styles.userCard}>
        <div className={styles.userAvatar}>
          <img
            src={user.avatar || "/avatars/default_avatar.png"}
            alt={`${displayName}'s avatar`}
            className={styles.avatarImage}
            onError={(e) => {
              e.target.src = "/avatars/default_avatar.png";
            }}
          />
        </div>

        <div className={styles.userInfo}>
          <div className={styles.userHeader}>
            <div className={styles.userName}>
              {highlightMatch(displayName, searchQuery)}
            </div>
            <div className={styles.userHandle}>
              @{highlightMatch(user.username, searchQuery)}.HelloDev.social
            </div>
          </div>

          <div className={styles.userMeta}>
            <div
              className={styles.statusBadge}
              style={{
                backgroundColor: statusInfo.bgColor,
                borderColor: statusInfo.borderColor,
              }}
            >
              {highlightMatch(statusInfo.label, searchQuery)}
            </div>

            {location && (
              <div className={styles.metaItem}>
                <MapPin size={14} />
                <span>{highlightMatch(location, searchQuery)}</span>
              </div>
            )}

            {user.age && (
              <div className={styles.metaItem}>
                <Calendar size={14} />
                <span>{user.age} years old</span>
              </div>
            )}

            {user.devExperience && (
              <div className={styles.metaItem}>
                <User size={14} />
                <span>
                  {highlightMatch(
                    formatDevExperience(user.devExperience),
                    searchQuery
                  )}
                </span>
              </div>
            )}

            {lastSeenText && (
              <div className={styles.metaItem}>
                <Clock size={14} />
                <span>{lastSeenText}</span>
              </div>
            )}
          </div>

          {user.aboutMe && (
            <div className={styles.userBio}>
              {highlightMatch(user.aboutMe.substring(0, 120), searchQuery)}
              {user.aboutMe.length > 120 && "..."}
            </div>
          )}

          <div className={styles.userSkills}>
            {user.programmingLanguages?.slice(0, 3).map((lang, index) => {
              const langName = Array.isArray(lang) ? lang[0] : lang;
              return (
                <div key={index} className={styles.skillTag}>
                  <Code size={12} />
                  <span>{highlightMatch(langName, searchQuery)}</span>
                </div>
              );
            })}

            {user.techStack?.slice(0, 2).map((tech, index) => (
              <div key={index} className={styles.skillTag}>
                <Wrench size={12} />
                <span>{highlightMatch(tech, searchQuery)}</span>
              </div>
            ))}

            {user.techArea?.slice(0, 2).map((area, index) => (
              <div key={index} className={styles.skillTag}>
                <Heart size={12} />
                <span>{highlightMatch(area, searchQuery)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.userActions}>
          {/* Friendship Status - Wird zuerst angezeigt */}
          <div className={styles.friendshipStatus}>
            {user.isContact ? (
              <div className={styles.friendBadge}>
                <UserCheck size={16} />
                <span>Friends</span>
              </div>
            ) : (
              <div className={styles.nonFriendStatus}>
                <User size={16} />
                <span>Not connected</span>
              </div>
            )}
          </div>

          {/* Action Buttons - Werden darunter angezeigt */}
          <div className={styles.actionButtons}>
            <button
              className={styles.viewProfileBtn}
              onClick={() => handleProfileClick(user._id)}
              title="View Profile"
            >
              <ExternalLink size={16} />
              View Profile
            </button>

            {user.isContact ? (
              <button
                className={styles.messageBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendMessage(user._id);
                }}
                title="Send Message"
              >
                <MessageCircle size={16} />
                Message
              </button>
            ) : (
              <button
                className={styles.friendRequestBtn}
                onClick={(e) => handleSendFriendRequest(user._id, e)}
                title="Send Friend Request"
              >
                <UserPlus size={16} />
                Add Friend
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getActiveFiltersText = () => {
    const filters = [];
    if (selectedCity) {
      filters.push(`in ${selectedCity}`);
    }
    if (friendshipFilter !== "all") {
      const filterLabel = filterOptions.find(
        (f) => f.value === friendshipFilter
      )?.label;
      filters.push(filterLabel);
    }
    return filters.length > 0 ? ` (${filters.join(", ")})` : "";
  };

  return (
    <div className={styles.page}>
      <main className={styles.center}>
        <div className={styles.searchContainer}>
          {/* Search Header */}
          <div className={styles.searchHeader}>
            <h1 className="title">Search Developers</h1>
            <p className="subtitle">
              Find developers by skills, location, status, or interests
            </p>
          </div>

          {/* Search Controls */}
          <div className={styles.searchControls}>
            {/* Main Search Bar */}
            <div className={styles.searchBar}>
              <div className={styles.searchInputContainer}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={
                    selectedCity
                      ? `Search developers in ${selectedCity}...`
                      : "Search by name, skills, status (e.g. JavaScript, React, Seeking Help)..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {(searchQuery || selectedCity) && (
                  <button
                    className={styles.clearSearchBtn}
                    onClick={clearSearch}
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* City Filter Dropdown */}
            <div className={styles.cityFilter} ref={cityDropdownRef}>
              <div
                className={styles.cityDropdownWrapper}
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              >
                <MapPin size={16} className={styles.cityIcon} />
                <span className={styles.cityLabel}>
                  {selectedCity || "All Cities"}
                </span>
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${
                    cityDropdownOpen ? styles.chevronUp : ""
                  }`}
                />

                {selectedCity && (
                  <button
                    className={styles.clearCityBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearCityFilter();
                    }}
                    title="Clear city filter"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {cityDropdownOpen && (
                <div className={styles.cityDropdown}>
                  <div
                    className={`${styles.cityOption} ${
                      !selectedCity ? styles.active : ""
                    }`}
                    onClick={() => handleCityChange("")}
                  >
                    <MapPin size={14} />
                    <span>All Cities</span>
                  </div>

                  {availableCities.map((cityData) => (
                    <div
                      key={cityData.city}
                      className={`${styles.cityOption} ${
                        selectedCity === cityData.city ? styles.active : ""
                      }`}
                      onClick={() => handleCityChange(cityData.city)}
                    >
                      <MapPin size={14} />
                      <div className={styles.cityInfo}>
                        <span className={styles.cityName}>{cityData.city}</span>
                        <span className={styles.cityCount}>
                          {cityData.userCount} developer
                          {cityData.userCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            <div className={styles.filterIcon}>
              <Filter size={16} />
            </div>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                className={`${styles.filterTab} ${
                  friendshipFilter === option.value ? styles.active : ""
                }`}
                onClick={() => handleFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div className={styles.searchResults}>
            {hasSearched && (
              <div className={styles.resultsHeader}>
                <h3>
                  {isLoading
                    ? "Searching..."
                    : `${totalCount} developer${
                        totalCount !== 1 ? "s" : ""
                      } found`}
                  {searchQuery && ` for "${searchQuery}"`}
                  {getActiveFiltersText()}
                </h3>
                {(searchQuery || selectedCity) && (
                  <button className={styles.clearAllBtn} onClick={clearSearch}>
                    Clear Search
                  </button>
                )}
              </div>
            )}

            {isLoading && (
              <div className={styles.loading}>
                <div className="loading-spinner"></div>
                <p>Searching developers...</p>
              </div>
            )}

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => performSearch()}
                >
                  Try Again
                </button>
              </div>
            )}

            {!isLoading &&
              !error &&
              hasSearched &&
              searchResults.length === 0 && (
                <div className={styles.emptyResults}>
                  <Search size={48} className={styles.emptyIcon} />
                  <h3>No developers found</h3>
                  <p>
                    {selectedCity && searchQuery
                      ? `No developers found in ${selectedCity} matching "${searchQuery}". Try different search terms or select a different city.`
                      : selectedCity
                      ? `No developers found in ${selectedCity}. Try selecting a different city.`
                      : searchQuery
                      ? `No developers found matching "${searchQuery}". Try different search terms.`
                      : "Try entering search terms or selecting a city."}
                  </p>
                </div>
              )}

            {!hasSearched && (
              <div className={styles.welcomeState}>
                <Search size={48} className={styles.welcomeIcon} />
                <h3>Discover Developers</h3>
                <p>
                  Search by name, programming languages, location, status, or
                  any other criteria. You can also filter by city.
                </p>
                <div className={styles.searchExamples}>
                  <h4>Try searching for:</h4>
                  <div className={styles.exampleTags}>
                    <button onClick={() => setSearchQuery("JavaScript")}>
                      JavaScript
                    </button>
                    <button onClick={() => setSearchQuery("React")}>
                      React
                    </button>
                    <button onClick={() => setSearchQuery("Python")}>
                      Python
                    </button>
                    <button onClick={() => setSearchQuery("Berlin")}>
                      Berlin
                    </button>
                    <button onClick={() => setSearchQuery("Seeking Help")}>
                      Seeking Help
                    </button>
                    <button onClick={() => setSearchQuery("Learning Partner")}>
                      Learning Partner
                    </button>
                    <button onClick={() => setSearchQuery("Networking")}>
                      Networking
                    </button>
                    <button onClick={() => setSearchQuery("Offering Help")}>
                      Offering Help
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.usersList}>
              {searchResults.map(renderUserCard)}
            </div>
          </div>
        </div>
      </main>

      <aside className={styles.right}>
        <Sidebar />
      </aside>
    </div>
  );
};

export default SearchPage;
