import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Save, X, Plus, Trash2 } from "lucide-react";
import useUserStore from "../hooks/userstore";

const EditProfilePage = () => {
  const currentUser = useUserStore((s) => s.currentUser);
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Load existing profile data
  useEffect(() => {
    // In real app, this would come from API
    const existingData = {
      step1: {
        country: "Germany",
        city: "Berlin",
        age: 25,
        hideLocation: false,
        hideAge: false,
      },
      step2: ["JavaScript", "Python", "TypeScript", "React", "Node.js"],
      step3: "Intermediate",
      step4: ["Web Development", "AI/Machine Learning", "Cloud Computing"],
      step5: ["React", "Node.js", "MongoDB", "Docker", "AWS"],
      step6: ["English", "German", "Spanish"],
      step7: "macOS",
      step8: ["PC Gaming", "Board Games", "Console Gaming (PlayStation)"],
      step9: ["Reading", "Music", "Photography", "Travel"],
      step10: {
        aboutMe:
          "Passionate full-stack developer who loves creating innovative solutions and learning new technologies.",
        favoriteDrink: "Coffee",
        musicGenre: "Lo-fi Hip Hop",
        favoriteShow: "The Office",
      },
      step11: "Evening (5-9 PM)",
    };

    setProfileData(existingData);

    // Set form values
    Object.keys(existingData).forEach((key) => {
      if (
        typeof existingData[key] === "object" &&
        !Array.isArray(existingData[key])
      ) {
        Object.keys(existingData[key]).forEach((subKey) => {
          setValue(`${key}.${subKey}`, existingData[key][subKey]);
        });
      } else {
        setValue(key, existingData[key]);
      }
    });
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Updated profile data:", data);
      navigate("/profile");
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: "personal", title: "Personal Info" },
    { id: "experience", title: "Experience" },
    { id: "languages", title: "Programming Languages" },
    { id: "interests", title: "Tech Interests" },
    { id: "stack", title: "Tech Stack" },
    { id: "spoken", title: "Spoken Languages" },
    { id: "environment", title: "Environment" },
    { id: "gaming", title: "Gaming" },
    { id: "other", title: "Other Interests" },
    { id: "preferences", title: "Coding Preferences" },
    { id: "schedule", title: "Schedule" },
  ];

  const renderPersonalSection = () => (
    <div className="form-section">
      <h3>Personal Information</h3>
      <div className="form-grid">
        <div className="form-field">
          <label>Country</label>
          <input
            type="text"
            {...register("step1.country")}
            placeholder="Enter your country"
          />
        </div>
        <div className="form-field">
          <label>City</label>
          <input
            type="text"
            {...register("step1.city")}
            placeholder="Enter your city"
          />
        </div>
        <div className="form-field">
          <label>Age</label>
          <input
            type="number"
            min="13"
            max="100"
            {...register("step1.age")}
            placeholder="Enter your age"
          />
        </div>
      </div>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input type="checkbox" {...register("step1.hideLocation")} />
          Hide location on profile
        </label>
        <label className="checkbox-label">
          <input type="checkbox" {...register("step1.hideAge")} />
          Hide age on profile
        </label>
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className="form-section">
      <h3>Experience Level</h3>
      <div className="radio-group">
        {["Beginner", "Intermediate", "Expert"].map((level) => (
          <label key={level} className="radio-label">
            <input type="radio" value={level} {...register("step3")} />
            {level}
          </label>
        ))}
      </div>
    </div>
  );

  const renderMultiSelectSection = (title, fieldName, options) => (
    <div className="form-section">
      <h3>{title}</h3>
      <div className="checkbox-grid">
        {options.map((option) => (
          <label key={option} className="checkbox-label">
            <input type="checkbox" value={option} {...register(fieldName)} />
            {option}
          </label>
        ))}
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="form-section">
      <h3>Coding Preferences</h3>
      <div className="form-grid">
        <div className="form-field full-width">
          <label>About Me</label>
          <textarea
            rows={4}
            {...register("step10.aboutMe")}
            placeholder="Tell us about yourself..."
          />
        </div>
        <div className="form-field">
          <label>Favorite Drink While Coding</label>
          <input
            type="text"
            {...register("step10.favoriteDrink")}
            placeholder="Coffee, Tea, Energy Drink..."
          />
        </div>
        <div className="form-field">
          <label>Music Genre While Coding</label>
          <input
            type="text"
            {...register("step10.musicGenre")}
            placeholder="Lo-fi, Rock, Electronic..."
          />
        </div>
        <div className="form-field">
          <label>Favorite Show/Movie</label>
          <input
            type="text"
            {...register("step10.favoriteShow")}
            placeholder="What do you watch for inspiration?"
          />
        </div>
      </div>
    </div>
  );

  const renderScheduleSection = () => (
    <div className="form-section">
      <h3>Coding Schedule</h3>
      <div className="radio-group">
        {[
          "Early Morning (5-9 AM)",
          "Morning (9 AM-12 PM)",
          "Afternoon (12-5 PM)",
          "Evening (5-9 PM)",
          "Night (9 PM-12 AM)",
          "Late Night (12-5 AM)",
          "I code anytime",
          "It depends on the project",
        ].map((time) => (
          <label key={time} className="radio-label">
            <input type="radio" value={time} {...register("step11")} />
            {time}
          </label>
        ))}
      </div>
    </div>
  );

  const renderOSSection = () => (
    <div className="form-section">
      <h3>Preferred Operating System</h3>
      <div className="radio-group">
        {[
          "Windows",
          "macOS",
          "Linux (Ubuntu)",
          "Linux (Arch)",
          "Linux (Other)",
          "I use multiple",
        ].map((os) => (
          <label key={os} className="radio-label">
            <input type="radio" value={os} {...register("step7")} />
            {os}
          </label>
        ))}
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case "personal":
        return renderPersonalSection();
      case "experience":
        return renderExperienceSection();
      case "languages":
        return renderMultiSelectSection("Programming Languages", "step2", [
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
        ]);
      case "interests":
        return renderMultiSelectSection("Tech Areas of Interest", "step4", [
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
        ]);
      case "stack":
        return renderMultiSelectSection("Tech Stack & Tools", "step5", [
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
        ]);
      case "spoken":
        return renderMultiSelectSection("Spoken Languages", "step6", [
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
        ]);
      case "environment":
        return renderOSSection();
      case "gaming":
        return renderMultiSelectSection("Gaming Preferences", "step8", [
          "PC Gaming",
          "Console Gaming (PlayStation)",
          "Console Gaming (Xbox)",
          "Console Gaming (Nintendo)",
          "Mobile Gaming",
          "Board Games",
          "Card Games",
          "Retro Gaming",
          "VR Gaming",
        ]);
      case "other":
        return renderMultiSelectSection("Other Interests", "step9", [
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
        ]);
      case "preferences":
        return renderPreferencesSection();
      case "schedule":
        return renderScheduleSection();
      default:
        return renderPersonalSection();
    }
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
        
        .edit-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
        }
        
        @media (max-width: 768px) {
          .edit-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .sidebar {
            order: 2;
          }
        }
        
        .sidebar {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          height: fit-content;
          position: sticky;
          top: 20px;
        }
        
        .sidebar h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }
        
        .section-nav {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .section-nav li {
          margin-bottom: 8px;
        }
        
        .section-nav button {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #666;
        }
        
        .section-nav button:hover {
          background: #f8f9fa;
          color: #333;
        }
        
        .section-nav button.active {
          background: #e8f0fe;
          color: #667eea;
          font-weight: 600;
        }
        
        .main-content {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          color: #333;
        }
        
        .form-section {
          margin-bottom: 40px;
        }
        
        .form-section h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .form-field {
          display: flex;
          flex-direction: column;
        }
        
        .form-field.full-width {
          grid-column: 1 / -1;
        }
        
        .form-field label {
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        
        .form-field input,
        .form-field textarea {
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
          font-family: inherit;
        }
        
        .form-field input:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-field textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .checkbox-group,
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .checkbox-label,
        .radio-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 12px 16px;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.2s ease;
          user-select: none;
        }
        
        .checkbox-label:hover,
        .radio-label:hover {
          background: #e9ecef;
          border-color: #667eea;
        }
        
        .checkbox-label input,
        .radio-label input {
          margin-right: 12px;
          cursor: pointer;
        }
        
        .action-buttons {
          position: sticky;
          bottom: 20px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 40px;
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
      `}</style>

      <div className="edit-container">
        <div className="sidebar">
          <h2>Edit Profile</h2>
          <ul className="section-nav">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  className={activeSection === section.id ? "active" : ""}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="main-content">
          <div className="header">
            <h1>Edit Your Profile</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {renderCurrentSection()}

            <div className="action-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/profile")}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                <Save size={16} />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
