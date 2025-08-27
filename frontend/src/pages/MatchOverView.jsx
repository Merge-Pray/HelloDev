import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Code,
  MapPin,
  User,
  ToggleLeft,
  ToggleRight,
  Loader,
  Grid3X3,
  Circle,
} from "lucide-react";
import useUserStore from "../hooks/userstore";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import styles from "./matchoverview.module.css";

const MatchOverView = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("bubbles"); // "bubbles" or "boxes"
  const [hoveredMatch, setHoveredMatch] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchMatches();
  }, [currentUser, navigate]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authenticatedFetch("/api/match");

      if (response.success && response.matches) {
        // Alle Matches anzeigen, nicht nur pending
        setMatches(response.matches);
      } else {
        setMatches([]);
        if (!response.success) {
          setError(response.message || "Failed to fetch matches");
        }
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchClick = (match) => {
    // Navigiere zu einzelner Match-Ansicht oder Profil
    if (match.status === "pending") {
      navigate("/matches"); // Zur MatchPage für pending matches
    } else {
      navigate(`/profile/${match.user._id}`); // Zum Profil für andere
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#fbbf24"; // gelb
      case "contacted":
        return "#60a5fa"; // blau
      case "connected":
        return "#34d399"; // grün
      case "dismissed":
        return "#f87171"; // rot
      default:
        return "#9ca3af"; // grau
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case "excellent":
        return "#10b981";
      case "good":
        return "#3b82f6";
      case "fair":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  };

  const calculateSize = (compatibilityScore) => {
    // Größe basierend auf Kompatibilität (40px bis 120px)
    const minSize = 60;
    const maxSize = 140;
    return minSize + (compatibilityScore / 100) * (maxSize - minSize);
  };

  const renderMatch = (match, index) => {
    const size = calculateSize(match.compatibilityScore);
    const isHovered = hoveredMatch === match.matchId;

    const baseClasses =
      viewMode === "bubbles"
        ? `${styles.bubble} ${isHovered ? styles.hovered : ""}`
        : `${styles.box} ${isHovered ? styles.hovered : ""}`;

    return (
      <div
        key={match.matchId}
        className={baseClasses}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderColor: getStatusColor(match.status),
          backgroundColor: `${getQualityColor(match.quality)}20`,
          animationDelay: `${index * 0.1}s`,
        }}
        onMouseEnter={() => setHoveredMatch(match.matchId)}
        onMouseLeave={() => setHoveredMatch(null)}
        onClick={() => handleMatchClick(match)}
      >
        {/* Avatar */}
        <div className={styles.matchAvatar}>
          {match.user?.avatar ? (
            <img
              src={match.user.avatar}
              alt={`${match.user.nickname || match.user.username}'s avatar`}
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

        {/* Kompatibilitäts-Score */}
        <div className={styles.compatibilityBadge}>
          <span className={styles.scoreText}>{match.compatibilityScore}%</span>
        </div>

        {/* Name (nur bei hover oder größeren Elementen) */}
        {(isHovered || size > 100) && (
          <div className={styles.matchInfo}>
            <div className={styles.matchName}>
              {match.user?.nickname || match.user?.username}
            </div>
            <div className={styles.matchStatus}>{match.status}</div>
          </div>
        )}

        {/* Tooltip bei Hover */}
        {isHovered && (
          <div className={styles.tooltip}>
            <div className={styles.tooltipContent}>
              <h4>{match.user?.nickname || match.user?.username}</h4>
              <p>@{match.user?.username}.HelloDev.social</p>
              <div className={styles.tooltipStats}>
                <span>Match: {match.compatibilityScore}%</span>
                <span>Quality: {match.quality}</span>
                <span>Type: {match.matchType}</span>
              </div>
              {match.user?.country && (
                <div className={styles.tooltipLocation}>
                  <MapPin size={12} />
                  <span>{match.user.country}</span>
                </div>
              )}
              {match.badges?.length > 0 && (
                <div className={styles.tooltipBadges}>
                  {match.badges.slice(0, 2).map((badge, idx) => (
                    <span key={idx} className={styles.tooltipBadge}>
                      {badge.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loader className={styles.spin} size={48} />
            <p>Loading your matches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div className="alert alert-error">{error}</div>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Heart
              size={48}
              style={{ color: "var(--color-primary)", marginBottom: "20px" }}
            />
            <h1 className="title">No Matches Found</h1>
            <p className="subtitle">
              We couldn't find any compatible developers yet. Check back later!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/home")}
              style={{ marginTop: "20px" }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className={styles.overviewContainer}>
        {/* Header mit View Toggle */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className="title">Your Matches</h1>
            <p className="subtitle">
              {matches.length} compatible developers found
            </p>
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${
                viewMode === "bubbles" ? styles.active : ""
              }`}
              onClick={() => setViewMode("bubbles")}
            >
              <Circle size={20} />
              <span>Bubbles</span>
            </button>
            <button
              className={`${styles.toggleButton} ${
                viewMode === "boxes" ? styles.active : ""
              }`}
              onClick={() => setViewMode("boxes")}
            >
              <Grid3X3 size={20} />
              <span>Boxes</span>
            </button>
          </div>
        </div>

        {/* Legende */}
        <div className={styles.legend}>
          <div className={styles.legendTitle}>Legend:</div>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <div
                className={styles.legendDot}
                style={{ backgroundColor: "#fbbf24" }}
              ></div>
              <span>Pending</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendDot}
                style={{ backgroundColor: "#60a5fa" }}
              ></div>
              <span>Contacted</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendDot}
                style={{ backgroundColor: "#34d399" }}
              ></div>
              <span>Connected</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendDot}
                style={{ backgroundColor: "#f87171" }}
              ></div>
              <span>Dismissed</span>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className={`${styles.matchesGrid} ${styles[viewMode]}`}>
          {matches.map((match, index) => renderMatch(match, index))}
        </div>
      </div>
    </div>
  );
};

export default MatchOverView;
