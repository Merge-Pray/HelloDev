import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import styles from "./BuildProfile.module.css";

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
        required: false,
      },
      {
        name: "city",
        label: "City",
        type: "text",
        required: false,
      },
      {
        name: "age",
        label: "Age",
        type: "number",
        required: false,
        min: 13,
        max: 100,
      },
      {
        name: "hideLocation",
        label: "Hide location on profile",
        type: "checkbox",
      },
      {
        name: "hideAge",
        label: "Hide age on profile",
        type: "checkbox",
      },
    ],
  },
  {
    id: 2,
    title: "Programming Languages",
    subtitle: "Which programming languages do you know? (Select up to 5)",
    type: "checkbox",
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
      "R",
      "MATLAB",
      "Perl",
      "Haskell",
      "Lua",
    ],
  },
  {
    id: 3,
    title: "Experience Level",
    subtitle: "How would you describe your programming experience?",
    type: "radio",
    options: ["Beginner", "Intermediate", "Expert"],
  },
  {
    id: 4,
    title: "Tech Areas of Interest",
    subtitle: "What areas of technology interest you most?",
    type: "checkbox",
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
      "Robotics",
      "Desktop Applications",
      "Embedded Systems",
    ],
    hasOther: true,
  },
  {
    id: 5,
    title: "Tech Stack & Tools",
    subtitle: "What technologies and tools do you work with?",
    type: "checkbox",
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
      "Rails",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Git",
      "Jenkins",
      "Terraform",
    ],
    hasOther: true,
  },
  {
    id: 6,
    title: "Languages",
    subtitle: "What languages do you speak?",
    type: "checkbox",
    options: [
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
      "Dutch",
      "Swedish",
      "Norwegian",
      "Danish",
    ],
    hasOther: true,
  },
  {
    id: 7,
    title: "Preferred Operating System",
    subtitle: "What OS do you prefer for development?",
    type: "radio",
    options: [
      "Windows",
      "macOS",
      "Linux (Ubuntu)",
      "Linux (Arch)",
      "Linux (Other)",
      "I use multiple",
    ],
  },
  {
    id: 8,
    title: "Gaming Preferences",
    subtitle: "What types of gaming do you enjoy?",
    type: "checkbox",
    options: [
      "PC Gaming",
      "Console Gaming (PlayStation)",
      "Console Gaming (Xbox)",
      "Console Gaming (Nintendo)",
      "Mobile Gaming",
      "Board Games",
      "Card Games",
      "Retro Gaming",
      "VR Gaming",
    ],
  },
  {
    id: 9,
    title: "Other Interests",
    subtitle: "What do you enjoy outside of programming?",
    type: "checkbox",
    options: [
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
  },
  {
    id: 10,
    title: "About You",
    subtitle: "Tell us more about yourself and your coding preferences",
    type: "mixed",
    fields: [
      {
        name: "aboutMe",
        label: "About Me",
        type: "textarea",
        required: false,
        placeholder: "Tell us about yourself...",
      },
      {
        name: "favoriteDrink",
        label: "Favorite Drink While Coding",
        type: "text",
        required: false,
        placeholder: "Coffee, Tea, Energy Drink...",
      },
      {
        name: "musicGenre",
        label: "Music Genre While Coding",
        type: "text",
        required: false,
        placeholder: "Lo-fi, Rock, Electronic...",
      },
      {
        name: "favoriteShow",
        label: "Favorite Show/Movie",
        type: "text",
        required: false,
        placeholder: "What do you watch for inspiration?",
      },
    ],
  },
  {
    id: 11,
    title: "Coding Schedule",
    subtitle: "When do you prefer to code?",
    type: "radio",
    options: [
      "Early Morning (5-9 AM)",
      "Morning (9 AM-12 PM)",
      "Afternoon (12-5 PM)",
      "Evening (5-9 PM)",
      "Night (9 PM-12 AM)",
      "Late Night (12-5 AM)",
      "I code anytime",
      "It depends on the project",
    ],
  },
];

