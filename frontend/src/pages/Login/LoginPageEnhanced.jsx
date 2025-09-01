import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import useUserStore from "../../hooks/userstore";
import { handleLoginSuccess } from "../../utils/sessionManager";
import { isSamsungInternet, debugLoginIssue, getSamsungBrowserInfo } from "../../utils/samsungBrowserDebug";
import { samsungCompatibleLogin, testSamsungConnectivity } from "../../utils/samsungNetworkFix";
import styles from "./loginpage.module.css";
import { API_URL } from "../../lib/config";
import DarkMode from "../../components/DarkMode";
import SamsungDebugPanel from "../../components/SamsungDebugPanel";

export default function LoginPageEnhanced() {
  const currentUser = useUserStore((state) => state.currentUser);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
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

  // Show debug info for Samsung browsers
  useEffect(() => {
    if (isSamsungInternet()) {
      setDebugInfo(getSamsungBrowserInfo());
    }
  }, []);

  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);

    try {
      if (isSamsungInternet()) {
        console.log('🔍 Samsung Browser - Starting login process');
        console.log('Browser info:', getSamsungBrowserInfo());
        
        // Test connectivity first for Samsung browsers
        const connectivityTest = await testSamsungConnectivity(API_URL);
        console.log('🔍 Samsung Browser - Connectivity test:', connectivityTest);
        
        if (!connectivityTest.success) {
          throw new Error('Samsung Browser connectivity issue. Please try the troubleshooting steps below.');
        }
      }

      let data;
      
      if (isSamsungInternet()) {
        // Use Samsung-compatible login
        data = await samsungCompatibleLogin(values, API_URL);
      } else {
        // Use normal fetch for other browsers
        const headers = {
          "Content-Type": "application/json",
        };

        const res = await fetch(`${API_URL}/api/user/login`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(values),
        });

        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
      }

      if (isSamsungInternet()) {
        console.log('🔍 Samsung Browser - Login response received');
        console.log('User data:', data.user ? 'Present' : 'Missing');
      }

      // Use enhanced session manager for login success
      const enhancedUser = await handleLoginSuccess(data.user);

      if (isSamsungInternet()) {
        console.log('🔍 Samsung Browser - Session manager completed');
        debugLoginIssue(enhancedUser);
      }

      // Add a small delay for Samsung browsers to ensure localStorage is written
      if (isSamsungInternet()) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verify localStorage was written correctly
        try {
          const stored = localStorage.getItem('user-storage');
          if (!stored) {
            console.warn('Samsung Browser - localStorage not written, retrying...');
            // Force another write attempt
            const userStorage = {
              state: { currentUser: enhancedUser },
              version: 0
            };
            localStorage.setItem('user-storage', JSON.stringify(userStorage));
          }
        } catch (storageError) {
          console.error('Samsung Browser - localStorage verification failed:', storageError);
        }
      }

      // Navigate to home
      navigate("/home", { replace: true });
      
    } catch (err) {
      console.error("Login error:", err);
      
      if (isSamsungInternet()) {
        console.error('🔍 Samsung Browser - Login failed:', err);
      }
      
      let errorMessage = err.message;
      
      // Use the specific Samsung error message if provided
      if (!errorMessage.includes('Samsung Browser') && isSamsungInternet()) {
        if (err.message.includes('network') || err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
          errorMessage = "Samsung Browser network issue. Please try the troubleshooting steps below.";
        } else if (err.message.includes('timeout')) {
          errorMessage = "Request timed out. Please try again or use troubleshooting steps below.";
        } else {
          errorMessage = "Login failed. Please try again.";
        }
      }
      
      setError(errorMessage);
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

          {/* Samsung Browser Debug Info */}
          {debugInfo && debugInfo.isSamsung && (
            <div className="alert alert-info" style={{ fontSize: '12px', marginBottom: '1rem' }}>
              <strong>Samsung Browser Detected</strong><br />
              Version: {debugInfo.version}<br />
              Enhanced compatibility mode enabled
            </div>
          )}

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
              {isLoading ? (
                isSamsungInternet() ? "Signing in (Samsung mode)..." : "Signing in..."
              ) : (
                "Sign In"
              )}
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

          {/* Samsung Browser Troubleshooting */}
          {debugInfo && debugInfo.isSamsung && (
            <div style={{ marginTop: '1rem', fontSize: '11px', color: '#666' }}>
              <details>
                <summary>Having login issues? (Samsung Browser)</summary>
                <div style={{ marginTop: '0.5rem', lineHeight: '1.4' }}>
                  • Try clearing browser data and cookies<br />
                  • Ensure "Block cross-site tracking" is disabled<br />
                  • Try switching to "Desktop site" mode temporarily<br />
                  • Update Samsung Internet to the latest version
                </div>
              </details>
            </div>
          )}
        </div>
      </main>
      
      {/* Samsung Browser Debug Panel */}
      <SamsungDebugPanel isVisible={true} />
    </div>
  );
}