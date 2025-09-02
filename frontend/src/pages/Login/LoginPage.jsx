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

  // Global error handler for Samsung browser
  useEffect(() => {
    const handleError = (event) => {
      console.error("🚨 GLOBAL ERROR:", event.error);
      const errorInfo = {
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack || 'No stack trace',
        filename: event.filename || 'Unknown file',
        lineno: event.lineno || 'Unknown line',
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('samsung_global_error', JSON.stringify(errorInfo));
      alert("Global error caught: " + errorInfo.message);
    };

    const handleUnhandledRejection = (event) => {
      console.error("🚨 UNHANDLED PROMISE REJECTION:", event.reason);
      const errorInfo = {
        reason: event.reason?.message || event.reason || 'Unknown rejection',
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('samsung_promise_error', JSON.stringify(errorInfo));
      alert("Promise rejection: " + errorInfo.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

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
      let loginLog = sessionStorage.getItem('samsung_login_log') || '';
      loginLog += `\n${new Date().toISOString()}: Login process started`;
      sessionStorage.setItem('samsung_login_log', loginLog);
      
      setIsLoading(true);
      setError(null);

      try {
        console.log("🔐 LOGIN: Sending request to backend");
        loginLog += `\n${new Date().toISOString()}: Sending request to backend`;
        sessionStorage.setItem('samsung_login_log', loginLog);
        
        const res = await fetch(`${API_URL}/api/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        });

        loginLog += `\n${new Date().toISOString()}: Received response, status: ${res.status}`;
        sessionStorage.setItem('samsung_login_log', loginLog);

        const data = await res.json();
        loginLog += `\n${new Date().toISOString()}: Parsed JSON response`;
        sessionStorage.setItem('samsung_login_log', loginLog);
        
        console.log("🔐 LOGIN: Backend response:", { 
          ok: res.ok, 
          status: res.status,
          hasUser: !!data.user,
          userId: data.user?._id 
        });

        if (!res.ok) throw new Error(data.message || "Login failed");

        console.log("🔐 LOGIN: Updating Zustand store");
        loginLog += `\n${new Date().toISOString()}: About to update Zustand`;
        sessionStorage.setItem('samsung_login_log', loginLog);
        
        setCurrentUser(data.user);
        
        loginLog += `\n${new Date().toISOString()}: Zustand updated, updating React Query`;
        sessionStorage.setItem('samsung_login_log', loginLog);
        
        console.log("🔐 LOGIN: Updating React Query cache");
        queryClient.setQueryData(["user-profile"], data.user);
        
        loginLog += `\n${new Date().toISOString()}: React Query updated, navigating`;
        sessionStorage.setItem('samsung_login_log', loginLog);
        
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
                  
                  // Store each step in sessionStorage
                  let debugLog = sessionStorage.getItem('samsung_debug') || '';
                  debugLog += `\n${new Date().toISOString()}: Button clicked`;
                  sessionStorage.setItem('samsung_debug', debugLog);
                  
                  console.log("🔐 BUTTON: Button disabled:", isLoading);
                  debugLog += `\n${new Date().toISOString()}: Checked button state`;
                  sessionStorage.setItem('samsung_debug', debugLog);
                  
                  console.log("🔐 BUTTON: Form errors:", errors);
                  debugLog += `\n${new Date().toISOString()}: Checked form errors`;
                  sessionStorage.setItem('samsung_debug', debugLog);
                  
                  e.preventDefault();
                  e.stopPropagation();
                  debugLog += `\n${new Date().toISOString()}: Prevented default`;
                  sessionStorage.setItem('samsung_debug', debugLog);
                  
                  // Get form data directly
                  const form = e.target.closest('form');
                  debugLog += `\n${new Date().toISOString()}: Found form: ${!!form}`;
                  sessionStorage.setItem('samsung_debug', debugLog);
                  
                  if (!form) {
                    console.error("🔐 BUTTON ERROR: No form found");
                    alert("Form not found - Samsung browser issue");
                    return;
                  }
                  
                  const formData = new FormData(form);
                  debugLog += `\n${new Date().toISOString()}: Created FormData`;
                  sessionStorage.setItem('samsung_debug', debugLog);
                  
                  const identifier = formData.get('identifier');
                  const password = formData.get('password');
                  debugLog += `\n${new Date().toISOString()}: Extracted data - ID: ${!!identifier}, PW: ${!!password}`;
                  sessionStorage.setItem('samsung_debug', debugLog);
                  
                  console.log("🔐 BUTTON: Form data extracted:", { identifier, passwordLength: password?.length });
                  
                  if (!identifier || !password) {
                    console.log("🔐 BUTTON: Missing required fields");
                    setError("Email/username and password are required");
                    debugLog += `\n${new Date().toISOString()}: Missing fields error`;
                    sessionStorage.setItem('samsung_debug', debugLog);
                    return;
                  }
                  
                  console.log("🔐 BUTTON: Calling onSubmit directly from button");
                  debugLog += `\n${new Date().toISOString()}: About to call onSubmit`;
                  sessionStorage.setItem('samsung_debug', debugLog);
                  
                  // Add try-catch around onSubmit call
                  try {
                    onSubmit({ identifier, password });
                    debugLog += `\n${new Date().toISOString()}: onSubmit called successfully`;
                    sessionStorage.setItem('samsung_debug', debugLog);
                  } catch (submitError) {
                    console.error("🔐 BUTTON ERROR: onSubmit failed:", submitError);
                    alert("Login failed: " + submitError.message);
                    debugLog += `\n${new Date().toISOString()}: onSubmit error: ${submitError.message}`;
                    sessionStorage.setItem('samsung_debug', debugLog);
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
