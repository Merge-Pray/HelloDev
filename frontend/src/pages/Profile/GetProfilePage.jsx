import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  MapPin,
  Calendar,
  Globe,
  Code,
  Heart,
  Users,
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
  Eye,
  ArrowLeft,
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

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!userId) {
      navigate("/profile");
      return;
    }

    // ✅ Frontend-Check: Eigenes Profil direkt abfangen
    if (userId === currentUser._id) {
      console.log("Own profile detected, redirecting to /profile");
      navigate("/profile");
      return;
    }

    console.log("Fetching profile for userId:", userId);
    console.log("Current user ID:", currentUser._id);

    fetchProfile();
  }, [currentUser, userId, navigate]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await authenticatedFetch(`/api/user/profile/${userId}`);

      console.log("API Response:", data);

      // ✅ Zusätzlicher Backend-Check
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

  const renderSkillSection = (title, data, emptyText) => {
    if (!hasData(data)) return null;

    const getSkillLevelInfo = (numericLevel) => {
      if (!numericLevel || numericLevel < 1 || numericLevel > 10) {
        return null;
      }

      if (numericLevel >= 1 && numericLevel <= 3) {
        return { className: "skillLevelBeginner" };
      } else if (numericLevel >= 4 && numericLevel <= 7) {
        return { className: "skillLevelIntermediate" };
      } else if (numericLevel >= 8 && numericLevel <= 10) {
        return { className: "skillLevelAdvanced" };
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
                    <span
                      className={`${styles.skillLevel} ${
                        styles[skillInfo.className]
                      }`}
                    ></span>
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
          }) && (
            <div className={styles.skillLegend}>
              <div className={styles.legendTitle}>Skill Levels:</div>
              <div className={styles.legendItems}>
                <div className={styles.legendItem}>
                  <span
                    className={`${styles.legendDot} ${styles.skillLevelBeginner}`}
                  ></span>
                  <span>Beginner (1-3)</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={`${styles.legendDot} ${styles.skillLevelIntermediate}`}
                  ></span>
                  <span>Intermediate (4-7)</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={`${styles.legendDot} ${styles.skillLevelAdvanced}`}
                  ></span>
                  <span>Advanced (8-10)</span>
                </div>
              </div>
            </div>
          )}
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
          <div className={styles.avatar}>
            {profileData?.avatar ? (
              <img
                src={profileData.avatar}
                alt={`${profileData.nickname || profileData.username}'s avatar`}
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

          <h1 className={`title ${styles.profileName}`}>
            {profileData.nickname || profileData.username}
          </h1>
          <span className={styles.handle}>
            @{profileData.username}.HelloDev.social
          </span>

          <p className={`subtitle ${styles.profileSubtitle}`}>
            {getStatusLabel(profileData.status)}
          </p>

          <div className={styles.connectionStatus}>
            {isContact ? (
              <div className={styles.contactBadge}>
                <Users size={16} />
                <span>Contact</span>
              </div>
            ) : (
              <div className={styles.publicBadge}>
                <Eye size={16} />
                <span>Public Profile</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className={styles.profileContent}>
          {/* About Me - Always visible */}
          {renderAboutMe()}

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
    </div>
  );
}
