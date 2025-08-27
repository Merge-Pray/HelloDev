import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Heart,
  Code,
  MapPin,
  User,
  Award,
  Zap,
  Target,
  Wrench,
  Globe,
  Loader,
  GitBranch,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useUserStore from "../hooks/userstore";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import styles from "./matchpage.module.css";
import PopUpMatch from "../components/PopUpMatch";

const MatchPage = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConnectedPopup, setShowConnectedPopup] = useState(false);
  const [connectedMatchData, setConnectedMatchData] = useState(null);

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

      console.log("🔄 Fetching matches...");

      const response = await authenticatedFetch("/api/match");

      console.log("📡 Response received:", response);

      if (response.success && response.matches) {
        console.log("✅ All matches found:", response.matches.length);

        setMatches(response.matches);

        // Filter nur pending Matches die noch nicht kontaktiert wurden
        const pendingOnly = response.matches.filter((match) => {
          const isPending = match.status === "pending";
          const hasNotContacted = !match.hasUserContacted;

          console.log(`Match ${match.matchId}:`, {
            status: match.status,
            hasUserContacted: match.hasUserContacted,
            canContact: match.canContact,
            willShow: isPending && hasNotContacted,
          });

          return isPending && hasNotContacted;
        });

        console.log("📋 Pending matches to show:", pendingOnly.length);

        setPendingMatches(pendingOnly);
        setCurrentMatchIndex(0);
      } else {
        console.log("❌ No matches in response");
        setMatches([]);
        setPendingMatches([]);
        if (!response.success) {
          setError(response.message || "Failed to fetch matches");
        }
      }
    } catch (err) {
      console.error("❌ Error fetching matches:", err);
      setError("Failed to load matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeMatchFromPending = (matchId) => {
    const updatedPending = pendingMatches.filter(
      (match) => match.matchId !== matchId
    );
    setPendingMatches(updatedPending);

    // Adjust index if necessary
    if (
      currentMatchIndex >= updatedPending.length &&
      updatedPending.length > 0
    ) {
      setCurrentMatchIndex(updatedPending.length - 1);
    } else if (updatedPending.length === 0) {
      setCurrentMatchIndex(0);
    }
  };

  const handleGitAdd = async () => {
    const currentMatch = pendingMatches[currentMatchIndex];
    if (!currentMatch || isActionLoading) return;

    try {
      setIsActionLoading(true);

      console.log("🤝 Contacting match (git add):", currentMatch.matchId);

      const response = await authenticatedFetch(
        `/api/match/${currentMatch.matchId}/contact`,
        {
          method: "POST",
        }
      );

      console.log("📡 Contact response:", response);

      if (response.success) {
        console.log("✅ Successfully contacted match");

        // Check if this resulted in a connection (both users contacted each other)
        if (response.match?.status === "connected") {
          console.log("🎉 Connection established!");
          setConnectedMatchData({
            user: currentMatch.user,
            matchId: currentMatch.matchId,
            connectedAt: response.match.connectedAt,
          });
          setShowConnectedPopup(true);
        } else {
          // Show success message for contact only
          alert(response.message || "Successfully contacted match!");
        }

        // Remove from pending matches
        removeMatchFromPending(currentMatch.matchId);
      }
    } catch (err) {
      console.error("❌ Error contacting match:", err);
      setError("Failed to contact match. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendMessage = (userId) => {
    // Navigate to message/chat page
    navigate(`/messages/${userId}`);
  };

  const handleCloseConnectedPopup = () => {
    setShowConnectedPopup(false);
    setConnectedMatchData(null);
  };

  const handleCancel = async () => {
    const currentMatch = pendingMatches[currentMatchIndex];
    if (!currentMatch || isActionLoading) return;

    try {
      setIsActionLoading(true);

      console.log("❌ Dismissing match (cancel):", currentMatch.matchId);

      const response = await authenticatedFetch(
        `/api/match/${currentMatch.matchId}/dismiss`,
        {
          method: "POST",
        }
      );

      console.log("📡 Dismiss response:", response);

      if (response.success) {
        console.log("✅ Successfully dismissed match");

        // Remove from pending matches
        removeMatchFromPending(currentMatch.matchId);

        // Show success message
        console.log("Match dismissed");
      }
    } catch (err) {
      console.error("❌ Error dismissing match:", err);
      setError("Failed to dismiss match. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const goToNextMatch = () => {
    if (currentMatchIndex < pendingMatches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    }
  };

  const goToPreviousMatch = () => {
    if (currentMatchIndex > 0) {
      setCurrentMatchIndex(currentMatchIndex - 1);
    }
  };

  const getMatchTypeBadgeClass = (matchType) => {
    switch (matchType) {
      case "mentor-mentee":
        return styles.matchTypeMentor;
      case "learnpartner":
        return styles.matchTypeLearn;
      default:
        return styles.matchTypeNetwork;
    }
  };

  const getExperienceIcon = (experience) => {
    switch (experience) {
      case "beginner":
        return <Zap size={16} />;
      case "intermediate":
        return <Target size={16} />;
      case "expert":
        return <Award size={16} />;
      default:
        return <User size={16} />;
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      searchhelp: "Seeking Help",
      offerhelp: "Offering Help",
      networking: "Networking",
      learnpartner: "Learning Partner",
    };
    return statusMap[status] || status || "Developer";
  };

  const renderSkillTags = (data, icon, limit = 3) => {
    if (!data?.length) return null;

    const displayData = data.slice(0, limit);
    const hasMore = data.length > limit;

    return (
      <div className={styles.skillTags}>
        {displayData.map((item, index) => {
          let displayName = item;
          let skillLevel = null;

          // Handle programming languages with skill levels
          if (Array.isArray(item)) {
            displayName = item[0];
            skillLevel = item[1];
          }

          return (
            <div key={index} className={styles.skillTag}>
              {icon}
              <span>{displayName}</span>
              {skillLevel && (
                <span className={styles.skillLevel}>({skillLevel}/10)</span>
              )}
            </div>
          );
        })}
        {hasMore && (
          <div className={styles.skillTag}>
            <span>+{data.length - limit} more</span>
          </div>
        )}
      </div>
    );
  };

  const renderBadges = (badges) => {
    if (!badges?.length) return null;

    return (
      <div className={styles.badges}>
        {badges.slice(0, 2).map((badge, index) => (
          <span key={index} className={styles.badge}>
            {badge.replace(/-/g, " ")}
          </span>
        ))}
        {badges.length > 2 && (
          <span className={styles.badge}>+{badges.length - 2} more</span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loading-spinner"></div>
            <p>Finding your perfect matches...</p>
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

  if (pendingMatches.length === 0) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Heart
              size={48}
              style={{
                color: "var(--color-primary, #667eea)",
                marginBottom: "20px",
              }}
            />
            <h1 className="title">No New Matches</h1>
            <p className="subtitle">
              {matches.length > 0
                ? "You've seen all your matches! Check back later for new ones."
                : "We couldn't find any compatible developers right now. Check back later!"}
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

  const currentMatch = pendingMatches[currentMatchIndex];
  const user = currentMatch?.user;

  return (
    <div className="page">
      <div className={styles.matchContainer}>
        <div className={styles.header}>
          <h1 className="title">Find Your Coding Matches</h1>
        </div>

        <div className={styles.matchCard}>
          {/* Navigation Arrows */}
          {pendingMatches.length > 1 && (
            <>
              <button
                className={`${styles.navButton} ${styles.navLeft}`}
                onClick={goToPreviousMatch}
                disabled={currentMatchIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                className={`${styles.navButton} ${styles.navRight}`}
                onClick={goToNextMatch}
                disabled={currentMatchIndex === pendingMatches.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Match Content */}
          <div className={styles.matchContent}>
            {/* Profile Header */}
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.nickname || user.username}'s avatar`}
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

              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>
                  {user?.nickname || user?.username}
                </h2>
                <span className={styles.handle}>
                  @{user?.username}.HelloDev.social
                </span>
                <p className={styles.status}>{getStatusLabel(user?.status)}</p>
              </div>
            </div>
            {/* Profile Details */}
            <div className={styles.profileDetails}>
              {/* About Me */}
              {user?.aboutMe && (
                <div className={styles.aboutSection}>
                  <p className={styles.aboutText}>{user.aboutMe}</p>
                </div>
              )}

              {/* Basic Info */}
              <div className={styles.infoGrid}>
                {user?.country && (
                  <div className={styles.infoItem}>
                    <MapPin size={16} />
                    <span>{user.country}</span>
                  </div>
                )}

                {user?.languages?.length > 0 && (
                  <div className={styles.infoItem}>
                    <Globe size={16} />
                    <span>Speaks {user.languages.slice(0, 2).join(", ")}</span>
                  </div>
                )}

                {user?.preferredOS && (
                  <div className={styles.infoItem}>
                    <User size={16} />
                    <span>{user.preferredOS}</span>
                  </div>
                )}
              </div>

              {/* Skills Sections */}
              <div className={styles.skillsSection}>
                {user?.programmingLanguages?.length > 0 && (
                  <div className={styles.skillCategory}>
                    <h4>Programming Languages</h4>
                    {renderSkillTags(
                      user.programmingLanguages,
                      <Code size={14} />
                    )}
                  </div>
                )}

                {user?.techStack?.length > 0 && (
                  <div className={styles.skillCategory}>
                    <h4>Tech Stack</h4>
                    {renderSkillTags(user.techStack, <Wrench size={14} />)}
                  </div>
                )}

                {user?.techArea?.length > 0 && (
                  <div className={styles.skillCategory}>
                    <h4>Tech Interests</h4>
                    {renderSkillTags(user.techArea, <Heart size={14} />)}
                  </div>
                )}
              </div>

              {/* Match Badges */}
              {renderBadges(currentMatch.badges)}
            </div>
            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                className={`${styles.actionButton} ${styles.cancelButton}`}
                onClick={handleCancel}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <Loader size={20} className={styles.spin} />
                ) : (
                  <X size={20} />
                )}
                <span>Cancel</span>
              </button>

              <button
                className={`${styles.actionButton} ${styles.gitAddButton}`}
                onClick={handleGitAdd}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <Loader size={20} className={styles.spin} />
                ) : (
                  <GitBranch size={20} />
                )}
                <span>git add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Match Connected Popup */}
      <PopUpMatch
        isOpen={showConnectedPopup}
        onClose={handleCloseConnectedPopup}
        matchData={connectedMatchData}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default MatchPage;
