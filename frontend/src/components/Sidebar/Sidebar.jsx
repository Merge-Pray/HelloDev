import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Search, X } from "lucide-react";
import { authenticatedFetch } from "../../utils/authenticatedFetch";
import useUserStore from "../../hooks/userstore";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchContacts();
    }
  }, [currentUser]);

  // Filter contacts when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) => {
        const username = contact.username?.toLowerCase() || "";
        const nickname = contact.nickname?.toLowerCase() || "";
        const query = searchQuery.toLowerCase().trim();

        return username.includes(query) || nickname.includes(query);
      });
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authenticatedFetch("/api/user/contacts");

      if (response.success) {
        const contactsData = response.contacts || [];
        setContacts(contactsData);
        setFilteredContacts(contactsData);
      } else {
        setError("Failed to load contacts");
        setContacts([]);
        setFilteredContacts([]);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts");
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactClick = (contactId) => {
    navigate(`/chat/${contactId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getLastSeenText = (lastSeen, isOnline) => {
    // If user is online, don't show lastSeen
    if (isOnline) return "Online";

    if (!lastSeen) return "Recently";

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return "Long time ago";
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

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

  const renderContact = (contact) => (
    <div
      key={contact.id}
      className={styles.contactItem}
      onClick={() => handleContactClick(contact.id)}
    >
      <div className={styles.contactAvatar}>
        {contact?.avatar ? (
          <img
            src={contact.avatar}
            alt={`${contact.nickname || contact.username}'s avatar`}
            className={styles.avatarImage}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        ) : (
          <img
            src="/default-avatar.png"
            alt="Default avatar"
            className={styles.avatarImage}
          />
        )}
      </div>

      <div className={styles.contactInfo}>
        <div className={styles.contactName}>
          {highlightMatch(contact.nickname || contact.username, searchQuery)}
        </div>
        <div className={styles.contactHandle}>
          @{highlightMatch(contact.username, searchQuery)}.HelloDev.social
        </div>
        <div className={styles.contactStatus}>
          {/* Only show lastSeen text if not online */}
          {!contact.isOnline &&
            getLastSeenText(contact.lastSeen, contact.isOnline)}
          {contact.isOnline && (
            <>
              <span>Online</span>
              <span className={styles.onlineDot} aria-label="Online" />
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading contacts...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.error}>
          <span>{error}</span>
          <button className={styles.retryButton} onClick={fetchContacts}>
            Retry
          </button>
        </div>
      );
    }

    if (contacts.length === 0) {
      return (
        <div className={styles.emptyState}>
          <User size={32} className={styles.emptyIcon} />
          <p>No contacts yet</p>
          <p className={styles.emptySubtext}>
            Start matching with developers to build your network!
          </p>
        </div>
      );
    }

    if (searchQuery.trim() && filteredContacts.length === 0) {
      return (
        <div className={styles.noResults}>
          <Search size={32} className={styles.noResultsIcon} />
          <p>No contacts found</p>
          <p className={styles.noResultsSubtext}>
            Try searching for a different username or nickname
          </p>
        </div>
      );
    }

    return filteredContacts.map(renderContact);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <div className={styles.title}>
          Your Contacts
          {!isLoading && (
            <span className={styles.contactCount}>
              ({searchQuery ? filteredContacts.length : contacts.length})
            </span>
          )}
        </div>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className={styles.clearButton}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.contactsList}>{renderSearchResults()}</div>
      </div>
    </div>
  );
}
