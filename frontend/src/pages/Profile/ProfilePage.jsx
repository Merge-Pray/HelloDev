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
} from "lucide-react";
import useUserStore from "../../hooks/userstore";
import DarkMode from "../../components/DarkMode";
import styles from "./profilepage.module.css";

export default function ProfilePage() {
  const currentUser = useUserStore((s) => s.currentUser);
  const [profileData, setProfileData] = useState({});
  const navigate = useNavigate();

  // Mock profile data - in real app, this would come from API
  useEffect(() => {
    const mockProfileData = {
      step1: {
        country: "Germany",
        city: "Berlin",
        age: 25,
        hideLocation: false,
        hideAge: false,
      },
      step2: ["JavaScript", "Python", "TypeScript", "React", "Node.js"],
      step3: "Intermediate",
      step4: ["Web Development", "AI/Machine Learning"],
      step5: ["React", "Node.js", "MongoDB", "Express", "Docker"],
      step6: ["English", "German", "Spanish"],
      step7: "macOS",
      step8: ["PC Gaming", "Board Games"],
      step9: ["Reading", "Music", "Photography"],
      step10: {
        aboutMe:
          "Passionate full-stack developer who loves creating innovative solutions and learning new technologies. Always excited about new challenges!",
        favoriteDrink: "Coffee",
        musicGenre: "Lo-fi Hip Hop",
        favoriteShow: "The Office",
      },
      step11: "Evening (5-9 PM)",
    };
    setProfileData(mockProfileData);
  }, []);

  const handleEditProfile = () => {
    navigate("/buildprofile");
  };

  // Helper functions
  const hasData = (data) => {
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object" && data !== null) {
      return Object.values(data).some(
        (value) => value !== null && value !== undefined && value !== ""
      );
    }
    return data !== null && data !== undefined && data !== "";
  };

  const hasPersonalInfo = () => {
    const personal = profileData.step1 || {};
    const hasLocation =
      !personal.hideLocation && (personal.country || personal.city);
    const hasAge = !personal.hideAge && personal.age;
    return hasLocation || hasAge;
  };

  const hasCodingPreferences = () => {
    const prefs = profileData.step10 || {};
    const codingTime = profileData.step11;
    return (
      prefs.favoriteDrink ||
      prefs.musicGenre ||
      prefs.favoriteShow ||
      codingTime
    );
  };

  // Render functions
  const renderPersonalInfo = () => {
    const personal = profileData.step1 || {};

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Personal Information</h3>
          <button className={`btn btn-secondary ${styles.editBtn}`}>
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.infoGrid}>
          {!personal.hideLocation && (personal.country || personal.city) && (
            <div className={styles.infoItem}>
              <MapPin size={18} />
              <span>
                {[personal.city, personal.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {!personal.hideAge && personal.age && (
            <div className={styles.infoItem}>
              <Calendar size={18} />
              <span>{personal.age} years old</span>
            </div>
          )}
          {hasData(profileData.step6) && (
            <div className={styles.infoItem}>
              <Globe size={18} />
              <span>Speaks {profileData.step6.slice(0, 3).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAboutMe = () => {
    const aboutData = profileData.step10 || {};

    return (
      <div className={`card enhanced ${styles.aboutSection}`}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>About Me</h3>
          <button className={`btn btn-secondary ${styles.editBtn}`}>
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.aboutContent}>
          {aboutData.aboutMe ? (
            <p className={styles.aboutText}>{aboutData.aboutMe}</p>
          ) : (
            <div className={styles.emptyState}>
              <span>No description added yet</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSkillSection = (title, icon, data, emptyText) => {
    const skills = Array.isArray(data) ? data : [];

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{title}</h3>
          <button className={`btn btn-secondary ${styles.editBtn}`}>
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
    const level = profileData.step3;
    if (!level) return null;

    const getLevelStyle = () => {
      switch (level) {
        case "Beginner":
          return styles.levelBeginner;
        case "Intermediate":
          return styles.levelIntermediate;
        case "Expert":
          return styles.levelExpert;
        default:
          return styles.levelBeginner;
      }
    };

    const getLevelIcon = () => {
      switch (level) {
        case "Beginner":
          return <Zap size={18} />;
        case "Intermediate":
          return <Target size={18} />;
        case "Expert":
          return <Award size={18} />;
        default:
          return <Zap size={18} />;
      }
    };

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Experience Level</h3>
          <button className={`btn btn-secondary ${styles.editBtn}`}>
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
    const prefs = profileData.step10 || {};
    const codingTime = profileData.step11;

    if (!hasCodingPreferences()) return null;

    return (
      <div className="card enhanced">
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Coding Preferences</h3>
          <button className={`btn btn-secondary ${styles.editBtn}`}>
            <Edit3 size={16} />
          </button>
        </div>
        <div className={styles.preferencesGrid}>
          {prefs.favoriteDrink && (
            <div className={styles.prefItem}>
              <Coffee size={18} />
              <div>
                <div className={styles.prefLabel}>Favorite Drink</div>
                <div className={styles.prefValue}>{prefs.favoriteDrink}</div>
              </div>
            </div>
          )}
          {prefs.musicGenre && (
            <div className={styles.prefItem}>
              <Music size={18} />
              <div>
                <div className={styles.prefLabel}>Music Genre</div>
                <div className={styles.prefValue}>{prefs.musicGenre}</div>
              </div>
            </div>
          )}
          {prefs.favoriteShow && (
            <div className={styles.prefItem}>
              <Tv size={18} />
              <div>
                <div className={styles.prefLabel}>Favorite Show</div>
                <div className={styles.prefValue}>{prefs.favoriteShow}</div>
              </div>
            </div>
          )}
          {codingTime && (
            <div className={styles.prefItem}>
              <Clock size={18} />
              <div>
                <div className={styles.prefLabel}>Coding Time</div>
                <div className={styles.prefValue}>{codingTime}</div>
              </div>
            </div>
          )}
          {profileData.step7 && (
            <div className={styles.prefItem}>
              <Monitor size={18} />
              <div>
                <div className={styles.prefLabel}>Preferred OS</div>
                <div className={styles.prefValue}>{profileData.step7}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const stats = [
      {
        label: "Languages",
        value: profileData.step2?.length || 0,
      },
      {
        label: "Tech Stack",
        value: profileData.step5?.length || 0,
      },
      {
        label: "Interests",
        value: profileData.step4?.length || 0,
      },
      {
        label: "Profile Complete",
        value: `${Math.round((Object.keys(profileData).length / 11) * 100)}%`,
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
            {profileData.step3 ? `${profileData.step3} Developer` : "Developer"}
          </p>

          <button
            className={`btn btn-primary ${styles.editProfileBtn}`}
            onClick={handleEditProfile}
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        </div>

        <div className={styles.profileContent}>
          {/* Conditional rendering for all sections */}
          {profileData.step10?.aboutMe && renderAboutMe()}
          {hasPersonalInfo() && renderPersonalInfo()}
          {renderExperienceLevel()}

          {hasData(profileData.step2) &&
            renderSkillSection(
              "Programming Languages",
              <Code size={14} />,
              profileData.step2,
              "No programming languages added yet"
            )}

          {hasData(profileData.step5) &&
            renderSkillSection(
              "Tech Stack & Tools",
              <Zap size={14} />,
              profileData.step5,
              "No tech stack added yet"
            )}

          {hasData(profileData.step4) &&
            renderSkillSection(
              "Tech Interests",
              <Heart size={14} />,
              profileData.step4,
              "No tech interests added yet"
            )}

          {hasData(profileData.step8) &&
            renderSkillSection(
              "Gaming Preferences",
              <Gamepad2 size={14} />,
              profileData.step8,
              "No gaming preferences added yet"
            )}

          {hasData(profileData.step9) &&
            renderSkillSection(
              "Other Interests",
              <Users size={14} />,
              profileData.step9,
              "No other interests added yet"
            )}

          {hasCodingPreferences() && renderCodingPreferences()}

          {/* Stats Section */}
          {renderStats()}

          {/* Add More Section */}
          <div className={styles.addMoreSection} onClick={handleEditProfile}>
            <div className={styles.addMoreContent}>
              <Plus size={32} />
              <div className={styles.addMoreText}>Add More Information</div>
              <div className={styles.addMoreSubtext}>
                Complete your profile to help others connect with you
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
