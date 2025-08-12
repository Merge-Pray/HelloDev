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
} from "lucide-react";
import useUserStore from "../hooks/userstore";

export default function ProfilePage() {
  const currentUser = useUserStore((s) => s.currentUser);
  const [profileData, setProfileData] = useState({});
  const navigate = useNavigate();

  // Mock profile data - in real app, this would come from API
  useEffect(() => {
    // Simulate loading profile data - only show filled data
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
      step5: ["React", "Node.js", "MongoDB"],
      step6: ["English", "German"],
      step7: "macOS",
      step8: ["PC Gaming", "Board Games"],
      step9: ["Reading", "Music"],
      step10: {
        aboutMe:
          "Passionate full-stack developer who loves creating innovative solutions.",
        favoriteDrink: "Coffee",
        musicGenre: "Lo-fi Hip Hop",
        favoriteShow: "The Office",
      },
      step11: "Evening (5-9 PM)",
    };
    setProfileData(mockProfileData);
  }, []);

  const handleEditProfile = () => {
    navigate("/editprofile");
  };

  // Helper function to check if data exists and is not empty
  const hasData = (data) => {
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === "object" && data !== null) {
      return Object.values(data).some(
        (value) => value !== null && value !== undefined && value !== ""
      );
    }
    return data !== null && data !== undefined && data !== "";
  };

  // Helper function to check if personal info should be shown
  const hasPersonalInfo = () => {
    const personal = profileData.step1 || {};
    const hasLocation =
      !personal.hideLocation && (personal.country || personal.city);
    const hasAge = !personal.hideAge && personal.age;
    return hasLocation || hasAge;
  };

  // Helper function to check if coding preferences should be shown
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

  const renderPersonalInfo = () => {
    const personal = profileData.step1 || {};

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3>Personal Information</h3>
          <button
            className="edit-btn"
            onClick={() =>
              setEditSection(editSection === "personal" ? null : "personal")
            }
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className="info-grid">
          {!personal.hideLocation && (personal.country || personal.city) && (
            <div className="info-item">
              <MapPin size={18} />
              <span>
                {[personal.city, personal.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {!personal.hideAge && personal.age && (
            <div className="info-item">
              <Calendar size={18} />
              <span>{personal.age} years old</span>
            </div>
          )}
          {!personal.country && !personal.city && !personal.age && (
            <div className="empty-state">
              <span>No personal information added yet</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAboutMe = () => {
    const aboutData = profileData.step10 || {};

    return (
      <div className="profile-section about-section">
        <div className="section-header">
          <h3>About Me</h3>
          <button
            className="edit-btn"
            onClick={() =>
              setEditSection(editSection === "about" ? null : "about")
            }
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className="about-content">
          {aboutData.aboutMe ? (
            <p className="about-text">{aboutData.aboutMe}</p>
          ) : (
            <div className="empty-state">
              <span>No description added yet</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCodingPreferences = () => {
    const prefs = profileData.step10 || {};
    const codingTime = profileData.step11;

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3>Coding Preferences</h3>
          <button
            className="edit-btn"
            onClick={() =>
              setEditSection(editSection === "coding" ? null : "coding")
            }
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className="preferences-grid">
          {prefs.favoriteDrink && (
            <div className="pref-item">
              <Coffee size={18} />
              <div>
                <div className="pref-label">Favorite Drink</div>
                <div className="pref-value">{prefs.favoriteDrink}</div>
              </div>
            </div>
          )}
          {prefs.musicGenre && (
            <div className="pref-item">
              <Music size={18} />
              <div>
                <div className="pref-label">Music While Coding</div>
                <div className="pref-value">{prefs.musicGenre}</div>
              </div>
            </div>
          )}
          {prefs.favoriteShow && (
            <div className="pref-item">
              <Tv size={18} />
              <div>
                <div className="pref-label">Favorite Show/Movie</div>
                <div className="pref-value">{prefs.favoriteShow}</div>
              </div>
            </div>
          )}
          {codingTime && (
            <div className="pref-item">
              <Clock size={18} />
              <div>
                <div className="pref-label">Preferred Coding Time</div>
                <div className="pref-value">{codingTime}</div>
              </div>
            </div>
          )}
          {!prefs.favoriteDrink &&
            !prefs.musicGenre &&
            !prefs.favoriteShow &&
            !codingTime && (
              <div className="empty-state">
                <span>No coding preferences added yet</span>
              </div>
            )}
        </div>
      </div>
    );
  };

  const renderTechEnvironment = () => {
    const os = profileData.step7;

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3>Tech Environment</h3>
          <button
            className="edit-btn"
            onClick={() =>
              setEditSection(editSection === "tech" ? null : "tech")
            }
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className="tech-info">
          {os ? (
            <div className="tech-item">
              <Monitor size={18} />
              <div>
                <div className="tech-label">Preferred OS</div>
                <div className="tech-value">{os}</div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span>No OS preference added yet</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSkillSection = (title, icon, data, emptyText) => {
    const skills = Array.isArray(data) ? data : [];

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3>{title}</h3>
          <button
            className="edit-btn"
            onClick={() =>
              setEditSection(
                editSection === title.toLowerCase() ? null : title.toLowerCase()
              )
            }
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className="skills-container">
          {skills.length > 0 ? (
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <div key={index} className="skill-tag">
                  {icon}
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>{emptyText}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    const experience = profileData.step3;

    return (
      <div className="profile-section">
        <div className="section-header">
          <h3>Experience Level</h3>
          <button
            className="edit-btn"
            onClick={() =>
              setEditSection(editSection === "experience" ? null : "experience")
            }
          >
            <Edit3 size={16} />
          </button>
        </div>
        <div className="experience-badge">
          {experience ? (
            <div className={`level-badge level-${experience.toLowerCase()}`}>
              <Users size={18} />
              <span>{experience}</span>
            </div>
          ) : (
            <div className="empty-state">
              <span>No experience level set</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <style>{`
        .page { 
          min-height: 100vh; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .profile-header {
          background: white;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
          position: relative;
        }
        
        .settings-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f8f9fa;
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: #666;
          transition: all 0.2s ease;
        }
        
        .settings-btn:hover {
          background: #e9ecef;
          color: #333;
        }
        
        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 36px;
          font-weight: bold;
          color: white;
        }
        
        .profile-name {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }
        
        .profile-subtitle {
          color: #666;
          font-size: 16px;
        }
        
        .edit-profile-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .edit-profile-btn:hover {
          transform: translateY(-2px);
        }
        
        .profile-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        @media (min-width: 768px) {
          .profile-content {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1200px) {
          .profile-content {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .profile-section {
          background: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .about-section {
          grid-column: 1 / -1;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .section-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }
        
        .edit-btn {
          background: #f8f9fa;
          border: none;
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          color: #666;
          transition: all 0.2s ease;
        }
        
        .edit-btn:hover {
          background: #e9ecef;
          color: #333;
        }
        
        .about-content {
          min-height: 60px;
          display: flex;
          align-items: center;
        }
        
        .about-text {
          margin: 0;
          line-height: 1.6;
          color: #333;
          font-size: 16px;
        }
        
        .preferences-grid, .tech-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .pref-item, .tech-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #e9ecef;
          transition: all 0.2s ease;
        }
        
        .pref-item:hover, .tech-item:hover {
          border-color: #667eea;
          background: #e8f0fe;
        }
        
        .pref-item svg, .tech-item svg {
          color: #667eea;
          flex-shrink: 0;
        }
        
        .pref-label, .tech-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }
        
        .pref-value, .tech-value {
          font-size: 16px;
          color: #333;
          font-weight: 600;
        }
        
        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #666;
          font-size: 16px;
        }
        
        .info-item svg {
          color: #667eea;
        }
        
        .skills-container {
          min-height: 80px;
          display: flex;
          align-items: center;
        }
        
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }
        
        .skill-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 20px;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          transition: all 0.2s ease;
        }
        
        .skill-tag:hover {
          border-color: #667eea;
          background: #e8f0fe;
          color: #667eea;
        }
        
        .skill-tag svg {
          width: 14px;
          height: 14px;
        }
        
        .experience-badge {
          min-height: 80px;
          display: flex;
          align-items: center;
        }
        
        .level-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
        }
        
        .level-beginner {
          background: #e8f5e8;
          color: #2e7d32;
          border: 2px solid #c8e6c9;
        }
        
        .level-intermediate {
          background: #fff3e0;
          color: #ef6c00;
          border: 2px solid #ffcc02;
        }
        
        .level-expert {
          background: #f3e5f5;
          color: #7b1fa2;
          border: 2px solid #ce93d8;
        }
        
        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
          color: #999;
          font-style: italic;
          background: #f8f9fa;
          border: 2px dashed #e9ecef;
          border-radius: 8px;
          width: 100%;
        }
        
        .stats-section {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .add-more-section {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 2px dashed #667eea;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .add-more-section:hover {
          background: linear-gradient(135deg, #e8f0fe 0%, #f3e5f5 100%);
          border-color: #764ba2;
        }
        
        .add-more-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #667eea;
        }
        
        .add-more-content:hover {
          color: #764ba2;
        }
        
        .add-more-text {
          font-size: 16px;
          font-weight: 600;
        }
        
        .add-more-subtext {
          font-size: 14px;
          opacity: 0.8;
        }
      `}</style>

      <div className="profile-container">
        <div className="profile-header">
          <button className="settings-btn">
            <Settings size={20} />
          </button>

          <div className="avatar">
            {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <h1 className="profile-name">
            {currentUser?.username || "Your Name"}
          </h1>

          <p className="profile-subtitle">
            {profileData.step3 ? `${profileData.step3} Developer` : "Developer"}
          </p>

          <button className="edit-profile-btn" onClick={handleEditProfile}>
            <Edit3 size={16} />
            Edit Profile
          </button>
        </div>

        <div className="profile-content">
          {/* Only show About Me if it exists */}
          {profileData.step10?.aboutMe && renderAboutMe()}

          {/* Only show Personal Info if there's data to show */}
          {hasPersonalInfo() && renderPersonalInfo()}

          {/* Only show Experience if it exists */}
          {hasData(profileData.step3) && renderExperience()}

          {/* Only show Tech Environment if OS is selected */}
          {hasData(profileData.step7) && renderTechEnvironment()}

          {/* Only show Coding Preferences if any preference exists */}
          {hasCodingPreferences() && renderCodingPreferences()}

          {/* Only show sections that have data */}
          {hasData(profileData.step2) &&
            renderSkillSection(
              "Programming Languages",
              <Code size={14} />,
              profileData.step2,
              "No programming languages added yet"
            )}

          {hasData(profileData.step4) &&
            renderSkillSection(
              "Areas of Interest",
              <Heart size={14} />,
              profileData.step4,
              "No areas of interest added yet"
            )}

          {hasData(profileData.step5) &&
            renderSkillSection(
              "Tech Stack & Tools",
              <Settings size={14} />,
              profileData.step5,
              "No tech stack added yet"
            )}

          {hasData(profileData.step6) &&
            renderSkillSection(
              "Languages",
              <Globe size={14} />,
              profileData.step6,
              "No languages added yet"
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
              <User size={14} />,
              profileData.step9,
              "No other interests added yet"
            )}

          {/* Always show Add More section */}
          <div
            className="profile-section add-more-section"
            onClick={handleEditProfile}
          >
            <div className="add-more-content">
              <Plus size={32} />
              <div className="add-more-text">Add More Information</div>
              <div className="add-more-subtext">
                Complete your profile to help others connect with you
              </div>
            </div>
          </div>

          {/* Only show stats if there's meaningful data */}
          {(hasData(profileData.step2) ||
            hasData(profileData.step4) ||
            hasData(profileData.step5) ||
            hasData(profileData.step6) ||
            hasData(profileData.step8) ||
            hasData(profileData.step9)) && (
            <div className="profile-section stats-section">
              <h3>Profile Stats</h3>
              <div className="stats-grid">
                {hasData(profileData.step2) && (
                  <div className="stat-item">
                    <div className="stat-number">
                      {profileData.step2.length}
                    </div>
                    <div className="stat-label">Programming Languages</div>
                  </div>
                )}
                {hasData(profileData.step4) && (
                  <div className="stat-item">
                    <div className="stat-number">
                      {profileData.step4.length}
                    </div>
                    <div className="stat-label">Interest Areas</div>
                  </div>
                )}
                {hasData(profileData.step5) && (
                  <div className="stat-item">
                    <div className="stat-number">
                      {profileData.step5.length}
                    </div>
                    <div className="stat-label">Technologies</div>
                  </div>
                )}
                {hasData(profileData.step6) && (
                  <div className="stat-item">
                    <div className="stat-number">
                      {profileData.step6.length}
                    </div>
                    <div className="stat-label">Spoken Languages</div>
                  </div>
                )}
                {hasData(profileData.step8) && (
                  <div className="stat-item">
                    <div className="stat-number">
                      {profileData.step8.length}
                    </div>
                    <div className="stat-label">Gaming Types</div>
                  </div>
                )}
                {hasData(profileData.step9) && (
                  <div className="stat-item">
                    <div className="stat-number">
                      {profileData.step9.length}
                    </div>
                    <div className="stat-label">Other Interests</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
