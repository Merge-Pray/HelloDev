import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import useUserStore from "../hooks/userstore";
import { API_URL } from "../lib/config";
import styles from "./GoogleAuthButton.module.css";

const GoogleAuthButton = ({
  text = "Continue with Google",
  onSuccess,
  onError,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  // Google Script laden
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        setGoogleLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleLoaded(true);
      };
      script.onerror = () => {
        console.error("❌ Failed to load Google Identity Services");
        if (onError) {
          onError("Failed to load Google services");
        }
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [onError]);

  const handleGoogleResponse = async (response) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/api/user/google-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google authentication failed");
      }

      // User in Zustand speichern

      setCurrentUser(data.user);
      queryClient.setQueryData(["user-profile"], data.user);

      if (onSuccess) {
        onSuccess(data);
      }

      // Kleine Verzögerung um sicherzustellen dass der User-State aktualisiert wurde
      setTimeout(() => {
        if (data.isNewUser) {
          navigate("/buildprofile");
        } else {
          navigate("/home");
        }
      }, 100);
    } catch (error) {
      console.error("❌ Google Auth Error:", error);
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (isLoading || !googleLoaded) {
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        // Initialize Google
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // Disable FedCM for development
        });

        // Create a temporary div for the Google button
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "fixed";
        tempDiv.style.top = "-1000px";
        tempDiv.style.left = "-1000px";
        document.body.appendChild(tempDiv);

        // Render the Google button and trigger it programmatically
        window.google.accounts.id.renderButton(tempDiv, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "continue_with",
          shape: "rectangular",
        });

        // Wait a bit then click the rendered button
        setTimeout(() => {
          const googleBtn = tempDiv.querySelector('div[role="button"]');
          if (googleBtn) {
            googleBtn.click();
          } else {
            window.google.accounts.id.prompt((notification) => {});
          }

          // Cleanup
          setTimeout(() => {
            if (document.body.contains(tempDiv)) {
              document.body.removeChild(tempDiv);
            }
          }, 1000);
        }, 100);
      } catch (error) {
        console.error("❌ Error initializing Google Auth:", error);
        if (onError) {
          onError("Failed to initialize Google authentication");
        }
      }
    } else {
      console.error("❌ Google Identity Services not loaded");
      if (onError) {
        onError("Google services not available. Please try again.");
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !googleLoaded}
      className={`${styles.googleButton} ${className}`}
    >
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Processing...</span>
        </div>
      ) : (
        <div className={styles.content}>
          <svg
            className={styles.googleIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285f4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34a853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#fbbc05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#ea4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{text}</span>
        </div>
      )}
    </button>
  );
};

export default GoogleAuthButton;
