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
  Camera,
  ExternalLink,
  Eye,
  EyeOff,
  Linkedin,
  Github,
} from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { useProfile } from "../../hooks/useProfile";
import styles from "./profilepage.module.css";
import { calculateProfileCompletion } from "../../utils/profileCompletion";

export default function ProfilePage() {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
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
    if (profileError) {
      if (profileError.message.includes("401")) {
        navigate("/login");
        return;
      }
      setError("Failed to load profile data. Please try again.");
    }
  }, [navigate, profileError]);

  const handleEditProfile = () => {
    navigate("/editprofile");
  };

  const handleEditSection = (section) => {
    navigate(`/editprofile?section=${section}`);
  };

  const handleEditAvatar = () => {
    navigate("/avatar-editor");
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleCloseAvatarModal = (e) => {
    // Schließt Modal bei Klick auf Overlay oder Button
    if (e.target.classList.contains("avatar-modal-overlay") || e.target.classList.contains("avatar-modal-close")) {
      setShowAvatarModal(false);
    }
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
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection(sectionKey)}
          >
            <Edit3 size={16} />
          </button>
        </div>

        {hasData(data) ? (
          <>
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
              }) && (
                <div className={styles.skillLegend}>
                  <div className={styles.legendTitle}>
                    Hover over dots for skill levels:
                  </div>
                  <div className={styles.legendItems}>
                    <div className={styles.legendItem}>
                      <span
                        className={`${styles.legendDot} ${styles.skillLevelBeginner}`}
                      ></span>
                      <span className={styles.legendLabel}>Beginner</span>
                      <span className={styles.legendDescription}>(1-3)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={`${styles.legendDot} ${styles.skillLevelIntermediate}`}
                      ></span>
                      <span className={styles.legendLabel}>Intermediate</span>
                      <span className={styles.legendDescription}>(4-7)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={`${styles.legendDot} ${styles.skillLevelAdvanced}`}
                      ></span>
                      <span className={styles.legendLabel}>Advanced</span>
                      <span className={styles.legendDescription}>(8-10)</span>
                    </div>
                  </div>
                </div>
              )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <span>{emptyText}</span>
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
        label: "Total Fields",
        value: `${profileStats.completedFieldsCount}/${profileStats.totalFieldsCount}`,
        icon: <Target size={16} />,
      },
    ];

    return (
      <div className={`card enhanced ${styles.statsSection}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <h3 className={styles.sectionTitle}>Profile Statistics</h3>
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
      </div>
    );
  };

  const renderFavouriteLineOfCode = () => {
    return (
      <div className={`card enhanced ${styles.aboutSection}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <Code size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Favorite Line of Code</h3>
          </div>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection("preferences")}
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.aboutContent}>
          {profileData.favoriteLineOfCode ? (
            <pre className={styles.codeBlock}>
              <code>{profileData.favoriteLineOfCode}</code>
            </pre>
          ) : (
            <div className={styles.emptyState}>
              <span>No favourite line of code added yet</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfessionalLinks = () => {
    const hasLinkedIn = profileData.linkedinProfile && profileData.linkedinProfile.trim() !== "";
    const hasGitHub = profileData.githubProfile && profileData.githubProfile.trim() !== "";
    const hasWebsites = profileData.personalWebsites && profileData.personalWebsites.length > 0;
    const hasAnyLinks = hasLinkedIn || hasGitHub || hasWebsites;

    if (!hasAnyLinks) return null;

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleContainer}>
            <Briefcase size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Professional Links</h3>
          </div>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={() => handleEditSection("professional")}
          >
            <Edit3 size={16} />
          </button>
        </div>
        
        <div className={styles.professionalLinksContent}>
          <div className={styles.visibilityStatus}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {profileData.profileLinksVisibleToContacts ? (
                <>
                  <Eye size={14} />
                  <span>Visible to your contacts</span>
                </>
              ) : (
                <>
                  <EyeOff size={14} />
                  <span>Private (only visible to you)</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.linksGrid}>
            {hasLinkedIn && (
              <div className={styles.linkItem}>
                <div className={styles.linkIcon}>
                  <Linkedin size={18} />
                </div>
                <div className={styles.linkContent}>
                  <div className={styles.linkLabel}>LinkedIn</div>
                  <a 
                    href={profileData.linkedinProfile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkUrl}
                  >
                    {profileData.linkedinProfile}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
            
            {hasGitHub && (
              <div className={styles.linkItem}>
                <div className={styles.linkIcon}>
                  <Github size={18} />
                </div>
                <div className={styles.linkContent}>
                  <div className={styles.linkLabel}>GitHub</div>
                  <a 
                    href={profileData.githubProfile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkUrl}
                  >
                    {profileData.githubProfile}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
            
            {hasWebsites && profileData.personalWebsites.filter(url => url && url.trim() !== "").map((website, index) => (
              <div key={index} className={styles.linkItem}>
                <div className={styles.linkIcon}>
                  <Globe size={18} />
                </div>
                <div className={styles.linkContent}>
                  <div className={styles.linkLabel}>Personal Website {profileData.personalWebsites.filter(url => url && url.trim() !== "").length > 1 ? `#${index + 1}` : ""}</div>
                  <a 
                    href={website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.linkUrl}
                  >
                    {website}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
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
      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay" onClick={handleCloseAvatarModal} style={{position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="avatar-modal-content" style={{background:'#fff', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 32px rgba(0,0,0,0.2)', position:'relative', display:'flex', flexDirection:'column', alignItems:'center'}}>
            <button className="avatar-modal-close" onClick={handleCloseAvatarModal} style={{position:'absolute', top:16, right:16, background:'none', border:'none', fontSize:'2rem', cursor:'pointer'}}>&times;</button>
            <img
              src={profileData?.avatar || currentUser?.avatar || "/default-avatar.png"}
              alt="Avatar groß"
              style={{width:'320px', height:'320px', borderRadius:'50%', objectFit:'cover', boxShadow:'0 2px 16px rgba(0,0,0,0.15)'}}
            />
          </div>
        </div>
      )}
      <div className={styles.profileContainer}>
        <div className={`card enhanced ${styles.profileHeader}`}> 
          <div className={styles.avatarContainer}>
            <div className={styles.avatar} style={{cursor:'pointer'}} onClick={handleAvatarClick} title="Avatar vergrößern">
              {profileData?.avatar || currentUser?.avatar ? (
                <img
                  src={profileData?.avatar || currentUser?.avatar}
                  alt={`${currentUser?.nickname || currentUser?.username}'s avatar`}
                  className={styles.avatarImage}
                  onError={(e) => {
                    e.target.src = "/avatars/default_avatar.png";
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
            <button
              className={styles.avatarEditBtn}
              onClick={handleEditAvatar}
              title="Edit Avatar"
              aria-label="Edit Avatar"
            >
              <Camera size={16} />
            </button>
          </div>

          <h1 className={`title ${styles.profileName}`}>
            {currentUser?.nickname || currentUser?.username || "Your Name"}
          </h1>
          <span className={styles.handle}>
            @{currentUser?.username}.HelloDev.social
          </span>

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
        </div>

  <div className={`card enhanced ${styles.profileActionsCard}`}>
          <div className={styles.profileActionsContainer}>
            <button
              className={`btn btn-primary ${styles.editProfileBtn}`}
              onClick={handleEditProfile}
            >
              <Edit3 size={16} />
              Edit Basic Profile
            </button>

            <div className={styles.profileStatusContainer}>
              {(() => {
                const profileStats = calculateProfileCompletion(profileData);
                return (
                  <>
                    <div className={styles.completionSection}>
                      <div className={styles.completionHeader}>
                        <Target size={16} />
                        <span>Profile Completion</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${profileStats.totalCompletion}%` }}
                        />
                      </div>
                      <div className={styles.progressText}>
                        {profileStats.totalCompletion}% Complete (
                        {profileStats.completedFieldsCount}/
                        {profileStats.totalFieldsCount} fields)
                      </div>
                    </div>

                    <div className={styles.matchingSection}>
                      {profileStats.isMatchable ? (
                        <div className={styles.matchingEnabled}>
                          <div className={styles.matchingIcon}>✅</div>
                          <div className={styles.matchingText}>
                            <div className={styles.matchingTitle}>
                              Ready to Match!
                            </div>
                            <div className={styles.matchingSubtitle}>
                              {profileStats.completedRequiredFieldsCount}/
                              {profileStats.totalRequiredFieldsCount} required
                              fields completed
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.matchingDisabled}>
                          <div className={styles.matchingIcon}>❌</div>
                          <div className={styles.matchingText}>
                            <div className={styles.matchingTitle}>
                              Complete Profile to Match
                            </div>
                            <div className={styles.matchingSubtitle}>
                              {profileStats.missingRequiredFields} more required
                              fields needed
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

  <div className={styles.profileContent}>
          {renderAboutMe()}

          {renderFavouriteLineOfCode()}

          {hasPersonalInfo() && renderPersonalInfo()}

          {renderExperienceLevel()}

          {hasData(profileData.programmingLanguages) &&
            renderSkillSection(
              "Programming Languages",
              null,
              profileData.programmingLanguages,
              "No programming languages added yet",
              "languages",
              true
            )}

          {hasData(profileData.techStack) &&
            renderSkillSection(
              "Tech Stack & Tools",
              null,
              profileData.techStack,
              "No tech stack added yet",
              "stack",
              true
            )}

          {hasData(profileData.techArea) &&
            renderSkillSection(
              "Tech Interests",
              null,
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
              null,
              profileData.otherInterests,
              "No other interests added yet",
              "other"
            )}

          {hasCodingPreferences() && renderCodingPreferences()}

          {renderProfessionalLinks()}

          {(() => {
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
                label: "Total Fields",
                value: `${profileStats.completedFieldsCount}/${profileStats.totalFieldsCount}`,
                icon: <Target size={16} />,
              },
            ];

            return (
              <div className={`card enhanced ${styles.statsSection}`}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleContainer}>
                    <h3 className={styles.sectionTitle}>Profile Statistics</h3>
                  </div>
                </div>
                <div className={styles.statsGrid}>
                  {stats.map((stat, index) => (
                    <div key={index} className={styles.statItem}>
                      <div className={styles.statIconContainer}>
                        {stat.icon}
                      </div>
                      <div className={styles.statNumber}>{stat.value}</div>
                      <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

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
