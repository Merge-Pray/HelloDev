import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import styles from "./RegisterPage.module.css";

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

  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

  return (
    <div className="page centered">
      <div className={`card ${styles.registerCard}`}>
        <h1 className="title text-center">Sign Up</h1>

        {error && <div className="alert alert-error">{error}</div>}

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
                      /[A-Z]/.test(v) || "At least one uppercase letter (A-Z).",
                    lower: (v) =>
                      /[a-z]/.test(v) || "At least one lowercase letter (a-z).",
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
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
    </div>
  );
}
