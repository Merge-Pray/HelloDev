import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  MapPin,
  Calendar,
  Globe,
  Code,
  Heart,
  Monitor,
  Gamepad2,
  Coffee,
  Music,
  Tv,
  Clock,
  User,
  Award,
  Zap,
  Target,
  Wrench,
  Lock,
  ArrowLeft,
  MessageCircle,
  UserPlus,
  UserMinus,
  Loader,
  ChevronDown,
  UserCheck,
  X,
  Briefcase,
  ExternalLink,
  Linkedin,
  Github,
} from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { authenticatedFetch } from "../../utils/authenticatedFetch";
import styles from "./getprofilepage.module.css";

export default function GetProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isContact, setIsContact] = useState(false);
  const [contactActionLoading, setContactActionLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      navigate("/profile");
      return;
    }

    if (userId === currentUser._id) {
      navigate("/profile");
      return;
    }

    fetchProfile();
  }, [currentUser, userId, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowAvatarModal(false);
      }
    };

    if (showAvatarModal) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "auto";
    };
  }, [showAvatarModal]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await authenticatedFetch(`/api/user/profile/${userId}`);

      if (data.isOwnProfile) {
        console.log("Backend says it's own profile, redirecting...");
        navigate("/profile");
        return;
      }

      setProfileData(data.user);
      setIsContact(data.isContact);
    } catch (err) {
      console.error("Error fetching profile:", err);

      if (err.message.includes("401")) {
        navigate("/login");
        return;
      }
      if (err.message.includes("404")) {
        setError("User not found");
        return;
      }
      setError("Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    navigate(`/chat?userId=${userId}&username=${profileData.username}`);
  };

  const handleSendFriendRequest = async () => {
    try {
      setContactActionLoading(true);

      // Simuliere API-Aufruf mit Delay (placeholder)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`Would send friend request to user ${userId}`);
      // TODO: Hier wird später die echte API-Anfrage implementiert

      // Placeholder: Nach erfolgreichem Senden der Anfrage könnte man den Status ändern
      // setIsContact(true); // Nur wenn die Anfrage sofort akzeptiert wird
    } catch (err) {
      console.error("Error sending friend request:", err);
      setError("Failed to send friend request");
    } finally {
      setContactActionLoading(false);
    }
  };

  const handleRemoveContact = async () => {
    try {
      setContactActionLoading(true);
      setShowDropdown(false);

      // Simuliere API-Aufruf mit Delay (placeholder)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`Would remove contact ${userId}`);
      // TODO: Hier wird später die echte API-Anfrage implementiert

      // Placeholder: Nach erfolgreichem Entfernen den Status ändern
      setIsContact(false);
    } catch (err) {
      console.error("Error removing contact:", err);
      setError("Failed to remove contact");
    } finally {
      setContactActionLoading(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleCloseAvatarModal = () => {
    setShowAvatarModal(false);
  };

  const renderActionButtons = () => {
    if (contactActionLoading) {
      return (
        <div className={styles.actionButtons}>
          <button className={`btn btn-primary ${styles.actionButton}`} disabled>
            <Loader size={16} className={styles.spin} />
            <span>Loading...</span>
          </button>
        </div>
      );
    }

    if (isContact) {
      return (
        <div className={styles.actionButtons}>
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              className={`btn btn-secondary ${styles.actionButton} ${styles.friendButton}`}
              onClick={toggleDropdown}
            >
              <UserCheck size={16} />
              <span>Friend</span>
              <ChevronDown size={14} className={styles.chevronIcon} />
            </button>

            {showDropdown && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownItem}
                  onClick={handleRemoveContact}
                >
                  <UserMinus size={16} />
                  <span>Remove Friend</span>
                </button>
              </div>
            )}
          </div>
          <button
            className={`btn btn-primary ${styles.actionButton}`}
            onClick={handleSendMessage}
          >
            <MessageCircle size={16} />
            <span>Send Message</span>
          </button>
        </div>
      );
    }

    return (
      <div className={styles.actionButtons}>
        <button
          className={`btn btn-primary ${styles.actionButton}`}
          onClick={handleSendFriendRequest}
        >
          <UserPlus size={16} />
          <span>Send Friend Request</span>
        </button>
      </div>
    );
  };

  const hasData = (data) => {
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object" && data !== null) {
      return Object.values(data).some(
        (value) => value !== null && value !== undefined && value !== ""
      );
    }
    return data !== null && data !== undefined && data !== "";
  };

  const renderPersonalInfo = () => {
    if (!isContact) return null;

    const hasPersonalInfo = () => {
      return (
        profileData.country ||
        profileData.city ||
        profileData.age ||
        hasData(profileData.languages)
      );
    };

    if (!hasPersonalInfo()) return null;

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <User size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Personal Information</h3>
          </div>
        </div>
        <div className={styles.infoGrid}>
          {(profileData.country || profileData.city) && (
            <div className={styles.infoItem}>
              <MapPin size={18} className={styles.infoIcon} />
              <span>
                {[profileData.city, profileData.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {profileData.age && (
            <div className={styles.infoItem}>
              <Calendar size={18} className={styles.infoIcon} />
              <span>{profileData.age} years old</span>
            </div>
          )}
          {hasData(profileData.languages) && (
            <div className={styles.infoItem}>
              <Globe size={18} className={styles.infoIcon} />
              <span>Speaks {profileData.languages.slice(0, 3).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAboutMe = () => {
    return (
      <div className={`card enhanced ${styles.aboutSection}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>About</h3>
          </div>
        </div>
        <div className={styles.aboutContent}>
          {profileData.aboutMe ? (
            <p className={styles.aboutText}>{profileData.aboutMe}</p>
          ) : (
            <div className={styles.emptyState}>
              <span>No description available</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFavouriteLineOfCode = () => {
    return (
      <div className={`card enhanced ${styles.aboutSection}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <Code size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Favourite Line of Code</h3>
          </div>
        </div>
        <div className={styles.aboutContent}>
          {profileData.favoriteLineOfCode ? (
            <pre className={styles.codeBlock}>
              <code>{profileData.favoriteLineOfCode}</code>
            </pre>
          ) : (
            <div className={styles.emptyState}>
              <span>No favourite line of code available</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSkillSection = (title, data, emptyText) => {
    if (!hasData(data)) return null;

    const getSkillLevelInfo = (numericLevel) => {
      if (!numericLevel || numericLevel < 1 || numericLevel > 10) {
        return null;
      }

      if (numericLevel >= 1 && numericLevel <= 3) {
        return {
          className: "skillLevelBeginner",
          label: `Beginner (${numericLevel}/10)`,
        };
      } else if (numericLevel >= 4 && numericLevel <= 7) {
        return {
          className: "skillLevelIntermediate",
          label: `Intermediate (${numericLevel}/10)`,
        };
      } else if (numericLevel >= 8 && numericLevel <= 10) {
        return {
          className: "skillLevelAdvanced",
          label: `Advanced (${numericLevel}/10)`,
        };
      }

      return null;
    };

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>{title}</h3>
          </div>
        </div>

        <div className={styles.skillsGrid}>
          {data.map((item, index) => {
            if (title === "Programming Languages") {
              let skillName = item;
              let numericLevel = null;

              if (Array.isArray(item)) {
                skillName = item[0];
                numericLevel = item[1];
              } else if (typeof item === "object" && item.name) {
                skillName = item.name;
                numericLevel = item.level;
              }

              const skillInfo = getSkillLevelInfo(numericLevel);

              return (
                <div
                  key={index}
                  className={`${styles.skillTag} ${
                    skillInfo ? styles.programmingLanguageTag : ""
                  }`}
                >
                  <Code size={14} className={styles.skillIcon} />
                  <span className={styles.skillName}>{skillName}</span>
                  {skillInfo && (
                    <>
                      <span
                        className={`${styles.skillLevel} ${
                          styles[skillInfo.className]
                        }`}
                      ></span>
                      <div className={styles.skillLevelTooltip}>
                        {skillInfo.label}
                      </div>
                    </>
                  )}
                </div>
              );
            }

            if (title === "Tech Stack & Tools") {
              return (
                <div key={index} className={styles.skillTag}>
                  <Wrench size={14} className={styles.skillIcon} />
                  <span className={styles.skillName}>{item}</span>
                </div>
              );
            }

            if (title === "Tech Interests" || title === "Other Interests") {
              return (
                <div key={index} className={styles.skillTag}>
                  <Heart size={14} className={styles.skillIcon} />
                  <span className={styles.skillName}>{item}</span>
                </div>
              );
            }

            return (
              <div key={index} className={styles.skillTag}>
                <span className={styles.skillName}>{item}</span>
              </div>
            );
          })}
        </div>

        {title === "Programming Languages" &&
          data.some((item) => {
            if (Array.isArray(item)) return item[1] != null;
            if (typeof item === "object" && item.level) return true;
            return false;
          })}
      </div>
    );
  };

  const renderExperienceLevel = () => {
    const level = profileData.devExperience;
    if (!level) return null;

    const getLevelStyle = () => {
      if (level.includes("beginner")) return styles.levelBeginner;
      if (level.includes("intermediate")) return styles.levelIntermediate;
      if (level.includes("expert")) return styles.levelExpert;
      return styles.levelBeginner;
    };

    const getLevelIcon = () => {
      if (level.includes("beginner")) return <Zap size={18} />;
      if (level.includes("intermediate")) return <Target size={18} />;
      if (level.includes("expert")) return <Award size={18} />;
      return <Zap size={18} />;
    };

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Experience Level</h3>
          </div>
        </div>
        <div className={styles.experienceBadge}>
          <div className={`${styles.levelBadge} ${getLevelStyle()}`}>
            {getLevelIcon()}
            <span className={styles.levelText}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderCodingPreferences = () => {
    if (!isContact) return null;

    const hasCodingPreferences = () => {
      return (
        profileData.favoriteDrinkWhileCoding ||
        profileData.musicGenreWhileCoding ||
        profileData.favoriteShowMovie ||
        profileData.favoriteTimeToCode ||
        profileData.preferredOS
      );
    };

    if (!hasCodingPreferences()) return null;

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Coding Preferences</h3>
          </div>
        </div>
        <div className={styles.preferencesGrid}>
          {profileData.favoriteDrinkWhileCoding && (
            <div className={styles.prefItem}>
              <Coffee size={18} className={styles.prefIcon} />
              <div>
                <div className={styles.prefLabel}>Favorite Drink</div>
                <div className={styles.prefValue}>
                  {profileData.favoriteDrinkWhileCoding}
                </div>
              </div>
            </div>
          )}
          {profileData.musicGenreWhileCoding && (
            <div className={styles.prefItem}>
              <Music size={18} className={styles.prefIcon} />
              <div>
                <div className={styles.prefLabel}>Music Genre</div>
                <div className={styles.prefValue}>
                  {profileData.musicGenreWhileCoding}
                </div>
              </div>
            </div>
          )}
          {profileData.favoriteShowMovie && (
            <div className={styles.prefItem}>
              <Tv size={18} className={styles.prefIcon} />
              <div>
                <div className={styles.prefLabel}>Favorite Show</div>
                <div className={styles.prefValue}>
                  {profileData.favoriteShowMovie}
                </div>
              </div>
            </div>
          )}
          {profileData.favoriteTimeToCode && (
            <div className={styles.prefItem}>
              <Clock size={18} className={styles.prefIcon} />
              <div>
                <div className={styles.prefLabel}>Coding Time</div>
                <div className={styles.prefValue}>
                  {profileData.favoriteTimeToCode.charAt(0).toUpperCase() +
                    profileData.favoriteTimeToCode.slice(1)}
                </div>
              </div>
            </div>
          )}
          {profileData.preferredOS && (
            <div className={styles.prefItem}>
              <Monitor size={18} className={styles.prefIcon} />
              <div>
                <div className={styles.prefLabel}>Preferred OS</div>
                <div className={styles.prefValue}>
                  {profileData.preferredOS}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfessionalLinks = () => {
    // Einfache Logik: Links nur anzeigen wenn Links sichtbar UND befreundet
    const canSeeLinks = profileData.profileLinksVisibleToContacts && isContact;

    const hasLinkedIn =
      profileData.linkedinProfile && profileData.linkedinProfile.trim() !== "";
    const hasGitHub =
      profileData.githubProfile && profileData.githubProfile.trim() !== "";
    const hasWebsites =
      profileData.personalWebsites &&
      profileData.personalWebsites.length > 0 &&
      profileData.personalWebsites.some((url) => url && url.trim() !== "");

    const hasAnyLinks = hasLinkedIn || hasGitHub || hasWebsites;

    // Wenn Links nicht sichtbar sein sollen oder keine Links vorhanden sind, nichts anzeigen
    if (!canSeeLinks || !hasAnyLinks) return null;

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <Briefcase size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Professional Links</h3>
          </div>
        </div>

        <div className={styles.professionalLinksContent}>
          <div className={styles.visibilityStatus}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "var(--color-text-secondary)",
              }}
            >
              <Globe size={14} />
              <span>
                Shared by {profileData.nickname || profileData.username}
              </span>
            </div>
          </div>

          <div className={styles.linksGrid}>
            {hasLinkedIn && (
              <a
                href={profileData.linkedinProfile}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkItem}
              >
                <div className={styles.linkIcon}>
                  <Linkedin size={18} style={{ color: "#0077B5" }} />
                </div>
                <div className={styles.linkContent}>
                  <div className={styles.linkLabel}>LinkedIn</div>
                  <div className={styles.linkUrl}>
                    {profileData.linkedinProfile}
                    <ExternalLink size={12} className={styles.externalIcon} />
                  </div>
                </div>
              </a>
            )}

            {hasGitHub && (
              <a
                href={profileData.githubProfile}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkItem}
              >
                <div className={styles.linkIcon}>
                  <Github size={18} />
                </div>
                <div className={styles.linkContent}>
                  <div className={styles.linkLabel}>GitHub</div>
                  <div className={styles.linkUrl}>
                    {profileData.githubProfile}
                    <ExternalLink size={12} className={styles.externalIcon} />
                  </div>
                </div>
              </a>
            )}

            {hasWebsites &&
              profileData.personalWebsites
                .filter((url) => url && url.trim() !== "")
                .map((website, index) => (
                  <a
                    key={index}
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkItem}
                  >
                    <div className={styles.linkIcon}>
                      <Globe size={18} />
                    </div>
                    <div className={styles.linkContent}>
                      <div className={styles.linkLabel}>
                        Personal Website{" "}
                        {profileData.personalWebsites.filter(
                          (url) => url && url.trim() !== ""
                        ).length > 1
                          ? `#${index + 1}`
                          : ""}
                      </div>
                      <div className={styles.linkUrl}>
                        {website}
                        <ExternalLink
                          size={12}
                          className={styles.externalIcon}
                        />
                      </div>
                    </div>
                  </a>
                ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGamingPreferences = () => {
    if (!isContact || !profileData.gaming || profileData.gaming === "none")
      return null;

    const getGamingLabel = (value) => {
      const labelMap = {
        pc: "PC Gaming",
        console: "Console Gaming",
        mobile: "Mobile Gaming",
        board: "Board Games",
        none: "No Gaming",
      };
      return labelMap[value] || value;
    };

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Gaming Preferences</h3>
          </div>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Gamepad2 size={18} className={styles.infoIcon} />
            <span>{getGamingLabel(profileData.gaming)}</span>
          </div>
        </div>
      </div>
    );
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

  if (isLoading) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
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
          <button className="btn btn-primary" onClick={() => navigate("/home")}>
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div className="alert alert-error">No profile data available</div>
          <button className="btn btn-primary" onClick={() => navigate("/home")}>
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className={styles.profileContainer}>
        {/* Back Button */}
        <div style={{ marginBottom: "20px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Profile Header */}
        <div className={`card enhanced ${styles.profileHeader}`}>
          <div
            className={styles.avatar}
            onClick={handleAvatarClick}
            style={{ cursor: "pointer" }}
            title="Click to view full size"
          >
            {profileData?.avatar ? (
              <img
                src={profileData.avatar}
                alt={`${profileData.nickname || profileData.username}'s avatar`}
                className={styles.avatarImage}
                onError={(e) => {
                  e.target.src = "/avatars/default_avatar.png";
                }}
              />
            ) : (
              <img
                src="/avatars/default_avatar.png"
                alt="Default avatar"
                className={styles.avatarImage}
              />
            )}
          </div>

          <h1 className={`title ${styles.profileName}`}>
            {profileData.nickname || profileData.username}
          </h1>
          <span className={styles.handle}>
            @{profileData.username}.HelloDev.social
          </span>

          <p className={`subtitle ${styles.profileSubtitle}`}>
            {getStatusLabel(profileData.status)}
          </p>

          {/* Action Buttons */}
          {renderActionButtons()}
        </div>

        {/* Profile Content */}
        <div className={styles.profileContent}>
          {/* About Me - Always visible */}
          {renderAboutMe()}

          {/* Favourite Line of Code - Always visible */}
          {renderFavouriteLineOfCode()}

          {/* Personal Info - Only for contacts */}
          {renderPersonalInfo()}

          {/* Experience Level - Always visible if available */}
          {renderExperienceLevel()}

          {/* Programming Languages - Always visible if available */}
          {hasData(profileData.programmingLanguages) &&
            renderSkillSection(
              "Programming Languages",
              profileData.programmingLanguages,
              "No programming languages listed"
            )}

          {/* Tech Stack - Always visible if available */}
          {hasData(profileData.techStack) &&
            renderSkillSection(
              "Tech Stack & Tools",
              profileData.techStack,
              "No tech stack listed"
            )}

          {/* Tech Interests - Always visible if available */}
          {hasData(profileData.techArea) &&
            renderSkillSection(
              "Tech Interests",
              profileData.techArea,
              "No tech interests listed"
            )}

          {/* Gaming Preferences - Only for contacts */}
          {renderGamingPreferences()}

          {/* Other Interests - Only for contacts */}
          {isContact &&
            hasData(profileData.otherInterests) &&
            renderSkillSection(
              "Other Interests",
              profileData.otherInterests,
              "No other interests listed"
            )}

          {/* Professional Links - Visible to all if enabled */}
          {renderProfessionalLinks()}

          {/* Coding Preferences - Only for contacts */}
          {renderCodingPreferences()}

          {/* Restricted Access Notice */}
          {!isContact && (
            <div className="card enhanced">
              <div className={styles.restrictedBadge}>
                <Lock size={16} />
                <span>Add as contact to see full profile</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className={styles.avatarModal} onClick={handleCloseAvatarModal}>
          <div
            className={styles.avatarModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.avatarModalClose}
              onClick={handleCloseAvatarModal}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <div className={styles.avatarModalImage}>
              <img
                src={profileData?.avatar || "/avatars/default_avatar.png"}
                alt={`${
                  profileData?.nickname || profileData?.username
                }'s avatar`}
                onError={(e) => {
                  e.target.src = "/avatars/default_avatar.png";
                }}
              />
            </div>
            <div className={styles.avatarModalInfo}>
              <h3>{profileData?.nickname || profileData?.username}</h3>
              <p>@{profileData?.username}.HelloDev.social</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
