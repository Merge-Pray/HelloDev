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
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";

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
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      programmingLanguages: [],
      techArea: [],
      techStack: [],
      languages: [],
      otherInterests: [],
      personalWebsites: [],
      username: "",
      nickname: "",
      email: "",
      country: "",
      city: "",
      age: "",
      aboutMe: "",
      devExperience: "",
      status: "",
      gaming: "",
      preferredOS: "",
      favoriteTimeToCode: "",
      favoriteLineOfCode: "",
      favoriteDrinkWhileCoding: "",
      musicGenreWhileCoding: "",
      favoriteShowMovie: "",
      linkedinProfile: "",
      githubProfile: "",
      profileLinksVisibleToContacts: false,
    },
  });

  const watchedValues = watch();

  // Reset States beim Verlassen der Komponente
  useEffect(() => {
    return () => {
      setIsDataLoaded(false);
      setHasUnsavedChanges(false);
      setOriginalData({});
      setError(null);
      setSuccess(null);
    };
  }, []);

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

  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      // Reset form state when profileData changes
      if (!isDataLoaded) {
        const arrayFields = [
          "programmingLanguages",
          "techArea",
          "techStack",
          "languages",
          "otherInterests",
          "personalWebsites",
        ];

        const initialData = {};
        const formData = {};

        arrayFields.forEach((field) => {
          const value = profileData[field] || [];
          const normalizedValue = Array.isArray(value) ? value : [];
          formData[field] = normalizedValue;
          initialData[field] = [...normalizedValue];
        });

        Object.keys(profileData).forEach((key) => {
          if (!arrayFields.includes(key)) {
            const value = profileData[key];
            const normalizedValue =
              value !== null && value !== undefined ? value : "";
            formData[key] = normalizedValue;
            initialData[key] = normalizedValue;
          }
        });

        // Handle nickname default
        if (!profileData.nickname || profileData.nickname.trim() === "") {
          const defaultNickname = profileData.username || "";
          formData.nickname = defaultNickname;
          initialData.nickname = defaultNickname;
        }

        // Reset the form with all data at once
        reset(formData);
        setOriginalData(initialData);
        setIsDataLoaded(true);
        setHasUnsavedChanges(false);
      }
    }
  }, [profileData, reset, isDataLoaded]);

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

  useEffect(() => {
    if (
      !isDataLoaded ||
      !originalData ||
      Object.keys(originalData).length === 0
    ) {
      setHasUnsavedChanges(false);
      return;
    }

    const hasChanges = Object.keys(originalData).some((key) => {
      const currentValue = watchedValues[key];
      const originalValue = originalData[key];

      const normalizedCurrent =
        currentValue === undefined || currentValue === null ? "" : currentValue;
      const normalizedOriginal =
        originalValue === undefined || originalValue === null
          ? ""
          : originalValue;

      if (
        Array.isArray(normalizedCurrent) ||
        Array.isArray(normalizedOriginal)
      ) {
        return !deepEqual(normalizedCurrent, normalizedOriginal);
      }

      return normalizedCurrent !== normalizedOriginal;
    });

    setHasUnsavedChanges(hasChanges);
  }, [watchedValues, originalData, isDataLoaded]);

  const saveAllChanges = async (formData) => {
    setError(null);
    setSuccess(null);

    try {
      const processedData = { ...formData };

      if (!processedData.nickname || processedData.nickname.trim() === "") {
        processedData.nickname =
          processedData.username || profileData?.username || "";
      }

      await updateProfile.mutateAsync(processedData);
      setSuccess("Profile updated successfully!");

      const newOriginalData = {};
      Object.keys(processedData).forEach((key) => {
        if (Array.isArray(processedData[key])) {
          newOriginalData[key] = [...processedData[key]];
        } else {
          newOriginalData[key] = processedData[key];
        }
      });

      setOriginalData(newOriginalData);
      setHasUnsavedChanges(false);

      setTimeout(async () => {
        try {
          await refetch();
          setSuccess(null);
        } catch (error) {
          console.error("Error refetching profile data:", error);
        }
      }, 1000);
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

  // Safe calculation with fallback
  const profileStats = profileData
    ? calculateProfileCompletion(profileData)
    : {
        totalCompletion: 0,
        isMatchable: false,
        completedFieldsCount: 0,
        totalFieldsCount: 0,
        missingRequiredFields: 0,
        missingRequiredFieldsList: [],
      };
  const profileCompletion = profileStats.totalCompletion;
  const isMatchable = profileStats.isMatchable;

  const sections = [
    { id: "personal", title: "Personal Info" },
    { id: "experience", title: "Experience" },
    { id: "languages", title: "Programming Languages" },
    { id: "interests", title: "Tech Interests" },
    { id: "stack", title: "Tech Stack" },
    { id: "spoken", title: "Spoken Languages" },
    { id: "environment", title: "Development Environment" },
    { id: "gaming", title: "Gaming" },
    { id: "other", title: "Other Interests" },
    { id: "preferences", title: "Coding Preferences" },
    { id: "professional", title: "Professional Links" },
  ];

  const renderSectionHeader = (title) => (
    <div className={styles.sectionHeader}>
      <h3>{title}</h3>
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
        <div className={styles.hybridSelectorContainer}>
          <HybridSelector
            category={fieldName}
            selectedValues={watchedValues}
            onSelectionChange={(values) => setValue(fieldName, values)}
            maxSelections={null}
            allowMultiple={true}
            showButtons={true}
          />
        </div>
      </div>
    );
  };

  const renderProgrammingLanguagesSection = () => {
    const watchedValues = watch("programmingLanguages") || [];

    return (
      <div className={styles.formSection}>
        {renderSectionHeader("Programming Languages")}
        <div className={styles.hybridSelectorContainer}>
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
      </div>
    );
  };

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
            <span className={styles.radioText}>{option.label}</span>
          </label>
        ))}
      </div>
      {errors.gaming && (
        <span className={styles.error}>{errors.gaming.message}</span>
      )}
    </div>
  );

  const renderEnvironmentSection = () => (
    <div className={styles.formSection}>
      {renderSectionHeader("Development Environment")}
      <div className={styles.radioGroup}>
        {["Windows", "macOS", "Linux", "Other"].map((os) => (
          <label key={os} className={styles.radioLabel}>
            <input
              type="radio"
              value={os}
              {...register("preferredOS", { required: "Please select an OS" })}
            />
            <span className={styles.radioText}>{os}</span>
          </label>
        ))}
      </div>
      {errors.preferredOS && (
        <span className={styles.error}>{errors.preferredOS.message}</span>
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
                value: 50, // Erhöht für E-Mail-Adressen von Google-Accounts
                message: "Username must be less than 50 characters",
              },

              onChange: (e) => {
                const newUsername = e.target.value;
                const currentNickname = watch("nickname");

                if (currentNickname === profileData?.username) {
                  setValue("nickname", newUsername);
                }
              },
            })}
            placeholder="Enter your username"
          />
          {errors.username && (
            <span className={styles.error}>{errors.username.message}</span>
          )}
        </div>

        <div className={styles.formField}>
          <label>
            Nickname *
            <span className={styles.defaultIndicator}>
              {" "}
              (Default: {profileData?.username})
            </span>
          </label>
          <input
            type="text"
            {...register("nickname", {
              required: "Nickname is required",
              minLength: {
                value: 2,
                message: "Nickname must be at least 2 characters",
              },
              maxLength: {
                value: 25,
                message: "Nickname must be less than 25 characters",
              },

              validate: (value) => {
                const trimmedValue = value?.trim();
                if (!trimmedValue) {
                  return "Nickname is required";
                }
                if (trimmedValue.length < 2) {
                  return "Nickname must be at least 2 characters";
                }
                if (trimmedValue.length > 25) {
                  return "Nickname must be less than 25 characters";
                }
                return true;
              },
            })}
            placeholder={`Default: ${profileData?.username} (or enter custom nickname)`}
          />
          {errors.nickname && (
            <span className={styles.error}>{errors.nickname.message}</span>
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

  const renderProfessionalLinksSection = () => {
    const personalWebsites = watch("personalWebsites") || [];
    const profileLinksVisible = watch("profileLinksVisibleToContacts");

    const addPersonalWebsite = () => {
      const currentWebsites = watch("personalWebsites") || [];
      setValue("personalWebsites", [...currentWebsites, ""]);
    };

    const removePersonalWebsite = (index) => {
      const currentWebsites = watch("personalWebsites") || [];
      const newWebsites = currentWebsites.filter((_, i) => i !== index);
      setValue("personalWebsites", newWebsites);
    };

    const updatePersonalWebsite = (index, value) => {
      const currentWebsites = watch("personalWebsites") || [];
      const newWebsites = [...currentWebsites];
      newWebsites[index] = value;
      setValue("personalWebsites", newWebsites);
    };

    return (
      <div className={styles.formSection}>
        {renderSectionHeader("Professional Links")}

        <div className={styles.visibilityInfo}>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-text-secondary)",
              marginBottom: "16px",
            }}
          >
            Your professional links are private and will only be visible to your
            contacts if you enable the option below. Links may contain real
            names, so they're hidden by default for privacy.
          </p>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label>LinkedIn Profile</label>
            <input
              type="url"
              {...register("linkedinProfile", {
                pattern: {
                  value: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
                  message: "Please enter a valid LinkedIn URL",
                },
              })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {errors.linkedinProfile && (
              <span className={styles.error}>
                {errors.linkedinProfile.message}
              </span>
            )}
          </div>

          <div className={styles.formField}>
            <label>GitHub Profile</label>
            <input
              type="url"
              {...register("githubProfile", {
                pattern: {
                  value: /^https?:\/\/(www\.)?github\.com\/.+/i,
                  message: "Please enter a valid GitHub URL",
                },
              })}
              placeholder="https://github.com/yourusername"
            />
            {errors.githubProfile && (
              <span className={styles.error}>
                {errors.githubProfile.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.formField}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <label>Personal Websites/Portfolios</label>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ fontSize: "12px", padding: "4px 8px" }}
              onClick={addPersonalWebsite}
            >
              <Plus size={14} />
              Add Website
            </button>
          </div>
          {personalWebsites.map((website, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
            >
              <input
                type="url"
                value={website}
                onChange={(e) => updatePersonalWebsite(index, e.target.value)}
                placeholder="https://yourwebsite.com"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                style={{ padding: "8px" }}
                onClick={() => removePersonalWebsite(index)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {personalWebsites.length === 0 && (
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-secondary)",
                fontStyle: "italic",
              }}
            >
              No personal websites added yet
            </p>
          )}
        </div>

        <div className={styles.formField} style={{ marginTop: "24px" }}>
          <label className={styles.checkboxLabel} style={{ color: "var(--color-text)" }}>
            <input
              type="checkbox"
              {...register("profileLinksVisibleToContacts")}
              style={{ marginRight: "8px" }}
            />
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text)" }}>
              {profileLinksVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              Make my professional links visible to contacts
            </span>
          </label>
          <div
            style={{
              fontSize: "12px",
              color: "var(--color-text-secondary)",
              marginTop: "4px",
              marginLeft: "24px",
            }}
          >
            When enabled, your contacts will be able to see all your
            professional links. When disabled, all links remain private.
          </div>
        </div>
      </div>
    );
  };

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
        case "professional":
          return renderProfessionalLinksSection();
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

  if (isLoading) {
    return (
      <div className={`${styles.page} ${styles.loading}`}>
        <div className="card enhanced">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loading-spinner"></div>
            <p>Loading profile data...</p>
          </div>
        </div>
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
                  ✅ You are able to match!
                </span>
              ) : (
                <div className={styles.missingFieldsInfo}>
                  <span style={{ color: "var(--color-warning)" }}>
                    ❌ {profileStats.missingRequiredFields} required fields
                    missing to match
                  </span>

                  {profileStats.missingRequiredFieldsList &&
                    profileStats.missingRequiredFieldsList.length > 0 && (
                      <div className={styles.missingFieldsList}>
                        <strong>Missing required fields:</strong>
                        <ul>
                          {profileStats.missingRequiredFieldsList.map(
                            ({ field, label }) => (
                              <li key={field}>
                                <button
                                  type="button"
                                  className={styles.missingFieldLink}
                                  onClick={() => {
                                    const sectionMap = {
                                      country: "personal",
                                      city: "personal",
                                      status: "experience",
                                      devExperience: "experience",
                                      techArea: "interests",
                                      programmingLanguages: "languages",
                                      techStack: "stack",
                                      preferredOS: "environment",
                                    };
                                    setActiveSection(
                                      sectionMap[field] || "personal"
                                    );
                                  }}
                                >
                                  {label}
                                </button>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.defaultValuesInfo}>
            <div className={styles.infoHeader}>
              <AlertCircle size={14} />
              Default Values
            </div>
            <div className={styles.infoText}>
              Some fields are pre-filled with default values. You can customize
              them to better represent yourself.
            </div>
          </div>

          <h2>Edit Profile</h2>
          <ul className={styles.sectionNav}>
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  className={`${
                    activeSection === section.id ? styles.active : ""
                  } ${
                    profileStats.missingRequiredFieldsList?.some(
                      ({ field }) => {
                        const sectionMap = {
                          personal: ["country", "city"],
                          experience: ["status", "devExperience"],
                          interests: ["techArea"],
                          languages: ["programmingLanguages"],
                          stack: ["techStack"],
                          environment: ["preferredOS"],
                        };
                        return sectionMap[section.id]?.includes(field);
                      }
                    )
                      ? styles.hasRequiredFields
                      : ""
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.title}

                  {profileStats.missingRequiredFieldsList?.some(({ field }) => {
                    const sectionMap = {
                      personal: ["country", "city"],
                      experience: ["status", "devExperience"],
                      interests: ["techArea"],
                      languages: ["programmingLanguages"],
                      stack: ["techStack"],
                      environment: ["preferredOS"],
                    };
                    return sectionMap[section.id]?.includes(field);
                  }) && <span className={styles.requiredBadge}>!</span>}
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
                className={`${styles.btn} ${styles.btnPrimary} ${
                  updateProfile.isLoading ? styles.loading : ""
                }`}
                disabled={updateProfile.isLoading || !hasUnsavedChanges}
              >
                {updateProfile.isLoading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Saving...
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                ) : (
                  "No Changes to Save"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

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
