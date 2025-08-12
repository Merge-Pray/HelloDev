import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import useUserStore from "../hooks/userstore";

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
      <div className="mixed-fields">
        {currentStepData.fields.map((field) => {
          if (field.type === "checkbox") {
            const fieldPath = `step${currentStep}.${field.name}`;
            const isSelected =
              watchedValues[`step${currentStep}`]?.[field.name];

            return (
              <div key={field.name} className="checkbox-field">
                <label
                  className={`checkbox-label ${isSelected ? "selected" : ""}`}
                >
                  <input type="checkbox" {...register(fieldPath)} />
                  {field.label}
                </label>
              </div>
            );
          }

          return (
            <div key={field.name} className="field">
              <label>{field.label}</label>
              <input
                type={field.type}
                min={field.min}
                max={field.max}
                {...register(`step${currentStep}.${field.name}`, {
                  required: field.required
                    ? `${field.label} is required`
                    : false,
                })}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
              {errors[`step${currentStep}`]?.[field.name] && (
                <div className="hint">
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
        <div className="options-grid">
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
                className={`option-item ${isDisabled ? "disabled" : ""} ${
                  isSelected ? "selected" : ""
                }`}
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
          <div className="selection-counter">
            {selectedCount}/{maxSelections} selected
          </div>
        )}

        {currentStepData.hasOther && (
          <div className="other-field">
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
    <div className="page">
      <style>{`
        .page { 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        @media (max-width: 768px) {
          .card { 
            max-width: 500px;
          }
        }
        .card { 
          background: white; 
          border-radius: 16px; 
          padding: 30px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          width: 100%;
          max-width: 600px;
          position: relative;
        }
        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          margin-bottom: 30px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .step-counter {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f5f5f5;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
        }
        .welcome-text {
          color: #667eea;
          font-size: 14px;
          margin-bottom: 10px;
          font-weight: 500;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.5;
        }
        .mixed-fields {
          margin-bottom: 30px;
        }
        .field {
          margin-bottom: 20px;
        }
        .field label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        .field input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }
        .field input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .checkbox-field {
          margin-bottom: 15px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-weight: 500;
          color: #333;
          padding: 12px 16px;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.2s ease;
          user-select: none;
        }
        .checkbox-label:hover {
          background: #e9ecef;
          border-color: #667eea;
        }
        .checkbox-label.selected {
          background: #e8f0fe;
          border-color: #667eea;
          color: #667eea;
        }
        .checkbox-label input {
          display: none; /* Hide checkbox */
        }
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .option-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          position: relative;
        }
        .option-item:hover:not(.disabled) {
          background: #e9ecef;
          border-color: #667eea;
        }
        .option-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .option-item.selected {
          background: #e8f0fe;
          border-color: #667eea;
          color: #667eea;
        }
        .option-item input {
          display: none; /* Hide radio buttons and checkboxes */
        }
        .option-item.disabled input {
          cursor: not-allowed;
        }
        .option-item label {
          cursor: pointer;
          font-weight: 500;
          flex: 1;
        }
        .option-item.selected::before {
          content: '✓';
          position: absolute;
          right: 12px;
          color: #667eea;
          font-weight: bold;
          font-size: 16px;
        }
        .checkbox-label.selected::before {
          content: '✓';
          margin-right: 8px;
          color: #667eea;
          font-weight: bold;
          font-size: 16px;
        }
        .selection-counter {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        .other-field {
          margin-top: 20px;
        }
        .other-field label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        .other-field input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }
        .other-field input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .hint {
          color: #d32f2f;
          font-size: 14px;
          margin-top: 5px;
        }
        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 30px;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex: 1;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #f8f9fa;
          color: #666;
          border: 2px solid #e9ecef;
        }
        .btn-secondary:hover {
          background: #e9ecef;
        }
        .btn-back {
          background: none;
          color: #667eea;
          padding: 8px;
          border: 2px solid #667eea;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-back:hover {
          background: #667eea;
          color: white;
        }
      `}</style>

      <div className="card">
        <div className="step-counter">
          {currentStep} of {ONBOARDING_STEPS.length}
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(currentStep / ONBOARDING_STEPS.length) * 100}%`,
            }}
          />
        </div>

        <div className="welcome-text">
          Welcome, {currentUser?.username || "Developer"}! 👋
        </div>

        <h1 className="title">{currentStepData?.title}</h1>
        <p className="subtitle">{currentStepData?.subtitle}</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStepData?.type === "mixed"
            ? renderMixedFields()
            : renderOptions()}

          <div className="button-group">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-back"
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

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          You can always add more details to your profile later!
        </div>
      </div>
    </div>
  );
}
