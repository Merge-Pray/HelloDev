import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import useUserStore from "../hooks/userstore";
import { API_URL } from "../lib/config";
import styles from "./GitHubAuthButton.module.css";

const GitHubAuthButton = ({
  text = "Continue with GitHub",
  onSuccess,
  onError,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  const handleGitHubAuth = async (code) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/api/user/github-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "GitHub authentication failed");
      }

      // User in Zustand speichern

      setCurrentUser(data.user);
      queryClient.setQueryData(["user-profile"], data.user);

      if (onSuccess) {
        onSuccess(data);
      }

      setTimeout(() => {
        if (data.isNewUser) {
          navigate("/buildprofile");
        } else {
          navigate("/home");
        }
      }, 100);
    } catch (error) {
      console.error("❌ GitHub Auth Error:", error);
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (isLoading) {
      return;
    }

    // GitHub OAuth URL
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

    if (!clientId) {
      console.error(
        "❌ VITE_GITHUB_CLIENT_ID not found in environment variables"
      );
      if (onError) {
        onError(
          "GitHub Client ID not configured. Please check environment variables."
        );
      }
      return;
    }

    const redirectUri = encodeURIComponent(
      window.location.origin + "/auth/github/callback"
    );
    const scope = encodeURIComponent("user:email");
    const state = Math.random().toString(36).substring(2, 15);

    // Store state for security
    sessionStorage.setItem("github_oauth_state", state);

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

    // Listen for popup messages
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GITHUB_AUTH_SUCCESS") {
        window.removeEventListener("message", handleMessage);
        handleGitHubAuth(event.data.code);
      } else if (event.data.type === "GITHUB_AUTH_ERROR") {
        window.removeEventListener("message", handleMessage);
        if (onError) {
          onError(event.data.error || "GitHub authentication failed");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Open popup
    const popup = window.open(
      githubAuthUrl,
      "github-oauth",
      "width=600,height=700,scrollbars=yes,resizable=yes"
    );

    // Check if popup was blocked
    if (!popup) {
      window.removeEventListener("message", handleMessage);
      if (onError) {
        onError(
          "Popup was blocked. Please allow popups for GitHub authentication."
        );
      }
      return;
    }

    // Check if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${styles.githubButton} ${className}`}
    >
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Processing...</span>
        </div>
      ) : (
        <div className={styles.content}>
          <svg
            className={styles.githubIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <span>{text}</span>
        </div>
      )}
    </button>
  );
};

export default GitHubAuthButton;
