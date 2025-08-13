import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import styles from "./BuildProfile.module.css";
import { API_URL } from "../../lib/config";

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Personal Information",
    subtitle: "Tell us a bit about yourself",
    type: "mixed",
    fields: [
      {
        name: "country",
        label: "Country",
        type: "text",
        required: true,
      },
      {
        name: "city",
        label: "City",
        type: "text",
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
    subtitle: "What areas of technology interest you most? (Select up to 3)",
    type: "checkbox",
    fieldName: "techArea",
    maxSelections: 3,
    options: [
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
      "Desktop Applications",
    ],
  },
  {
    id: 4,
    title: "Programming Languages",
    subtitle: "Which programming languages do you know? (Select up to 5)",
    type: "checkbox",
    fieldName: "programmingLanguages",
    maxSelections: 5,
    options: [
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
  },
  {
    id: 5,
    title: "Tech Stack & Tools",
    subtitle: "What technologies and tools do you work with? (Select up to 5)",
    type: "checkbox",
    fieldName: "techStack",
    maxSelections: 5,
    options: [
      "React",
      "Vue.js",
      "Angular",
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring Boot",
      "Laravel",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Git",
    ],
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
  const { currentUser, setCurrentUser } = useUserStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const currentStepData = ONBOARDING_STEPS.find(
    (step) => step.id === currentStep
  );
  const isLastStep = currentStep === ONBOARDING_STEPS.length;

  const fieldName = currentStepData?.fieldName;
  const watchedField = watch(fieldName);

  useEffect(() => {
    if (currentStepData?.maxSelections && fieldName && watchedField) {
      const count = Array.isArray(watchedField) ? watchedField.length : 0;
      setSelectedCount(count);
    } else {
      setSelectedCount(0);
    }
  }, [watchedField, fieldName, currentStepData?.maxSelections]);

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

          const response = await fetch(`${API_URL}/api/user/update`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(newProfileData),
          });

          if (!response.ok) {
            let errorMessage = "Failed to save profile";
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
              // If response is not JSON, use status text or generic message
              errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const responseData = await response.json();
          setCurrentUser({ ...currentUser, ...responseData.user });

          console.log("Profile saved successfully:", responseData);
          navigate("/login");
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
      currentUser,
      setCurrentUser,
      navigate,
    ]
  );

  const handleCancel = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

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

  const renderOptions = () => {
    const inputType = currentStepData.type;
    const maxSelections = currentStepData.maxSelections;
    const selectedValues = watchedField || [];

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
          Welcome, {currentUser?.username || "Developer"}! 👋
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
              disabled={isLoading}
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
    </div>
  );
}
