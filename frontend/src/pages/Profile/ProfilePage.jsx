import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Edit3,
  MapPin,
  Calendar,
  Globe,
  Code,
  Heart,
  Users,
  Settings,
  Monitor,
  Gamepad2,
  Coffee,
  Music,
  Tv,
  Clock,
  User,
  Plus,
  Award,
  Zap,
  Target,
  Wrench,
  Briefcase,
} from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { useProfile } from "../../hooks/useProfile";
import DarkMode from "../../components/DarkMode";
import styles from "./profilepage.module.css";
import { API_URL } from "../../lib/config";
import { calculateProfileCompletion } from "../../utils/profileCompletion";

export default function ProfilePage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const {
    data: profileData,
    isLoading,
    error: profileError,
    refetch,
  } = useProfile();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (profileError) {
      if (profileError.message.includes("401")) {
        navigate("/login");
        return;
      }
      setError("Failed to load profile data. Please try again.");
    }
  }, [currentUser, navigate, profileError]);

  const handleEditProfile = () => {
    navigate("/editprofile");
  };

  const handleEditSection = (section) => {
    navigate(`/editprofile?section=${section}`);
  };

  if (isLoading) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
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

  const hasData = (data) => {
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object" && data !== null) {
      return Object.values(data).some(
        (value) => value !== null && value !== undefined && value !== ""
      );
    }
    return data !== null && data !== undefined && data !== "";
  };

  const hasBasicInfo = () => {
    return profileData.country && profileData.city && profileData.status;
  };

  const hasPersonalInfo = () => {
    const hasLocation =
      !profileData.hideLocation && (profileData.country || profileData.city);
    const hasAge = !profileData.hideAge && profileData.age;
    return hasLocation || hasAge;
  };

  const hasCodingPreferences = () => {
    return (
      profileData.favoriteDrinkWhileCoding ||
      profileData.musicGenreWhileCoding ||
      profileData.favoriteShowMovie ||
      profileData.favoriteTimeToCode ||
      profileData.preferredOS
    );
  };

  const renderPersonalInfo = () => {
    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <User size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Personal Information</h3>
          </div>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection("personal")}
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.infoGrid}>
          {!profileData.hideLocation &&
            (profileData.country || profileData.city) && (
              <div className={styles.infoItem}>
                <MapPin size={18} className={styles.infoIcon} />
                <span>
                  {[profileData.city, profileData.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          {!profileData.hideAge && profileData.age && (
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
            <h3 className={styles.sectionTitle}>About Me</h3>
          </div>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection("personal")}
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.aboutContent}>
          {profileData.aboutMe ? (
            <p className={styles.aboutText}>{profileData.aboutMe}</p>
          ) : (
            <div className={styles.emptyState}>
              <span>No description added yet</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSkillSection = (
    title,
    icon,
    data,
    emptyText,
    sectionKey,
    isBasic = false
  ) => {
    if (!hasData(data)) {
      return (
        <div className={`card ${isBasic ? "basic" : "enhanced"}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleContainer}>
              {icon}
              <h3 className={styles.sectionTitle}>{title}</h3>
            </div>
          </div>
          <p className={styles.emptyState}>{emptyText}</p>
        </div>
      );
    }

    return (
      <div className={`card ${isBasic ? "basic" : "enhanced"}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            {icon}
            <h3 className={styles.sectionTitle}>{title}</h3>
          </div>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection(sectionKey)}
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.skillsGrid}>
          {Array.isArray(data)
            ? data.map((item, index) => {
                if (
                  sectionKey === "languages" &&
                  Array.isArray(item) &&
                  item.length === 2
                ) {
                  return (
                    <span
                      key={`${item[0]}-${index}`}
                      className={`${styles.skillTag} ${styles.programmingLanguageTag}`}
                    >
                      <Code size={14} className={styles.skillIcon} />
                      <span className={styles.skillName}>{item[0]}</span>
                      <span className={styles.skillLevel}>({item[1]}/10)</span>
                    </span>
                  );
                }

                if (sectionKey === "languages" && typeof item === "string") {
                  return (
                    <span
                      key={`${item}-${index}`}
                      className={`${styles.skillTag} ${styles.programmingLanguageTag}`}
                    >
                      <Code size={14} className={styles.skillIcon} />
                      <span className={styles.skillName}>{item}</span>
                      <span className={styles.skillLevel}>(5/10)</span>
                    </span>
                  );
                }

                return (
                  <span key={`${item}-${index}`} className={styles.skillTag}>
                    {item}
                  </span>
                );
              })
            : data.split(",").map((item, index) => (
                <span
                  key={`${item.trim()}-${index}`}
                  className={styles.skillTag}
                >
                  {item.trim()}
                </span>
              ))}
        </div>
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
            <Briefcase size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Experience Level</h3>
          </div>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection("experience")}
          >
            <Edit3 size={16} />
          </button>
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
    if (!hasCodingPreferences()) return null;

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <Settings size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Coding Preferences</h3>
          </div>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection("preferences")}
          >
            <Edit3 size={16} />
          </button>
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
                  {profileData.favoriteTimeToCode}
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
    if (!profileData.gaming || profileData.gaming === "none") return null;

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
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection("gaming")}
          >
            <Edit3 size={16} />
          </button>
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

  const renderStats = () => {
    const profileStats = calculateProfileCompletion(profileData);

    const stats = [
      {
        label: "Languages",
        value: profileData.programmingLanguages?.length || 0,
        icon: <Code size={16} />,
      },
      {
        label: "Tech Stack",
        value: profileData.techStack?.length || 0,
        icon: <Wrench size={16} />,
      },
      {
        label: "Interests",
        value: profileData.techArea?.length || 0,
        icon: <Heart size={16} />,
      },
      {
        label: "Profile Complete",
        value: `${profileStats.totalCompletion}%`,
        icon: <Target size={16} />,
      },
    ];

    return (
      <div className={`card enhanced ${styles.statsSection}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <Award size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Profile Stats</h3>
          </div>
        </div>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statIconContainer}>{stat.icon}</div>
              <div className={styles.statNumber}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div className={styles.matchingStatus}>
          {profileStats.isMatchable ? (
            <span className={styles.matchingEnabled}>
              ✅ You are able to match! (
              {profileStats.completedRequiredFieldsCount}/
              {profileStats.totalRequiredFieldsCount} required fields)
            </span>
          ) : (
            <span className={styles.matchingDisabled}>
              ❌ {profileStats.missingRequiredFields} required fields missing to
              match
            </span>
          )}
        </div>
        <div className={styles.profileProgress}>
          <small>
            {profileStats.completedFieldsCount} of{" "}
            {profileStats.totalFieldsCount} total profile fields completed
          </small>
        </div>
      </div>
    );
  };

  if (!hasBasicInfo()) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <User
              size={48}
              style={{
                color: "var(--color-primary)",
                marginBottom: "20px",
              }}
            />
            <h1 className="title">Complete Your Profile</h1>
            <p className="subtitle">
              Let's set up your basic profile information
            </p>
            <button className="btn btn-primary" onClick={handleEditProfile}>
              <Plus size={16} />
              Start Profile Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className={styles.profileContainer}>
        <div className={`card enhanced ${styles.profileHeader}`}>
          <div className={styles.headerButtons}>
            <DarkMode />
            <button className={`btn btn-secondary ${styles.settingsBtn}`}>
              <Settings size={20} />
            </button>
          </div>

          <div className={styles.avatar}>
            <User size={32} />
          </div>

          <h1 className={`title ${styles.profileName}`}>
            {currentUser?.nickname || currentUser?.username || "Your Name"}
          </h1>

          <p className={`subtitle ${styles.profileSubtitle}`}>
            {{
              searchhelp: "Seeking Help",
              offerhelp: "Offering Help",
              networking: "Networking",
              learnpartner: "Learning Partner",
            }[profileData.status] ||
              profileData.status ||
              "Developer"}
          </p>

          <button
            className={`btn btn-primary ${styles.editProfileBtn}`}
            onClick={handleEditProfile}
          >
            <Edit3 size={16} />
            Edit Basic Profile
          </button>
        </div>

        <div className={styles.profileContent}>
          {renderAboutMe()}

          {hasPersonalInfo() && renderPersonalInfo()}

          {renderExperienceLevel()}

          {hasData(profileData.programmingLanguages) &&
            renderSkillSection(
              "Programming Languages",
              <Code size={20} className={styles.sectionIcon} />,
              profileData.programmingLanguages,
              "No programming languages added yet",
              "languages",
              true
            )}

          {hasData(profileData.techStack) &&
            renderSkillSection(
              "Tech Stack & Tools",
              <Wrench size={20} className={styles.sectionIcon} />,
              profileData.techStack,
              "No tech stack added yet",
              "stack",
              true
            )}

          {hasData(profileData.techArea) &&
            renderSkillSection(
              "Tech Interests",
              <Heart size={20} className={styles.sectionIcon} />,
              profileData.techArea,
              "No tech interests added yet",
              "interests",
              true
            )}

          {profileData.gaming &&
            profileData.gaming !== "none" &&
            renderGamingPreferences()}

          {hasData(profileData.otherInterests) &&
            renderSkillSection(
              "Other Interests",
              <Users size={20} className={styles.sectionIcon} />,
              profileData.otherInterests,
              "No other interests added yet",
              "other"
            )}

          {hasCodingPreferences() && renderCodingPreferences()}

          {renderStats()}

          <div
            className={styles.addMoreSection}
            onClick={() => handleEditSection("personal")}
          >
            <div className={styles.addMoreContent}>
              <Plus size={32} className={styles.addMoreIcon} />
              <div className={styles.addMoreText}>
                Add Additional Information
              </div>
              <div className={styles.addMoreSubtext}>
                Add more details like hobbies, preferences, and personal info
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
