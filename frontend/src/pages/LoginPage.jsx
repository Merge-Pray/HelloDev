import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import useUserStore from "../hooks/userstore";

// import { API_URL } from "@/lib/config.js";
// import { GoogleLogin } from '@react-oauth/google'; // Uncomment when ready

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

  // Dummy onSubmit function for testing
  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser = {
        userID: "123",
        username: values.identifier,
      };

      setCurrentUser(mockUser);
      navigate("/news"); // Navigate to newsfeed after login
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
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
  //     navigate("/news");
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
          .card { 
            max-width: 400px;
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
          max-width: 450px;
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
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 20px 0;
        }
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e0e0e0;
        }
        .divider::before {
          margin-right: 16px;
        }
        .divider::after {
          margin-left: 16px;
        }
        .divider span {
          color: #666;
          font-size: 14px;
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
          Sign In
        </h1>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label>Email or Username</label>
            <input
              type="text"
              {...register("identifier", {
                required: "Email or username is required.",
              })}
              placeholder="Enter your email or username"
            />
            <div className="hint">{errors.identifier?.message}</div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                style={{ paddingRight: "50px" }}
                {...register("password", {
                  required: "Password is required.",
                })}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="hint">{errors.password?.message}</div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div
          className="google-login-container"
          style={{ textAlign: "center", padding: 0 }}
        >
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
              marginBottom: "20px",
            }}
          >
            🔍 Sign in with Google (Demo)
          </button> */}

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="link-btn"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
