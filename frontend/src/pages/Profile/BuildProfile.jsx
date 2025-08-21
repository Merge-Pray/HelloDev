import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, X, AlertTriangle } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { useUpdateProfile } from "../../hooks/useProfile";
import styles from "./buildprofile.module.css";
import { API_URL } from "../../lib/config";
import HybridSelector from "../../components/HybridSelector";
import LocationSelector from "../../components/LocationSelector";

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Personal Information",
    subtitle: "Tell us a bit about yourself",
    type: "mixed",
    fields: [
      {
        name: "location",
        label: "Location",
        type: "location",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["searchhelp", "offerhelp", "networking", "learnpartner"],
      },
    ],
  },
  {
    id: 2,
    title: "Development Experience",
    subtitle: "How would you describe your programming experience?",
    type: "radio",
    fieldName: "devExperience",
    options: ["beginner", "intermediate", "expert"],
  },
  {
    id: 3,
    title: "Tech Areas of Interest",
    subtitle: "What areas of technology interest you most? (Select as many as you want)",
    type: "hybrid-selector",
    fieldName: "techArea",
    maxSelections: null,
  },
  {
    id: 4,
    title: "Programming Languages",
    subtitle:
      "Which programming languages do you know? Select and rate your skill level (1-10)",
    type: "programming-languages",
    fieldName: "programmingLanguages",
    maxSelections: null,
  },
  {
    id: 5,
    title: "Tech Stack & Tools",
    subtitle: "What technologies and tools do you work with? (Select as many as you want)",
    type: "hybrid-selector",
    fieldName: "techStack",
    maxSelections: null,
  },
  {
    id: 6,
    title: "Preferred Operating System",
    subtitle: "What OS do you prefer for development?",
    type: "radio",
    fieldName: "preferredOS",
    options: ["Windows", "macOS", "Linux", "Other"],
  },
];

