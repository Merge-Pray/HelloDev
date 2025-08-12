import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import useUserStore from "../hooks/userstore";

// import { API_URL } from "@/lib/config.js";
// import { GoogleLogin } from '@google-oauth/google-login'; // Uncomment when ready

export default function RegisterPage() {
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError: setFormError,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Dummy onSubmit function for testing
  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful registration
      const mockUser = {
        userID: "123",
        username: values.username,
        email: values.email,
      };

      setCurrentUser(mockUser);
      navigate("/buildprofile");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // // Dummy Google login handler
  // const handleGoogleSuccess = async (credentialResponse) => {
  //   const credential = credentialResponse?.credential;
  //   if (!credential) {
  //     setError("❌ No Google token received");
  //     return;
  //   }

  //   try {
  //     // Mock Google login success
  //     const mockUser = {
  //       userID: "google-123",
  //       username: "Google User",
  //     };

  //     setCurrentUser(mockUser);
  //     navigate("/buildprofile");
  //   } catch (err) {
  //     console.error("Google Login Error:", err);
  //     setError("Google login failed");
  //   }
  // };

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
          .grid { 
            grid-template-columns: 1fr; 
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
        }
        .card-accent { 
          background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
          border: 2px solid #ffc107;
        }
        .error { 
          color: #d32f2f; 
          margin-bottom: 15px; 
          padding: 10px;
          background: #ffebee;
          border-radius: 8px;
          border-left: 4px solid #d32f2f;
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
        .hint { 
          color: #d32f2f; 
          font-size: 14px; 
          margin-top: 5px;
        }
        .requirements { 
          font-size: 14px; 
          color: #666; 
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .requirements ul {
          margin: 10px 0 0 0;
          padding-left: 20px;
        }
        .submit-btn { 
          width: 100%; 
          padding: 14px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 16px;
          font-weight: 600;
          transition: transform 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .link-btn { 
          font-size: 14px; 
          text-decoration: underline; 
          background: none; 
          border: none; 
          cursor: pointer; 
          color: #667eea;
          font-weight: 500;
        }
        .link-btn:hover {
          color: #764ba2;
        }
        .password-field {
          position: relative;
        }
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 4px;
        }
        .google-login-container {
          margin: 20px 0;
          padding: 20px 0;
          border-top: 1px solid #e0e0e0;
        }
      `}</style>

      <div className="card">
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#333",
          }}
        >
          Sign Up
        </h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label>Username</label>
            <input
              {...register("username", {
                required: "Username is required.",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters long.",
                },
                validate: (v) =>
                  !v.includes("@") || "Username cannot contain @.",
              })}
            />
            <div className="hint">
              {errors.username?.message || validationErrors.username}
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format.",
                },
              })}
            />
            <div className="hint">
              {errors.email?.message || validationErrors.email}
            </div>
          </div>
          <div className="field">
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                style={{ paddingRight: "50px" }}
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 10,
                    message: "Password must be at least 10 characters long.",
                  },
                  validate: {
                    upper: (v) =>
                      /[A-Z]/.test(v) || "At least one uppercase letter (A-Z).",
                    lower: (v) =>
                      /[a-z]/.test(v) || "At least one lowercase letter (a-z).",
                    special: (v) =>
                      /[!@#$%^&*(),.?":{}|<>]/.test(v) ||
                      'At least one special character (!@#$%^&*(),.?":{}|<>).',
                  },
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="hint">
              {errors.password?.message || validationErrors.password}
            </div>
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                style={{ paddingRight: "50px" }}
                {...register("confirmPassword", {
                  required: "Please confirm your password.",
                  validate: (v) =>
                    v === watch("password") || "Passwords do not match.",
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="hint">{errors.confirmPassword?.message}</div>
          </div>
          <div className="requirements">
            <p>
              <strong>Password Requirements:</strong>
            </p>
            <ul>
              <li>At least 10 characters</li>
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>
                At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
              </li>
            </ul>
          </div>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="google-login-container" style={{ textAlign: "center" }}>
          {/* Placeholder for Google Login */}
          {/* <button
            type="button"
            onClick={() => handleGoogleSuccess({ credential: "mock-token" })}
            style={{
              width: "100%",
              padding: "12px",
              background: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            🔍 Sign in with Google (Demo)
          </button> */}

          <div style={{ marginTop: "15px" }}>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="link-btn"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
