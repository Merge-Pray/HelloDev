import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import styles from "./loginpage.module.css";
import { API_URL } from "../../lib/config";

export default function LoginPage() {
  const setCurrentUser = useUserStore((s) => s.setCurrentUser);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      setCurrentUser(data.user);
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page centered">
      <div className={`card ${styles.loginCard}`}>
        <h1 className="title text-center">Sign In</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-field">
            <label>Email or Username</label>
            <input
              type="text"
              className="form-input"
              {...register("identifier", {
                required: "Email or username is required.",
              })}
              placeholder="Enter your email or username"
            />
            <div className="form-hint">{errors.identifier?.message}</div>
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
            <div className="form-hint">{errors.password?.message}</div>
          </div>

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/register")}
            className={styles.linkBtn}
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
