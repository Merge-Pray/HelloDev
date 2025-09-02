import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useUserStore from "../../hooks/userstore";
import styles from "./loginpage.module.css";
import { API_URL } from "../../lib/config";
import DarkMode from "../../components/DarkMode";

export default function LoginPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((s) => s.setCurrentUser);
  const queryClient = useQueryClient();
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
    try {
      console.log("🔐 LOGIN: Starting login process");
      
      // Store in sessionStorage for Samsung debugging
      sessionStorage.setItem('samsung_login_start', new Date().toISOString());
      
      setIsLoading(true);
      setError(null);

      try {
        console.log("🔐 LOGIN: Sending request to backend");
        const res = await fetch(`${API_URL}/api/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        });

        const data = await res.json();
        console.log("🔐 LOGIN: Backend response:", { 
          ok: res.ok, 
          status: res.status,
          hasUser: !!data.user,
          userId: data.user?._id 
        });

        if (!res.ok) throw new Error(data.message || "Login failed");

        console.log("🔐 LOGIN: Updating Zustand store");
        setCurrentUser(data.user);
        
        console.log("🔐 LOGIN: Updating React Query cache");
        queryClient.setQueryData(["user-profile"], data.user);
        
        console.log("🔐 LOGIN: Navigating to /home");
        navigate("/home", { replace: true });
        
      } catch (err) {
        console.error("🔐 LOGIN ERROR:", err);
        setError("Login failed. Please try again.");
        
        // Store error for Samsung debugging
        sessionStorage.setItem('samsung_login_error', JSON.stringify({
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        }));
      } finally {
        setIsLoading(false);
      }
      
    } catch (criticalError) {
      console.error("🔐 LOGIN CRITICAL ERROR:", criticalError);
      alert("Critical login error: " + criticalError.message);
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

          <form onSubmit={(e) => {
            console.log("🔐 FORM: Form submit event triggered");
            console.log("🔐 FORM: Event details:", { type: e.type, target: e.target });
            e.preventDefault();
            console.log("🔐 FORM: Default prevented, calling handleSubmit");
            
            // Get form data directly for Samsung browser compatibility
            const formData = new FormData(e.target);
            const identifier = formData.get('identifier');
            const password = formData.get('password');
            
            console.log("🔐 FORM: Form data extracted:", { identifier, passwordLength: password?.length });
            
            if (!identifier || !password) {
              console.log("🔐 FORM: Missing required fields");
              setError("Email/username and password are required");
              return;
            }
            
            console.log("🔐 FORM: Calling onSubmit directly");
            onSubmit({ identifier, password });
          }}>
            <div className="form-field">
              <label>Email or Username</label>
              <input
                type="text"
                name="identifier"
                className="form-input"
                {...register("identifier", {
                  required: "Email or username is required.",
                })}
                placeholder="Enter your email or username"
                onChange={(e) => {
                  console.log("🔐 FORM: Identifier changed:", e.target.value);
                }}
              />
              <div className="form-hint">{errors.identifier?.message}</div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  style={{ paddingRight: "50px" }}
                  {...register("password", {
                    required: "Password is required.",
                  })}
                  placeholder="Enter your password"
                  onChange={(e) => {
                    console.log("🔐 FORM: Password changed:", e.target.value.length + " chars");
                  }}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => {
                    console.log("🔐 FORM: Password toggle clicked");
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="form-hint">{errors.password?.message}</div>
            </div>

            <button
              type="button"
              className="btn btn-primary full-width"
              disabled={isLoading}
              onClick={(e) => {
                try {
                  console.log("🔐 BUTTON: Submit button clicked directly");
                  console.log("🔐 BUTTON: Button disabled:", isLoading);
                  console.log("🔐 BUTTON: Form errors:", errors);
                  
                  // Store logs in sessionStorage for persistence
                  const logEntry = `${new Date().toISOString()}: Button clicked`;
                  sessionStorage.setItem('samsung_debug', sessionStorage.getItem('samsung_debug') + '\n' + logEntry);
                  
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Get form data directly
                  const form = e.target.closest('form');
                  if (!form) {
                    console.error("🔐 BUTTON ERROR: No form found");
                    alert("Form not found - Samsung browser issue");
                    return;
                  }
                  
                  const formData = new FormData(form);
                  const identifier = formData.get('identifier');
                  const password = formData.get('password');
                  
                  console.log("🔐 BUTTON: Form data extracted:", { identifier, passwordLength: password?.length });
                  
                  if (!identifier || !password) {
                    console.log("🔐 BUTTON: Missing required fields");
                    setError("Email/username and password are required");
                    return;
                  }
                  
                  console.log("🔐 BUTTON: Calling onSubmit directly from button");
                  
                  // Add try-catch around onSubmit call
                  try {
                    onSubmit({ identifier, password });
                  } catch (submitError) {
                    console.error("🔐 BUTTON ERROR: onSubmit failed:", submitError);
                    alert("Login failed: " + submitError.message);
                  }
                  
                } catch (error) {
                  console.error("🔐 BUTTON CRITICAL ERROR:", error);
                  alert("Critical error: " + error.message);
                  // Store error in sessionStorage
                  sessionStorage.setItem('samsung_error', JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                  }));
                }
              }}
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
