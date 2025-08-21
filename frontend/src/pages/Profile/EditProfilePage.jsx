import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  Save,
  X,
  Edit3,
  Check,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { API_URL } from "../../lib/config";
import DarkMode from "../../components/DarkMode";
import { calculateProfileCompletion } from "../../utils/profileCompletion";
import styles from "./editprofile.module.css";
import HybridSelector from "../../components/HybridSelector";
import LocationSelector from "../../components/LocationSelector";

const EditProfilePage = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const {
    data: profileData,
    isLoading,
    error: profileError,
    refetch,
  } = useProfile();
  const updateProfile = useUpdateProfile();
  const [activeSection, setActiveSection] = useState("personal");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Watch all form values to detect changes
  const watchedValues = watch();

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

  // Initialize form data and original data when profile loads
  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0 && !isDataLoaded) {
      const arrayFields = [
        "programmingLanguages",
        "techArea",
        "techStack",
        "languages",
        "otherInterests",
      ];

      const initialData = {};

      // Handle array fields
      arrayFields.forEach((field) => {
        const value = profileData[field] || [];
        setValue(field, value);
        initialData[field] = Array.isArray(value) ? [...value] : [];
      });

      // Handle regular fields
      Object.keys(profileData).forEach((key) => {
        if (!arrayFields.includes(key)) {
          const value = profileData[key];
          if (value !== null && value !== undefined) {
            setValue(key, value);
            initialData[key] = value;
          } else {
            setValue(key, "");
            initialData[key] = "";
          }
        }
      });

      setOriginalData(initialData);
      setIsDataLoaded(true);
      setHasUnsavedChanges(false);
    }
  }, [profileData, setValue, isDataLoaded]);

  // Deep comparison function for arrays and objects
  const deepEqual = (a, b) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, index) => {
        if (typeof val === "object" && val !== null) {
          return deepEqual(val, sortedB[index]);
        }
        return val === sortedB[index];
      });
    }

    if (
      typeof a === "object" &&
      typeof b === "object" &&
      a !== null &&
      b !== null
    ) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every((key) => deepEqual(a[key], b[key]));
    }

    return a === b;
  };

  // Detect changes by comparing current form values with original data
  useEffect(() => {
    if (
      !isDataLoaded ||
      !originalData ||
      Object.keys(originalData).length === 0
    ) {
      setHasUnsavedChanges(false);
      return;
    }

    // Only check fields that exist in originalData
    const hasChanges = Object.keys(originalData).some((key) => {
      const currentValue = watchedValues[key];
      const originalValue = originalData[key];

      // Handle undefined/null values
      const normalizedCurrent =
        currentValue === undefined || currentValue === null ? "" : currentValue;
      const normalizedOriginal =
        originalValue === undefined || originalValue === null
          ? ""
          : originalValue;

      // Use deep comparison for arrays and objects
      if (
        Array.isArray(normalizedCurrent) ||
        Array.isArray(normalizedOriginal)
      ) {
        return !deepEqual(normalizedCurrent, normalizedOriginal);
      }

      // Handle regular values
      return normalizedCurrent !== normalizedOriginal;
    });

    setHasUnsavedChanges(hasChanges);
  }, [watchedValues, originalData, isDataLoaded]);

  const saveAllChanges = async (formData) => {
    setError(null);
    setSuccess(null);

    try {
      await updateProfile.mutateAsync(formData);
      setSuccess("Profile updated successfully!");

      // Update original data with saved values and reset change detection
      const newOriginalData = {};
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          newOriginalData[key] = [...formData[key]];
        } else {
          newOriginalData[key] = formData[key];
        }
      });

      setOriginalData(newOriginalData);
      setHasUnsavedChanges(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setError(error.message || "Failed to save changes. Please try again.");
    }
  };

  const handleBackToProfile = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      navigate("/profile");
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedWarning(false);
    navigate("/profile");
  };

  const handleSaveAndExit = async () => {
    try {
      await updateProfile.mutateAsync(watchedValues);
      setShowUnsavedWarning(false);
      navigate("/profile");
    } catch (error) {
      setError(error.message || "Failed to save changes. Please try again.");
      setShowUnsavedWarning(false);
    }
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

  const renderSectionHeader = (title) => (
    <div className={styles.sectionHeader}>
      <h3>{title}</h3>
    </div>
  );

  const renderGamingSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Gaming Preferences")}
      <div className={styles.radioGroup}>
        {[
          { value: "none", label: "No Gaming" },
          { value: "pc", label: "PC Gaming" },
          { value: "console", label: "Console Gaming" },
          { value: "mobile", label: "Mobile Gaming" },
          { value: "board", label: "Board Games" },
        ].map((option) => (
          <label key={option.value} className={styles.radioLabel}>
            <input type="radio" value={option.value} {...register("gaming")} />
            {option.label}
          </label>
        ))}
      </div>
      {errors.gaming && (
        <span className={styles.error}>{errors.gaming.message}</span>
      )}
    </div>
  );

  const renderPersonalSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Personal Information")}
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label>Username *</label>
          <input
            type="text"
            {...register("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
              maxLength: {
                value: 20,
                message: "Username must be less than 20 characters",
              },
            })}
            placeholder="Enter your username"
          />
          {errors.username && (
            <span className={styles.error}>{errors.username.message}</span>
          )}
        </div>
        <div className={styles.formField}>
          <label>Email *</label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            placeholder="Enter your email"
          />
          {errors.email && (
            <span className={styles.error}>{errors.email.message}</span>
          )}
        </div>
        <div className={styles.formField}>
          <label>Location *</label>
          <LocationSelector
            selectedCountry={watch("country") || ""}
            selectedCity={watch("city") || ""}
            onCountryChange={(country) => setValue("country", country)}
            onCityChange={(city) => setValue("city", city)}
            required={true}
          />
        </div>
        <div className={styles.formField}>
          <label>Age</label>
          <input
            type="number"
            min="13"
            max="100"
            {...register("age")}
            placeholder="Enter your age"
          />
        </div>
        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <label>About Me</label>
          <textarea
            rows={4}
            {...register("aboutMe")}
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Experience & Status")}
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label>Development Experience *</label>
          <select
            {...register("devExperience", {
              required: "Experience level is required",
            })}
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
          <select {...register("status", { required: "Status is required" })}>
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
        <HybridSelector
          category={fieldName}
          selectedValues={watchedValues}
          onSelectionChange={(values) => setValue(fieldName, values)}
          maxSelections={null}
          allowMultiple={true}
          showButtons={true}
        />
      </div>
    );
  };

  const renderPreferencesSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Coding Preferences")}
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label>Favorite Time to Code</label>
          <select {...register("favoriteTimeToCode")}>
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
          />
        </div>
        <div className={styles.formField}>
          <label>Favorite Drink While Coding</label>
          <HybridSelector
            category="favoriteDrinkWhileCoding"
            selectedValues={
              watch("favoriteDrinkWhileCoding")
                ? [watch("favoriteDrinkWhileCoding")]
                : []
            }
            onSelectionChange={(values) =>
              setValue("favoriteDrinkWhileCoding", values[0] || "")
            }
            allowMultiple={false}
            showButtons={false}
            placeholder="Coffee, Tea, Energy Drink..."
          />
        </div>
        <div className={styles.formField}>
          <label>Music Genre While Coding</label>
          <HybridSelector
            category="musicGenreWhileCoding"
            selectedValues={
              watch("musicGenreWhileCoding")
                ? [watch("musicGenreWhileCoding")]
                : []
            }
            onSelectionChange={(values) =>
              setValue("musicGenreWhileCoding", values[0] || "")
            }
            allowMultiple={false}
            showButtons={false}
            placeholder="Lo-fi, Rock, Electronic..."
          />
        </div>
        <div className={styles.formField}>
          <label>Favorite Show/Movie</label>
          <HybridSelector
            category="favoriteShowMovie"
            selectedValues={
              watch("favoriteShowMovie") ? [watch("favoriteShowMovie")] : []
            }
            onSelectionChange={(values) =>
              setValue("favoriteShowMovie", values[0] || "")
            }
            allowMultiple={false}
            showButtons={false}
            placeholder="What do you watch for inspiration?"
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

  const renderProgrammingLanguagesSection = () => {
    const watchedValues = watch("programmingLanguages") || [];

    return (
      <div className={styles.formSection}>
        {renderSectionHeader("Programming Languages")}
        <HybridSelector
          category="programmingLanguages"
          selectedValues={watchedValues}
          onSelectionChange={(values) => {
            setValue("programmingLanguages", values);
          }}
          maxSelections={null}
          allowMultiple={true}
          showButtons={true}
          showSkillLevel={true}
        />
      </div>
    );
  };

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
          return renderProgrammingLanguagesSection();
        case "interests":
          return renderMultiSelectSection(
            "Tech Areas of Interest",
            "techArea",
            [],
            "interests",
            true
          );
        case "stack":
          return renderMultiSelectSection(
            "Tech Stack & Tools",
            "techStack",
            [],
            "stack",
            true
          );
        case "spoken":
          return renderMultiSelectSection(
            "Spoken Languages",
            "languages",
            [],
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
            [],
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
                onClick={handleBackToProfile}
              >
                <X size={16} />
                Back to Profile
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={updateProfile.isLoading || !hasUnsavedChanges}
              >
                <Save size={16} />
                {updateProfile.isLoading
                  ? "Saving All Changes..."
                  : hasUnsavedChanges
                  ? "Save All Changes"
                  : "No Changes to Save"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <AlertTriangle size={24} />
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowUnsavedWarning(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <h3>Unsaved Changes</h3>
              <p>
                You have unsaved changes that will be lost if you leave this
                page. Would you like to save your changes before leaving?
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancel}
                onClick={handleDiscardChanges}
                disabled={updateProfile.isLoading}
              >
                Discard Changes
              </button>
              <button
                className={styles.btnSave}
                onClick={handleSaveAndExit}
                disabled={updateProfile.isLoading}
              >
                <Save size={16} />
                {updateProfile.isLoading ? "Saving..." : "Save & Exit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfilePage;
