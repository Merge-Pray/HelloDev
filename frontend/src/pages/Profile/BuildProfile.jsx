import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, X, AlertTriangle } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { useUpdateProfile } from "../../hooks/useProfile";
import { authenticatedFetch } from "../../utils/authenticatedFetch";
import styles from "./buildprofile.module.css";
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
        name: "nickname",
        label: "Nickname",
        type: "text",
        required: true,
        placeholder: "Enter your display name (how others see you)",
      },
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
        options: [
          { value: "searchhelp", label: "Seeking Help" },
          { value: "offerhelp", label: "Offering Help" },
          { value: "networking", label: "Networking" },
          { value: "learnpartner", label: "Learning Partner" },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Development Experience",
    subtitle: "How would you describe your programming experience?",
    type: "radio",
    fieldName: "devExperience",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "expert", label: "Expert" },
    ],
  },
  {
    id: 3,
    title: "Tech Areas of Interest",
    subtitle:
      "What areas of technology interest you most? (Select as many as you want)",
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
    subtitle:
      "What technologies and tools do you work with? (Select as many as you want)",
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
    options: [
      { value: "Windows", label: "Windows" },
      { value: "macOS", label: "macOS" },
      { value: "Linux", label: "Linux" },
      { value: "Other", label: "Other" },
    ],
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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const userData = await authenticatedFetch("/api/user/user");
        setUserProfileData(userData);

        setProfileData((prev) => ({
          ...prev,
          username: userData.username,
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again.");
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

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

    if (currentStepData.type === "mixed") {
      currentStepData.fields.forEach((field) => {
        if (field.type !== "location" && profileData[field.name]) {
          setValue(field.name, profileData[field.name]);
        }
      });
    } else if (fieldName && profileData[fieldName]) {
      setTimeout(() => {
        setValue(fieldName, profileData[fieldName]);
      }, 10);
    }

    setSelectedCount(0);
  }, [currentStep, reset, setValue, profileData, currentStepData, fieldName]);

  const handleNext = useCallback(
    async (data) => {
      setError(null);

      let newProfileData;

      if (currentStepData.type === "mixed") {
        const { country, city, ...otherFormData } = data;

        newProfileData = {
          ...profileData,
          ...otherFormData,
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
          await updateProfile.mutateAsync(newProfileData);
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
    [
      currentStepData,
      profileData,
      fieldName,
      isLastStep,
      navigate,
      updateProfile,
    ]
  );

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      const currentFormData = watch();

      let updatedProfileData;

      if (currentStepData.type === "mixed") {
        const { country, city, ...otherFormData } = currentFormData;

        updatedProfileData = {
          ...profileData,
          ...otherFormData,
        };
      } else if (fieldName && currentFormData[fieldName] !== undefined) {
        updatedProfileData = {
          ...profileData,
          [fieldName]: currentFormData[fieldName],
        };
      } else {
        updatedProfileData = profileData;
      }

      setProfileData(updatedProfileData);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, profileData, currentStepData, fieldName, watch]);

  const confirmCancel = useCallback(async () => {
    setShowCancelDialog(false);

    try {
      const fallbackData = {
        nickname: userProfileData?.username || currentUser?.username || "",
      };

      await updateProfile.mutateAsync(fallbackData);
    } catch (error) {
      console.error("Error setting fallback nickname:", error);
    }

    navigate("/profile");
  }, [navigate, updateProfile, userProfileData, currentUser]);

  const handleCancel = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const stayInOnboarding = useCallback(() => {
    setShowCancelDialog(false);
  }, []);

  const onSubmit = useCallback(
    async (data) => {
      if (
        currentStepData.type === "hybrid-selector" ||
        currentStepData.type === "programming-languages"
      ) {
        const selectedValues = profileData[currentStepData.fieldName] || [];
        if (selectedValues.length === 0) {
          setError("Please select at least one option before continuing.");
          return;
        }
      }

      if (currentStepData.type === "mixed") {
        if (!profileData.country || !profileData.city) {
          setError("Please select your location before continuing.");
          return;
        }
      }

      setError(null);
      handleNext(data);
    },
    [handleNext, currentStepData, profileData]
  );

  const handleCountryChange = useCallback((country) => {
    setProfileData((prev) => ({ ...prev, country, city: "" }));
  }, []);

  const handleCityChange = useCallback((city) => {
    setProfileData((prev) => ({ ...prev, city }));
  }, []);

  const renderMixedFields = () => {
    return (
      <div className={styles.mixedFields}>
        {currentStepData.fields.map((field) => {
          if (field.type === "location") {
            return (
              <div key={field.name} className="form-field">
                <label>{field.label}</label>
                <LocationSelector
                  selectedCountry={profileData.country || ""}
                  selectedCity={profileData.city || ""}
                  onCountryChange={handleCountryChange}
                  onCityChange={handleCityChange}
                  required={field.required}
                />

                {!profileData.country && (
                  <div className="form-hint">Country is required</div>
                )}
                {profileData.country && !profileData.city && (
                  <div className="form-hint">City is required</div>
                )}
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
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors[field.name] && (
                  <div className="form-hint">{errors[field.name].message}</div>
                )}
              </div>
            );
          }

          if (field.name === "nickname") {
            return (
              <div key={field.name} className="form-field">
                <label>{field.label}</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder={
                    field.placeholder ||
                    `Enter your ${field.label.toLowerCase()}`
                  }
                  {...register(field.name, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                    minLength: {
                      value: 2,
                      message: "Nickname must be at least 2 characters",
                    },
                    maxLength: {
                      value: 25,
                      message: "Nickname must be less than 25 characters",
                    },
                  })}
                />
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
                placeholder={
                  field.placeholder || `Enter your ${field.label.toLowerCase()}`
                }
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

  const renderOptions = () => {
    const inputType = currentStepData.type;
    const maxSelections = currentStepData.maxSelections;
    const selectedValues = watchedField || [];

    if (inputType === "programming-languages") {
      return (
        <HybridSelector
          category="programmingLanguages"
          selectedValues={profileData.programmingLanguages || []}
          onSelectionChange={(values) => {
            setProfileData({ ...profileData, programmingLanguages: values });
            setValue("programmingLanguages", values);
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
          selectedValues={profileData[currentStepData.fieldName] || []}
          onSelectionChange={(values) => {
            setProfileData({
              ...profileData,
              [currentStepData.fieldName]: values,
            });
            setValue(currentStepData.fieldName, values);
          }}
          maxSelections={currentStepData.maxSelections}
          allowMultiple={true}
          showButtons={true}
        />
      );
    }

    if (inputType === "radio") {
      const currentValue = watchedField || profileData[fieldName];

      return (
        <div className={styles.optionsGrid}>
          {currentStepData.options.map((option, index) => {
            const optionValue =
              typeof option === "object" ? option.value : option;
            const optionLabel =
              typeof option === "object" ? option.label : option;
            const inputId = `${fieldName}-${index}`;
            const isSelected = currentValue === optionValue;

            return (
              <div
                key={optionValue}
                className={`${styles.optionItem} ${
                  isSelected ? styles.selected : ""
                }`}
                onClick={() => {
                  setValue(fieldName, optionValue);
                  setProfileData((prev) => ({
                    ...prev,
                    [fieldName]: optionValue,
                  }));
                }}
              >
                <input
                  type="radio"
                  id={inputId}
                  value={optionValue}
                  checked={isSelected}
                  onChange={() => {
                    setValue(fieldName, optionValue);
                    setProfileData((prev) => ({
                      ...prev,
                      [fieldName]: optionValue,
                    }));
                  }}
                  {...register(fieldName, {
                    required: "Please select an option",
                  })}
                />
                <label
                  htmlFor={inputId}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  {optionLabel}
                </label>
              </div>
            );
          })}
        </div>
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
          Welcome,{" "}
          {currentUser?.nickname || currentUser?.username || "Developer"}! 👋
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
                    <strong>Your nickname will be set to your username</strong>{" "}
                    - You can change this later in your profile settings
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