export default function BuildProfile() {
  const currentUser = useUserStore((s) => s.currentUser);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otherInputs, setOtherInputs] = useState({});
  const [selectedCount, setSelectedCount] = useState(0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const currentStepData = ONBOARDING_STEPS.find(
    (step) => step.id === currentStep
  );
  const isLastStep = currentStep === ONBOARDING_STEPS.length;

  // Watch for checkbox changes to count selections
  const watchedValues = watch();

  useEffect(() => {
    if (currentStepData?.maxSelections) {
      const fieldName = `step${currentStep}`;
      const values = watchedValues[fieldName] || [];
      setSelectedCount(Array.isArray(values) ? values.length : 0);
    }
  }, [watchedValues, currentStep, currentStepData]);

  const handleNext = async (data) => {
    const stepKey = `step${currentStep}`;
    let stepData = data[stepKey] || [];

    // Add "other" input if provided
    if (currentStepData?.hasOther && otherInputs[stepKey]) {
      stepData = [
        ...(Array.isArray(stepData) ? stepData : [stepData]),
        otherInputs[stepKey],
      ];
    }

    const newProfileData = {
      ...profileData,
      [stepKey]: stepData,
    };
    setProfileData(newProfileData);

    if (isLastStep) {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Profile data:", newProfileData);
        navigate("/profile");
      } catch (error) {
        console.error("Profile creation error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
      reset();
      setSelectedCount(0);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      navigate("/profile");
    } else {
      setCurrentStep(currentStep + 1);
      reset();
      setSelectedCount(0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setSelectedCount(0);
    }
  };

  const onSubmit = (data) => {
    handleNext(data);
  };

  const renderMixedFields = () => {
    return (
      <div className={styles.mixedFields}>
        {currentStepData.fields.map((field) => {
          if (field.type === "checkbox") {
            const fieldPath = `step${currentStep}.${field.name}`;
            const isSelected =
              watchedValues[`step${currentStep}`]?.[field.name];

            return (
              <div key={field.name} className={styles.checkboxField}>
                <label
                  className={`${styles.checkboxLabel} ${
                    isSelected ? styles.selected : ""
                  }`}
                >
                  <input type="checkbox" {...register(fieldPath)} />
                  {field.label}
                </label>
              </div>
            );
          }

          return (
            <div key={field.name} className="form-field">
              <label>{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  {...register(`step${currentStep}.${field.name}`, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                  })}
                  placeholder={
                    field.placeholder ||
                    `Enter your ${field.label.toLowerCase()}`
                  }
                />
              ) : (
                <input
                  className="form-input"
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  {...register(`step${currentStep}.${field.name}`, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                  })}
                  placeholder={
                    field.placeholder ||
                    `Enter your ${field.label.toLowerCase()}`
                  }
                />
              )}
              {errors[`step${currentStep}`]?.[field.name] && (
                <div className="form-hint">
                  {errors[`step${currentStep}`][field.name].message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderOptions = () => {
    const fieldName = `step${currentStep}`;
    const inputType = currentStepData.type;
    const maxSelections = currentStepData.maxSelections;
    const selectedValues = watchedValues[fieldName] || [];

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
                  {...register(fieldName)}
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

        {currentStepData.hasOther && (
          <div className={styles.otherField}>
            <label>Other (please specify):</label>
            <input
              type="text"
              placeholder="Type here..."
              value={otherInputs[fieldName] || ""}
              onChange={(e) =>
                setOtherInputs({
                  ...otherInputs,
                  [fieldName]: e.target.value,
                })
              }
            />
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
              onClick={handleSkip}
            >
              <X size={16} />
              Skip
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              {isLoading ? (
                "Creating Profile..."
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
          You can always add more details to your profile later!
        </div>
      </div>
    </div>
  );
}
