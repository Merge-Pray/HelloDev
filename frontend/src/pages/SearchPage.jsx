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
  const [friendshipFilter, setFriendshipFilter] = useState("all"); // "all", "friends", "non-friends"

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Developers" },
    { value: "friends", label: "Friends Only" },
    { value: "non-friends", label: "Non-Friends Only" },
  ];

  // Get query and filter from URL params or search params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryFromUrl = params.query || urlParams.get("q");
    const filterFromUrl = params.filter || urlParams.get("filter");

    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
    if (
      filterFromUrl &&
      ["all", "friends", "non-friends"].includes(filterFromUrl)
    ) {
      setFriendshipFilter(filterFromUrl);
    }

    if (queryFromUrl) {
      performSearch(queryFromUrl, filterFromUrl || "all");
    }
  }, [params.query, params.filter, location.search]);

  // Debounced search on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, friendshipFilter);
      } else {
        setSearchResults([]);
        setHasSearched(false);
        setTotalCount(0);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery, friendshipFilter]);

  const performSearch = async (
    query = searchQuery,
    filter = friendshipFilter
  ) => {
    if (!query.trim()) {
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
      searchParams.append("q", query.trim());

      // Add friendship filter to the request
      if (filter !== "all") {
        searchParams.append("friendshipFilter", filter);
      }

      const response = await authenticatedFetch(
        `/api/search/users?${searchParams.toString()}`
      );

      console.log("Search response:", response);

      if (response.success) {
        let filteredResults = response.users || [];

        // Client-side filtering as fallback (if backend doesn't support it yet)
        if (filter === "friends") {
          filteredResults = filteredResults.filter((user) => user.isContact);
        } else if (filter === "non-friends") {
          filteredResults = filteredResults.filter((user) => !user.isContact);
        }

        setSearchResults(filteredResults);
        setTotalCount(filteredResults.length);

        // Update URL using navigate with proper route structure
        const searchPath = `/search/${encodeURIComponent(query.trim())}`;
        const searchParams = new URLSearchParams();
        if (filter !== "all") {
          searchParams.append("filter", filter);
        }

        const finalPath = searchParams.toString()
          ? `${searchPath}?${searchParams.toString()}`
          : searchPath;

        navigate(finalPath, { replace: true });
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

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setTotalCount(0);
    setFriendshipFilter("all");

    // Navigate back to base search route
    navigate("/search", { replace: true });
  };

  const handleFilterChange = (newFilter) => {
    setFriendshipFilter(newFilter);
    if (searchQuery.trim()) {
      performSearch(searchQuery, newFilter);
    }
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

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
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

  const formatDevExperience = (experience) => {
    if (!experience) return "";
    return (
      experience.charAt(0).toUpperCase() + experience.slice(1).toLowerCase()
    );
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
          <button
            className={styles.viewProfileBtn}
            onClick={() => handleProfileClick(user._id)}
            title="View Profile"
          >
            <ExternalLink size={16} />
            View Profile
          </button>

          {/* Conditional button based on friendship status */}
          {user.isContact ? (
            <div className={styles.contactStatus}>
              <div className={styles.friendBadge}>
                <UserCheck size={16} />
                <span>Friends</span>
              </div>
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
            </div>
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
    );
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

          {/* Simple Search Bar */}
          <div className={styles.searchBar}>
            <div className={styles.searchInputContainer}>
              <Search size={20} className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, city, skills, status (e.g. JavaScript, Berlin, Seeking Help)..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className={styles.searchInput}
              />
              {searchQuery && (
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
                  {friendshipFilter !== "all" && (
                    <span className={styles.filterIndicator}>
                      {" "}
                      (
                      {
                        filterOptions.find((f) => f.value === friendshipFilter)
                          ?.label
                      }
                      )
                    </span>
                  )}
                </h3>
                {searchQuery && (
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
                    {friendshipFilter === "friends"
                      ? "No friends match your search criteria. Try different search terms or browse all developers."
                      : friendshipFilter === "non-friends"
                      ? "No non-friends match your search criteria. Try different search terms."
                      : "Try different search terms or check your spelling"}
                  </p>
                </div>
              )}

            {!hasSearched && (
              <div className={styles.welcomeState}>
                <Search size={48} className={styles.welcomeIcon} />
                <h3>Discover Developers</h3>
                <p>
                  Search by name, programming languages, location, status, or
                  any other criteria
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
