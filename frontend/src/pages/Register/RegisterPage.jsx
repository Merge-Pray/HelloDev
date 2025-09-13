import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import styles from "./registerpage.module.css";
import { API_URL } from "../../lib/config";
import DarkMode from "../../components/DarkMode";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import GitHubAuthButton from "../../components/GitHubAuthButton";

export default function RegisterPage() {
  const currentUser = useUserStore((state) => state.currentUser);
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
      acceptTerms: false,
    },
  });

  const handleGoogleSuccess = (data) => {
    console.log('🔐 GOOGLE REGISTER: Success', data);
  };

  const handleGoogleError = (error) => {
    console.error('🔐 GOOGLE REGISTER: Error', error);
    setError(error);
  };

  const handleGitHubSuccess = (data) => {
    console.log('🔐 GITHUB REGISTER: Success', data);
  };

  const handleGitHubError = (error) => {
    console.error('🔐 GITHUB REGISTER: Error', error);
    setError(error);
  };

  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const { confirmPassword, ...submitData } = values;

      const response = await fetch(`${API_URL}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 400 && errorData.errors) {
          const fieldErrors = {};

          if (Array.isArray(errorData.errors)) {
            errorData.errors.forEach((error) => {
              const fieldName = Object.keys(error)[0];
              const errorMessage = Object.values(error)[0];
              fieldErrors[fieldName] = errorMessage;
            });
          } else if (typeof errorData.errors === "object") {
            Object.entries(errorData.errors).forEach(([field, message]) => {
              fieldErrors[field] = message;
            });
          }

          setValidationErrors(fieldErrors);

          Object.entries(fieldErrors).forEach(([field, message]) => {
            if (field in values) {
              setFormError(field, {
                type: "server",
                message: message,
              });
            }
          });

          setError("Please fix the validation errors below.");
        } else {
          throw new Error(errorData.message || "Registration failed");
        }
      } else {
        const data = await response.json();

        setCurrentUser(data.user);
        navigate("/buildprofile");
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Wenn User eingeloggt ist, zeige nichts an
  if (currentUser) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header mit Logo und DarkMode */}
      <header className={styles.header}>
        <div className={styles.logoContainer} onClick={() => navigate("/")}>
          <img
            src="/logo/HelloDev_Logo_Color.svg"
            alt="HelloDev"
            className={`${styles.logo} ${styles.logoLight}`}
          />
          <img
            src="/logo/HelloDev_Logo_White.svg"
            alt="HelloDev"
            className={`${styles.logo} ${styles.logoDark}`}
          />
        </div>
        <div className={styles.darkModeWrapper}>
          <DarkMode />
        </div>
      </header>

      {/* Register Form */}
      <main className={styles.main}>
        <div className={`card ${styles.registerCard}`}>
          <h1 className="title text-center">Sign Up</h1>

          {error && <div className="alert alert-error">{error}</div>}

          {/* OAuth Buttons */}
          <div className={styles.oauthContainer}>
            <GoogleAuthButton 
              text="Sign up with Google"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            
            <GitHubAuthButton 
              text="Sign up with GitHub"
              onSuccess={handleGitHubSuccess}
              onError={handleGitHubError}
            />
          </div>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-field">
              <label>Username</label>
              <input
                className="form-input"
                {...register("username", {
                  required: "Username is required.",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters long.",
                  },
                  validate: (v) =>
                    !v.includes("@") || "Username cannot contain @.",
                })}
                placeholder="Enter your username"
              />
              <div className="form-hint">
                {errors.username?.message || validationErrors.username}
              </div>
            </div>

            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format.",
                  },
                })}
                placeholder="Enter your email"
              />
              <div className="form-hint">
                {errors.email?.message || validationErrors.email}
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  style={{ paddingRight: "50px" }}
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 10,
                      message: "Password must be at least 10 characters long.",
                    },
                    validate: {
                      upper: (v) =>
                        /[A-Z]/.test(v) ||
                        "At least one uppercase letter (A-Z).",
                      lower: (v) =>
                        /[a-z]/.test(v) ||
                        "At least one lowercase letter (a-z).",
                      special: (v) =>
                        /[!@#$%^&*(),.?":{}|<>]/.test(v) ||
                        'At least one special character (!@#$%^&*(),.?":{}|<>).',
                    },
                  })}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="form-hint">
                {errors.password?.message || validationErrors.password}
              </div>
            </div>

            <div className="form-field">
              <label>Confirm Password</label>
              <div className={styles.passwordField}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input"
                  style={{ paddingRight: "50px" }}
                  {...register("confirmPassword", {
                    required: "Please confirm your password.",
                    validate: (v) =>
                      v === watch("password") || "Passwords do not match.",
                  })}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <div className="form-hint">{errors.confirmPassword?.message}</div>
            </div>


            <div className={styles.requirements}>
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

            <div className="form-field">
              <label style={{display: "flex", alignItems: "center", gap: "8px"}}>
                <input
                  type="checkbox"
                  {...register("acceptTerms", {
                    required: "You must accept the Terms & Conditions (AGB)."
                  })}
                  style={{width: "18px", height: "18px"}}
                />
                I accept the
                <a href="/gtc" target="_blank" rel="noopener noreferrer" style={{color: "var(--color-primary)", textDecoration: "underline"}}>Terms & Conditions (AGB)</a>
              </label>
              <div className="form-hint" style={{color: "#ef4444"}}>
                {errors.acceptTerms?.message}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary full-width"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className={styles.googleLoginContainer}>
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={styles.linkBtn}
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