export default function BuildProfile() {
  const currentUser = useUserStore((state) => state.currentUser);
  const updateProfile = useUpdateProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [error, setError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false); // ✅ NEU
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const currentStepData = ONBOARDING_STEPS.find(
    (step) => step.id === currentStep
  );
  const isLastStep = currentStep === ONBOARDING_STEPS.length;

  const fieldName = currentStepData?.fieldName;
  const watchedField = watch(fieldName);

  useEffect(() => {
    if (fieldName && watchedField) {
      const count = Array.isArray(watchedField) ? watchedField.length : 0;
      setSelectedCount(count);
    } else {
      setSelectedCount(0);
    }
  }, [watchedField, fieldName]);

  useEffect(() => {
    reset();
    setSelectedCount(0);
  }, [currentStep, reset]);

  const handleNext = useCallback(
    async (data) => {
      setError(null);

      let newProfileData;

      if (currentStepData.type === "mixed") {
        newProfileData = {
          ...profileData,
          ...data,
        };
      } else {
        const stepData = data[fieldName];
        newProfileData = {
          ...profileData,
          [fieldName]: stepData,
        };
      }

      setProfileData(newProfileData);

      if (isLastStep) {
        setIsLoading(true);
        try {
          console.log("Sending profile data:", newProfileData);

          await updateProfile.mutateAsync(newProfileData);

          console.log("Profile saved successfully");
          navigate("/profile");
        } catch (error) {
          console.error("Profile creation error:", error);
          setError(
            error.message || "Failed to save profile. Please try again."
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    },
    [currentStepData, profileData, fieldName, isLastStep, currentUser, navigate]
  );

  const handleCancel = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const confirmCancel = useCallback(() => {
    setShowCancelDialog(false);
    navigate("/profile");
  }, [navigate]);

  const stayInOnboarding = useCallback(() => {
    setShowCancelDialog(false);
  }, []);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const onSubmit = useCallback(
    (data) => {
      console.log("Form submitted with data:", data);
      handleNext(data);
    },
    [handleNext]
  );

  const renderMixedFields = () => {
    return (
      <div className={styles.mixedFields}>
        {currentStepData.fields.map((field) => {
          if (field.type === "location") {
            return (
              <div key={field.name} className="form-field">
                <label>{field.label}</label>
                <LocationSelector
                  selectedCountry={watch('country') || profileData.country || ''}
                  selectedCity={watch('city') || profileData.city || ''}
                  onCountryChange={(country) => {
                    setProfileData({...profileData, country});
                    setValue('country', country);
                  }}
                  onCityChange={(city) => {
                    setProfileData({...profileData, city});
                    setValue('city', city);
                  }}
                  required={field.required}
                />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.name} className="form-field">
                <label>{field.label}</label>
                <select
                  className="form-input"
                  {...register(field.name, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                  })}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors[field.name] && (
                  <div className="form-hint">{errors[field.name].message}</div>
                )}
              </div>
            );
          }

          return (
            <div key={field.name} className="form-field">
              <label>{field.label}</label>
              <input
                className="form-input"
                type={field.type}
                {...register(field.name, {
                  required: field.required
                    ? `${field.label} is required`
                    : false,
                })}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
              {errors[field.name] && (
                <div className="form-hint">{errors[field.name].message}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderProgrammingLanguages = () => {
    const selectedValues = watchedField || [];

    return (
      <div className={styles.programmingLanguagesContainer}>
        <div className={styles.programmingLanguagesGrid}>
          {currentStepData.options.map((language, index) => {
            const inputId = `${fieldName}-${index}`;
            const selectedEntry = selectedValues.find((item) =>
              Array.isArray(item) ? item[0] === language : item === language
            );
            const isSelected = !!selectedEntry;
            const currentSkillLevel = Array.isArray(selectedEntry)
              ? selectedEntry[1]
              : 5;
            return (
              <div
                key={language}
                className={`${styles.programmingLanguageCard} ${
                  isSelected ? styles.selected : ""
                }`}
              >
                <div className={styles.languageHeader}>
                  <input
                    type="checkbox"
                    id={inputId}
                    checked={isSelected}
                    {...register(fieldName, {
                      required:
                        "Please select at least one programming language",
                    })}
                    onChange={(e) => {
                      const currentValues = selectedValues || [];
                      if (e.target.checked) {
                        // Hinzufügen mit Default Skill Level 5
                        const newValues = [...currentValues, [language, 5]];
                        setValue(fieldName, newValues);
                      } else {
                        // Entfernen
                        const newValues = currentValues.filter((item) =>
                          Array.isArray(item)
                            ? item[0] !== language
                            : item !== language
                        );
                        setValue(fieldName, newValues);
                      }
                    }}
                  />
                  <label htmlFor={inputId} className={styles.languageLabel}>
                    {language}
                  </label>
                </div>

                {/* ✅ Skill Level Slider */}
                {isSelected && (
                  <div className={styles.skillSection}>
                    <div className={styles.skillHeader}>
                      <span>Skill Level</span>
                      <span className={styles.skillValue}>
                        {currentSkillLevel}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={currentSkillLevel}
                      className={styles.skillSlider}
                      onChange={(e) => {
                        const newLevel = parseInt(e.target.value);
                        const currentValues = selectedValues || [];
                        const newValues = currentValues.map((item) => {
                          if (Array.isArray(item) && item[0] === language) {
                            return [language, newLevel];
                          }
                          return item;
                        });
                        setValue(fieldName, newValues);
                      }}
                    />
                    <div className={styles.skillLabels}>
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentStepData.maxSelections && (
          <div className={styles.selectionCounter}>
            {selectedValues.length}/{currentStepData.maxSelections} selected
          </div>
        )}
      </div>
    );
  };

  // ✅ ÄNDERE renderOptions Funktion:
  const renderOptions = () => {
    const inputType = currentStepData.type;
    const maxSelections = currentStepData.maxSelections;
    const selectedValues = watchedField || [];

    // ✅ Spezielle Behandlung für Programming Languages
    if (inputType === "programming-languages") {
      return (
        <HybridSelector
          category="programmingLanguages"
          selectedValues={selectedValues}
          onSelectionChange={(values) => {
            setProfileData({...profileData, programmingLanguages: values});
            setValue('programmingLanguages', values);
          }}
          maxSelections={currentStepData.maxSelections}
          allowMultiple={true}
          showButtons={true}
          showSkillLevel={true}
        />
      );
    }

    if (inputType === "hybrid-selector") {
      return (
        <HybridSelector
          category={currentStepData.fieldName}
          selectedValues={watchedField || []}
          onSelectionChange={(values) => {
            setProfileData({...profileData, [currentStepData.fieldName]: values});
            setValue(currentStepData.fieldName, values);
          }}
          maxSelections={currentStepData.maxSelections}
          allowMultiple={true}
          showButtons={true}
        />
      );
    }

    return (
      <>
        <div className={styles.optionsGrid}>
          {currentStepData.options.map((option, index) => {
            const inputId = `${fieldName}-${index}`;
            const isCheckbox = inputType === "checkbox";
            const isSelected = isCheckbox
              ? selectedValues.includes(option)
              : selectedValues === option;
            const isDisabled =
              isCheckbox &&
              maxSelections &&
              selectedCount >= maxSelections &&
              !selectedValues.includes(option);

            return (
              <div
                key={option}
                className={`${styles.optionItem} ${
                  isDisabled ? styles.disabled : ""
                } ${isSelected ? styles.selected : ""}`}
              >
                <input
                  type={inputType}
                  id={inputId}
                  value={option}
                  disabled={isDisabled}
                  {...register(fieldName, {
                    required: "Please select at least one option",
                  })}
                />
                <label htmlFor={inputId}>{option}</label>
              </div>
            );
          })}
        </div>

        {maxSelections && (
          <div className={styles.selectionCounter}>
            {selectedCount}/{maxSelections} selected
          </div>
        )}
      </>
    );
  };

  return (
    <div className="page centered">
      <div className={`card enhanced ${styles.buildCard}`}>
        <div className={styles.stepCounter}>
          {currentStep} of {ONBOARDING_STEPS.length}
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${(currentStep / ONBOARDING_STEPS.length) * 100}%`,
            }}
          />
        </div>

        <div className={styles.welcomeText}>
          Welcome, {currentUser?.nickname || currentUser?.username || "Developer"}! 👋
        </div>

        <h1 className="title">{currentStepData?.title}</h1>
        <p className="subtitle">{currentStepData?.subtitle}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStepData?.type === "mixed"
            ? renderMixedFields()
            : renderOptions()}

          <div className={styles.buttonGroup}>
            {currentStep > 1 && (
              <button
                type="button"
                className={styles.btnBack}
                onClick={handleBack}
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || updateProfile.isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? (
                "Saving Profile..."
              ) : isLastStep ? (
                <>
                  <Check size={16} />
                  Complete Profile
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          Complete your basic profile to get started. You can add more details
          later!
        </div>
      </div>

      {/* ✅ NEU: Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog}>
            <div className={styles.dialogHeader}>
              <AlertTriangle size={24} className={styles.warningIcon} />
              <h3>Cancel Profile Setup?</h3>
            </div>
            <div className={styles.dialogContent}>
              <div className={styles.warningBox}>
                <h4>⚠️ Important Information</h4>
                <ul className={styles.warningList}>
                  <li>
                    <strong>All unsaved changes will be lost</strong> - Your
                    progress in this session won't be saved
                  </li>
                  <li>
                    <strong>You need 50% profile completion to match</strong> -
                    Without basic info, you can't connect with other developers
                  </li>
                  <li>
                    <strong>You'll need to edit your profile manually</strong> -
                    Complete setup through the Edit Profile page
                  </li>
                </ul>
              </div>

              <div className={styles.recommendationBox}>
                <h4>💡 We recommend completing the setup now</h4>
                <p>
                  It only takes 2-3 minutes and you'll be ready to match
                  immediately!
                </p>
              </div>
            </div>
            <div className={styles.dialogActions}>
              <button className="btn btn-primary" onClick={stayInOnboarding}>
                Continue Setup
              </button>
              <button className="btn btn-secondary" onClick={confirmCancel}>
                Skip to Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
