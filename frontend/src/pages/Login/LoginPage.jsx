import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import styles from "./loginpage.module.css";
import { API_URL } from "../../lib/config";
import DarkMode from "../../components/DarkMode";
import { debugLoginIssue } from "../../utils/samsungBrowserDebug";

const isSamsungInternet = () => {
  return /SamsungBrowser/i.test(navigator.userAgent);
};

export default function LoginPage() {
  const currentUser = useUserStore((state) => state.currentUser);
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

  useEffect(() => {
    if (currentUser) {
      navigate("/home", { replace: true });
    }
  }, [currentUser, navigate]);

  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (isSamsungInternet()) {
        headers["Cache-Control"] = "no-cache";
        headers["Pragma"] = "no-cache";
      }

      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      if (isSamsungInternet()) {
        console.log("🔍 Samsung Browser login - data received:", !!data.user);
        debugLoginIssue(data.user);
      }

      if (isSamsungInternet()) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setCurrentUser(data.user);

      if (isSamsungInternet()) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const stored = localStorage.getItem("user-storage");
        if (!stored) {
          console.warn(
            "Samsung Browser: localStorage write may have failed, retrying..."
          );

          setCurrentUser(data.user);

          setTimeout(() => {
            debugLoginIssue(data.user);
          }, 100);
        } else {
          console.log("✅ Samsung Browser: localStorage write successful");
        }
      }

      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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

      {/* Login Form */}
      <main className={styles.main}>
        <div className={`card ${styles.loginCard}`}>
          <h1 className="title text-center">Sign In</h1>
          <p className={styles.subtitle}>Welcome back to HelloDev</p>

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
      </main>
    </div>
  );
}
