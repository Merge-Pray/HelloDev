import { useState, useEffect } from "react";
import { useNavigate } from "react-router"; // useParams entfernt
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
} from "lucide-react";
import useUserStore from "../../hooks/userstore";
import DarkMode from "../../components/DarkMode";
import styles from "./profilepage.module.css";
import { API_URL } from "../../lib/config";

export default function ProfilePage() {
  // const { id } = useParams(); // Diese Zeile entfernen
  const { currentUser, setCurrentUser } = useUserStore();
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Nur eigene Daten abrufen - keine ID nötig
        const response = await fetch(`${API_URL}/api/user/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate("/login");
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Profile data received:", data);

        const transformedData = {
          country: data.user.country,
          city: data.user.city,
          status: data.user.status,
          devExperience: data.user.devExperience,
          techArea: data.user.techArea,
          programmingLanguages: data.user.programmingLanguages,
          techStack: data.user.techStack,
          preferredOS: data.user.preferredOS,

          age: data.user.age,
          hideLocation: data.user.hideLocation || false,
          hideAge: data.user.hideAge || false,
          languages: data.user.languages,
          gamingPreferences: data.user.gamingPreferences,
          otherInterests: data.user.otherInterests,
          aboutMe: data.user.aboutMe,
          favoriteDrink: data.user.favoriteDrink,
          musicGenre: data.user.musicGenreWhileCoding,
          favoriteShow: data.user.favoriteShow,
          codingTime: data.user.codingTime,
        };

        setProfileData(transformedData);

        setCurrentUser({ ...currentUser, ...data.user });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser?.id, navigate, setCurrentUser]);

  const handleEditProfile = () => {
    navigate("/editprofile");
  };

  const handleEditAdditional = () => {
    navigate("/editprofile");
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
      profileData.favoriteDrink ||
      profileData.musicGenre ||
      profileData.favoriteShow ||
      profileData.codingTime ||
      profileData.preferredOS
    );
  };

  const renderPersonalInfo = () => {
    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={handleEditAdditional}
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.infoGrid}>
          {!profileData.hideLocation &&
            (profileData.country || profileData.city) && (
              <div className={styles.infoItem}>
                <MapPin size={18} />
                <span>
                  {[profileData.city, profileData.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          {!profileData.hideAge && profileData.age && (
            <div className={styles.infoItem}>
              <Calendar size={18} />
              <span>{profileData.age} years old</span>
            </div>
          )}
          {hasData(profileData.languages) && (
            <div className={styles.infoItem}>
              <Globe size={18} />
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
          <h3 className={styles.sectionTitle}>About Me</h3>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={handleEditAdditional}
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
    isBasic = false
  ) => {
    const skills = Array.isArray(data) ? data : [];

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{title}</h3>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={isBasic ? handleEditProfile : handleEditAdditional}
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.skillsContainer}>
          {skills.length > 0 ? (
            <div className={styles.skillsGrid}>
              {skills.map((skill, index) => (
                <div key={index} className={styles.skillTag}>
                  {icon}
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span>{emptyText}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExperienceLevel = () => {
    const level = profileData.devExperience;
    if (!level) return null;

    const getLevelStyle = () => {
      if (level.includes("Beginner")) return styles.levelBeginner;
      if (level.includes("Intermediate")) return styles.levelIntermediate;
      if (level.includes("Advanced") || level.includes("Expert"))
        return styles.levelExpert;
      return styles.levelBeginner;
    };

    const getLevelIcon = () => {
      if (level.includes("Beginner")) return <Zap size={18} />;
      if (level.includes("Intermediate")) return <Target size={18} />;
      if (level.includes("Advanced") || level.includes("Expert"))
        return <Award size={18} />;
      return <Zap size={18} />;
    };

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Experience Level</h3>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={handleEditProfile}
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.experienceBadge}>
          <div className={`${styles.levelBadge} ${getLevelStyle()}`}>
            {getLevelIcon()}
            <span>{level}</span>
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
          <h3 className={styles.sectionTitle}>Coding Preferences</h3>
          <button
            className={`btn btn-secondary ${styles.editBtn}`}
            onClick={handleEditAdditional}
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.preferencesGrid}>
          {profileData.favoriteDrink && (
            <div className={styles.prefItem}>
              <Coffee size={18} />
              <div>
                <div className={styles.prefLabel}>Favorite Drink</div>
                <div className={styles.prefValue}>
                  {profileData.favoriteDrink}
                </div>
              </div>
            </div>
          )}
          {profileData.musicGenre && (
            <div className={styles.prefItem}>
              <Music size={18} />
              <div>
                <div className={styles.prefLabel}>Music Genre</div>
                <div className={styles.prefValue}>{profileData.musicGenre}</div>
              </div>
            </div>
          )}
          {profileData.favoriteShow && (
            <div className={styles.prefItem}>
              <Tv size={18} />
              <div>
                <div className={styles.prefLabel}>Favorite Show</div>
                <div className={styles.prefValue}>
                  {profileData.favoriteShow}
                </div>
              </div>
            </div>
          )}
          {profileData.codingTime && (
            <div className={styles.prefItem}>
              <Clock size={18} />
              <div>
                <div className={styles.prefLabel}>Coding Time</div>
                <div className={styles.prefValue}>{profileData.codingTime}</div>
              </div>
            </div>
          )}
          {profileData.preferredOS && (
            <div className={styles.prefItem}>
              <Monitor size={18} />
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

  const renderStats = () => {
    const basicFields = [
      profileData.country,
      profileData.city,
      profileData.status,
      profileData.devExperience,
      profileData.techArea,
      profileData.programmingLanguages,
      profileData.techStack,
      profileData.preferredOS,
    ].filter(Boolean);

    const additionalFields = [
      profileData.age,
      profileData.languages,
      profileData.gamingPreferences,
      profileData.otherInterests,
      profileData.aboutMe,
      profileData.favoriteDrink,
      profileData.musicGenre,
      profileData.favoriteShow,
      profileData.codingTime,
    ].filter((field) => hasData(field));

    const totalFields = 17; // Total possible fields
    const completedFields = basicFields.length + additionalFields.length;

    const stats = [
      {
        label: "Languages",
        value: profileData.programmingLanguages?.length || 0,
      },
      {
        label: "Tech Stack",
        value: profileData.techStack?.length || 0,
      },
      {
        label: "Interests",
        value: profileData.techArea?.length || 0,
      },
      {
        label: "Profile Complete",
        value: `${Math.round((completedFields / totalFields) * 100)}%`,
      },
    ];

    return (
      <div className={`card enhanced ${styles.statsSection}`}>
        <h3 className={styles.sectionTitle} style={{ color: "white" }}>
          Profile Stats
        </h3>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statNumber}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show onboarding if no basic profile data
  if (!hasBasicInfo()) {
    return (
      <div className="page centered">
        <div className="card enhanced">
          <h1 className="title">Complete Your Profile</h1>
          <p className="subtitle">
            Let's set up your basic profile information
          </p>
          <button className="btn btn-primary" onClick={handleEditProfile}>
            Start Profile Setup
          </button>
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
            {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <h1 className={`title ${styles.profileName}`}>
            {currentUser?.username || "Your Name"}
          </h1>

          <p className={`subtitle ${styles.profileSubtitle}`}>
            {profileData.status || "Developer"}
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
          {/* Always show About Me section */}
          {renderAboutMe()}

          {/* Show personal info if exists */}
          {hasPersonalInfo() && renderPersonalInfo()}

          {/* Basic profile sections */}
          {renderExperienceLevel()}

          {hasData(profileData.programmingLanguages) &&
            renderSkillSection(
              "Programming Languages",
              <Code size={14} />,
              profileData.programmingLanguages,
              "No programming languages added yet",
              true
            )}

          {hasData(profileData.techStack) &&
            renderSkillSection(
              "Tech Stack & Tools",
              <Zap size={14} />,
              profileData.techStack,
              "No tech stack added yet",
              true
            )}

          {hasData(profileData.techArea) &&
            renderSkillSection(
              "Tech Interests",
              <Heart size={14} />,
              profileData.techArea,
              "No tech interests added yet",
              true
            )}

          {/* Additional profile sections */}
          {hasData(profileData.gamingPreferences) &&
            renderSkillSection(
              "Gaming Preferences",
              <Gamepad2 size={14} />,
              profileData.gamingPreferences,
              "No gaming preferences added yet"
            )}

          {hasData(profileData.otherInterests) &&
            renderSkillSection(
              "Other Interests",
              <Users size={14} />,
              profileData.otherInterests,
              "No other interests added yet"
            )}

          {hasCodingPreferences() && renderCodingPreferences()}

          {/* Stats Section */}
          {renderStats()}

          {/* Add More Section */}
          <div className={styles.addMoreSection} onClick={handleEditAdditional}>
            <div className={styles.addMoreContent}>
              <Plus size={32} />
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
