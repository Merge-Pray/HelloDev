import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Save, X, Edit3, Check, AlertCircle, Gamepad2 } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { API_URL } from "../../lib/config";
import DarkMode from "../../components/DarkMode";
import { calculateProfileCompletion } from "../../utils/profileCompletion";
import styles from "./editprofile.module.css";

const EditProfilePage = () => {
  const currentUser = useUserStore((state) => state.currentUser); // Auth only
  const { data: profileData, isLoading, error: profileError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const [activeSection, setActiveSection] = useState("personal");
  const [editingSections, setEditingSections] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (profileError) {
      if (profileError.message.includes('401')) {
        navigate("/login");
        return;
      }
      setError("Failed to load profile data. Please try again.");
    }
    
    // Initialize form with profile data when it loads
    if (profileData) {
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          setValue(key, profileData[key]);
        }
      });
    }
  }, [currentUser, navigate, profileError, profileData, setValue]);

  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      const arrayFields = [
        "programmingLanguages",
        "techArea",
        "techStack",
        "languages",
        "otherInterests",
      ];

      arrayFields.forEach((field) => {
        if (profileData[field] && Array.isArray(profileData[field])) {
          setValue(field, profileData[field]);
        }
      });

      Object.keys(profileData).forEach((key) => {
        if (
          profileData[key] !== null &&
          profileData[key] !== undefined &&
          !arrayFields.includes(key)
        ) {
          setValue(key, profileData[key]);
        }
      });
    }
  }, [profileData, setValue]);

  const saveSection = async (sectionData, sectionName) => {
    setError(null);
    setSuccess(null);

    try {
      await updateProfile.mutateAsync(sectionData);
      setSuccess(`${sectionName} updated successfully!`);
      setEditingSections({ ...editingSections, [activeSection]: false });
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving section:", error);
      setError(error.message || "Failed to save changes. Please try again.");
    }
  };

  const saveAllChanges = async (formData) => {
    setError(null);
    setSuccess(null);

    try {
      await updateProfile.mutateAsync(formData);
      setSuccess("Profile updated successfully!");
      setEditingSections({});
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError(error.message || "Failed to save changes. Please try again.");
    }
  };

  const toggleEditing = (section) => {
    setEditingSections({
      ...editingSections,
      [section]: !editingSections[section],
    });
  };

  const profileStats = calculateProfileCompletion(profileData);
  const profileCompletion = profileStats.totalCompletion;
  const isMatchable = profileStats.isMatchable;

  const sections = [
    { id: "personal", title: "Personal Info", icon: "👤" },
    { id: "experience", title: "Experience", icon: "💼" },
    { id: "languages", title: "Programming Languages", icon: "💻" },
    { id: "interests", title: "Tech Interests", icon: "🚀" },
    { id: "stack", title: "Tech Stack", icon: "🛠️" },
    { id: "spoken", title: "Spoken Languages", icon: "🌍" },
    { id: "environment", title: "Development Environment", icon: "⚙️" },
    { id: "gaming", title: "Gaming", icon: "🎮" },
    { id: "other", title: "Other Interests", icon: "🎨" },
    { id: "preferences", title: "Coding Preferences", icon: "⭐" },
  ];

  const renderSectionHeader = (title, sectionKey) => (
    <div className={styles.sectionHeader}>
      <h3>{title}</h3>
      <div className={styles.sectionActions}>
        {!editingSections[sectionKey] ? (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnEdit}`}
            onClick={() => toggleEditing(sectionKey)}
          >
            <Edit3 size={16} />
            Edit
          </button>
        ) : (
          <div className={styles.editActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={() => toggleEditing(sectionKey)}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSave}`}
              onClick={() => {
                const formData = watch();
                const sectionData = getSectionData(sectionKey, formData);
                saveSection(sectionData, title);
              }}
              disabled={updateProfile.isLoading}
            >
              <Check size={16} />
              {updateProfile.isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderGamingSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Gaming Preferences", "gaming")}{" "}
      <div className={styles.radioGroup}>
        {[
          { value: "none", label: "No Gaming" },
          { value: "pc", label: "PC Gaming" },
          { value: "console", label: "Console Gaming" },
          { value: "mobile", label: "Mobile Gaming" },
          { value: "board", label: "Board Games" },
        ].map((option) => (
          <label key={option.value} className={styles.radioLabel}>
            <input
              type="radio"
              value={option.value}
              {...register("gaming")}
              disabled={!editingSections.gaming}
            />
            {option.label}
          </label>
        ))}
      </div>
      {errors.gaming && (
        <span className={styles.error}>{errors.gaming.message}</span>
      )}
    </div>
  );

  const getSectionData = (sectionKey, formData) => {
    const data = {};

    switch (sectionKey) {
      case "personal":
        data.country = formData.country;
        data.city = formData.city;
        data.age = formData.age;
        data.aboutMe = formData.aboutMe;
        break;
      case "experience":
        data.devExperience = formData.devExperience;
        data.status = formData.status;
        break;
      case "languages":
        data.programmingLanguages = Array.isArray(formData.programmingLanguages)
          ? formData.programmingLanguages
          : [];
        console.log("Saving programming languages:", data.programmingLanguages);
        break;
      case "interests":
        data.techArea = Array.isArray(formData.techArea)
          ? formData.techArea
          : [];
        break;
      case "stack":
        data.techStack = Array.isArray(formData.techStack)
          ? formData.techStack
          : [];
        break;
      case "spoken":
        data.languages = Array.isArray(formData.languages)
          ? formData.languages
          : [];
        break;
      case "environment":
        data.preferredOS = formData.preferredOS;
        break;
      case "gaming":
        data.gaming = formData.gaming || "";
        break;
      case "other":
        data.otherInterests = Array.isArray(formData.otherInterests)
          ? formData.otherInterests
          : [];
        break;
      case "preferences":
        data.favoriteTimeToCode = formData.favoriteTimeToCode;
        data.favoriteLineOfCode = formData.favoriteLineOfCode;
        data.favoriteDrinkWhileCoding = formData.favoriteDrinkWhileCoding;
        data.musicGenreWhileCoding = formData.musicGenreWhileCoding;
        data.favoriteShowMovie = formData.favoriteShowMovie;
        break;
      default:
        return formData;
    }

    Object.keys(data).forEach((key) => {
      if (data[key] === undefined || data[key] === null) {
        delete data[key];
      }
    });

    console.log(`Section ${sectionKey} data:`, data);
    return data;
  };

  const renderPersonalSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Personal Information", "personal")}
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label>Country *</label>
          <input
            type="text"
            {...register("country", { required: "Country is required" })}
            placeholder="Enter your country"
            disabled={!editingSections.personal}
          />
          {errors.country && (
            <span className={styles.error}>{errors.country.message}</span>
          )}
        </div>
        <div className={styles.formField}>
          <label>City *</label>
          <input
            type="text"
            {...register("city", { required: "City is required" })}
            placeholder="Enter your city"
            disabled={!editingSections.personal}
          />
          {errors.city && (
            <span className={styles.error}>{errors.city.message}</span>
          )}
        </div>
        <div className={styles.formField}>
          <label>Age</label>
          <input
            type="number"
            min="13"
            max="100"
            {...register("age")}
            placeholder="Enter your age"
            disabled={!editingSections.personal}
          />
        </div>
        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <label>About Me</label>
          <textarea
            rows={4}
            {...register("aboutMe")}
            placeholder="Tell us about yourself..."
            disabled={!editingSections.personal}
          />
        </div>
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Experience & Status", "experience")}
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label>Development Experience *</label>
          <select
            {...register("devExperience", {
              required: "Experience level is required",
            })}
            disabled={!editingSections.experience}
          >
            <option value="">Select Experience Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
          {errors.devExperience && (
            <span className={styles.error}>{errors.devExperience.message}</span>
          )}
        </div>
        <div className={styles.formField}>
          <label>Status *</label>
          <select
            {...register("status", { required: "Status is required" })}
            disabled={!editingSections.experience}
          >
            <option value="">Select Status</option>
            <option value="searchhelp">Seeking Help</option>
            <option value="offerhelp">Offering Help</option>
            <option value="networking">Networking</option>
            <option value="learnpartner">Learning Partner</option>
          </select>
          {errors.status && (
            <span className={styles.error}>{errors.status.message}</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderMultiSelectSection = (
    title,
    fieldName,
    options,
    sectionKey,
    required = false
  ) => {
    const watchedValues = watch(fieldName) || [];

    return (
      <div className={styles.formSection}>
        {renderSectionHeader(title, sectionKey)}
        <div className={styles.checkboxGrid}>
          {options.map((option) => (
            <label key={option} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                value={option}
                checked={watchedValues.includes(option)}
                {...register(
                  fieldName,
                  required
                    ? {
                        required: `At least one ${title.toLowerCase()} is required`,
                      }
                    : {}
                )}
                disabled={!editingSections[sectionKey]}
                onChange={(e) => {
                  const currentValues = watchedValues || [];
                  if (e.target.checked) {
                    setValue(fieldName, [...currentValues, option]);
                  } else {
                    setValue(
                      fieldName,
                      currentValues.filter((v) => v !== option)
                    );
                  }
                }}
              />
              {option}
            </label>
          ))}

          {sectionKey === "techArea" && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                value="other"
                checked={watchedValues.includes("other")}
                {...register(
                  fieldName,
                  required
                    ? {
                        required: `At least one ${title.toLowerCase()} is required`,
                      }
                    : {}
                )}
                disabled={!editingSections[sectionKey]}
                onChange={(e) => {
                  const currentValues = watchedValues || [];
                  if (e.target.checked) {
                    setValue(fieldName, [...currentValues, "other"]);
                  } else {
                    setValue(
                      fieldName,
                      currentValues.filter((v) => v !== "other")
                    );
                  }
                }}
              />
              Other
            </label>
          )}
        </div>
        {required && errors[fieldName] && (
          <span className={styles.error}>{errors[fieldName].message}</span>
        )}
      </div>
    );
  };

  const renderPreferencesSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Coding Preferences", "preferences")}
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label>Favorite Time to Code</label>
          <select
            {...register("favoriteTimeToCode")}
            disabled={!editingSections.preferences}
          >
            <option value="">Select Time</option>
            <option value="earlybird">Early Bird</option>
            <option value="daytime">Daytime</option>
            <option value="nightowl">Night Owl</option>
          </select>
        </div>
        <div className={styles.formField}>
          <label>Favorite Line of Code</label>
          <input
            type="text"
            {...register("favoriteLineOfCode")}
            placeholder="Your favorite code snippet..."
            disabled={!editingSections.preferences}
          />
        </div>
        <div className={styles.formField}>
          <label>Favorite Drink While Coding</label>
          <input
            type="text"
            {...register("favoriteDrinkWhileCoding")}
            placeholder="Coffee, Tea, Energy Drink..."
            disabled={!editingSections.preferences}
          />
        </div>
        <div className={styles.formField}>
          <label>Music Genre While Coding</label>
          <input
            type="text"
            {...register("musicGenreWhileCoding")}
            placeholder="Lo-fi, Rock, Electronic..."
            disabled={!editingSections.preferences}
          />
        </div>
        <div className={styles.formField}>
          <label>Favorite Show/Movie</label>
          <input
            type="text"
            {...register("favoriteShowMovie")}
            placeholder="What do you watch for inspiration?"
            disabled={!editingSections.preferences}
          />
        </div>
      </div>
    </div>
  );

  const renderEnvironmentSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Development Environment", "environment")}
      <div className={styles.radioGroup}>
        {["Windows", "macOS", "Linux", "Other"].map((os) => (
          <label key={os} className={styles.radioLabel}>
            <input
              type="radio"
              value={os}
              {...register("preferredOS", { required: "Please select an OS" })}
              disabled={!editingSections.environment}
            />
            {os}
          </label>
        ))}
      </div>
      {errors.preferredOS && (
        <span className={styles.error}>{errors.preferredOS.message}</span>
      )}
    </div>
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get("section");

    if (section) {
      setActiveSection(section);

      setTimeout(() => {
        const sectionElement = document.getElementById(`section-${section}`);
        if (sectionElement) {
          sectionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, []);

  const renderCurrentSection = () => {
    const sectionContent = (() => {
      switch (activeSection) {
        case "personal":
          return renderPersonalSection();
        case "experience":
          return renderExperienceSection();
        case "languages":
          return renderMultiSelectSection(
            "Programming Languages",
            "programmingLanguages",
            [
              "JavaScript",
              "Python",
              "Java",
              "C++",
              "C#",
              "TypeScript",
              "PHP",
              "Ruby",
              "Go",
              "Rust",
              "Swift",
              "Kotlin",
              "C",
              "Scala",
              "Dart",
            ],
            "languages",
            true
          );
        case "interests":
          return renderMultiSelectSection(
            "Tech Areas of Interest",
            "techArea",
            [
              "Web Development",
              "Mobile Development",
              "Game Development",
              "AI/Machine Learning",
              "Data Science",
              "DevOps",
              "Cybersecurity",
              "Cloud Computing",
              "Blockchain",
              "IoT",
              "AR/VR",
              "Robotics",
            ],
            "interests",
            true
          );
        case "stack":
          return renderMultiSelectSection(
            "Tech Stack & Tools",
            "techStack",
            [
              "React",
              "Vue.js",
              "Angular",
              "Node.js",
              "Express",
              "Django",
              "Flask",
              "Spring Boot",
              "Docker",
              "Kubernetes",
              "AWS",
              "Azure",
              "GCP",
              "MongoDB",
              "PostgreSQL",
              "MySQL",
            ],
            "stack",
            true
          );
        case "spoken":
          return renderMultiSelectSection(
            "Spoken Languages",
            "languages",
            [
              "English",
              "Spanish",
              "French",
              "German",
              "Italian",
              "Portuguese",
              "Russian",
              "Chinese (Mandarin)",
              "Japanese",
              "Korean",
              "Arabic",
              "Hindi",
            ],
            "spoken"
          );
        case "environment":
          return renderEnvironmentSection();
        case "gaming":
          return renderGamingSection();
        case "other":
          return renderMultiSelectSection(
            "Other Interests",
            "otherInterests",
            [
              "Reading",
              "Music",
              "Sports",
              "Photography",
              "Travel",
              "Cooking",
              "Art & Design",
              "Writing",
              "Podcasts",
              "YouTube",
              "Streaming",
              "Fitness",
              "Hiking",
              "Cycling",
            ],
            "other"
          );
        case "preferences":
          return renderPreferencesSection();
        default:
          return renderPersonalSection();
      }
    })();

    return (
      <div id={`section-${activeSection}`} className={styles.sectionContainer}>
        {sectionContent}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`${styles.page} ${styles.loading}`}>
        <div className={styles.loadingSpinner}>Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.editContainer}>
        <div className={styles.sidebar}>
          <div className={styles.darkModeContainer}>
            <DarkMode />
          </div>

          <div
            className={`${styles.profileCompletion} ${
              isMatchable ? styles.matchable : styles.notMatchable
            }`}
          >
            <div
              className={`${styles.completionHeader} ${
                isMatchable ? styles.matchable : styles.notMatchable
              }`}
            >
              {isMatchable ? <Check size={16} /> : <AlertCircle size={16} />}
              Profile Completion
            </div>
            <div className={styles.completionBar}>
              <div
                className={`${styles.completionFill} ${
                  isMatchable ? styles.matchable : styles.notMatchable
                }`}
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <div className={styles.completionText}>
              {profileCompletion}% complete ({profileStats.completedFieldsCount}
              /{profileStats.totalFieldsCount} fields)
              <br />
              {isMatchable ? (
                <span style={{ color: "var(--color-success)" }}>
                  You are able to match!
                </span>
              ) : (
                <span style={{ color: "var(--color-warning)" }}>
                  ❌ {profileStats.missingRequiredFields} required fields
                  missing to match
                </span>
              )}
            </div>
          </div>

          <h2>Edit Profile</h2>
          <ul className={styles.sectionNav}>
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  className={activeSection === section.id ? styles.active : ""}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span>{section.icon}</span>
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1>Edit Your Profile</h1>
          </div>

          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <Check size={16} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(saveAllChanges)}>
            {renderCurrentSection()}

            <div className={styles.actionButtons}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => navigate("/profile")}
              >
                <X size={16} />
                Back to Profile
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={updateProfile.isLoading}
              >
                <Save size={16} />
                {updateProfile.isLoading ? "Saving All Changes..." : "Save All Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
