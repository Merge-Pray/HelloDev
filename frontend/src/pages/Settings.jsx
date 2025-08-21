import { useState } from "react";
import {
  LogOut,
  Settings as SettingsIcon,
  X,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import DarkMode from "../components/DarkMode";
import styles from "./Settings.module.css";
import useUserStore from "../hooks/userstore";
import { useNavigate } from "react-router";
import { API_URL } from "../lib/config";

const Settings = () => {
  const clearUser = useUserStore((state) => state.clearUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      setError(null); // Clear any previous errors

      const response = await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        clearUser();
        navigate("/");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const closeError = () => {
    setError(null);
  };

  return (
    <div className={styles.settingsContainer}>
      {error && (
        <div className={styles.errorToast}>
          <div className={styles.errorContent}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <button
              onClick={closeError}
              className={styles.errorClose}
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className={styles.settingsHeader}>
        <SettingsIcon size={24} />
        <h1>Settings</h1>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <h2>Appearance</h2>
          </div>
          <div className={styles.settingsItem}>
            <div className={styles.settingsItemInfo}>
              <h3>Dark Mode</h3>
              <p>Switch between light and dark theme</p>
            </div>
            <div className={styles.settingsItemControl}>
              <DarkMode />
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <h2>Account</h2>
          </div>
          <div className={styles.settingsItem}>
            <div className={styles.settingsItemInfo}>
              <h3>Sign Out</h3>
              <p>Sign out from your account</p>
            </div>
            <div className={styles.settingsItemControl}>
              <button onClick={handleLogoutClick} className={styles.logoutBtn}>
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <AlertTriangle size={24} />
              </div>
              <button
                className={styles.modalClose}
                onClick={handleLogoutCancel}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <h3>Really sign out?</h3>
              <p>Are you sure you want to sign out from your account?</p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                className={styles.btnDanger}
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
              >
                <LogOut size={16} />
                {isLoggingOut ? "Signing out..." : "Yes, sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
