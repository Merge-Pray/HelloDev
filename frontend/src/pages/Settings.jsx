import { useState } from "react";
import {
  LogOut,
  Settings as SettingsIcon,
  X,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import DarkMode from "../components/DarkMode";
import styles from "./settings.module.css";
import { Link } from "react-router";
import useUserStore from "../hooks/userstore";
import { useNavigate } from "react-router";
import { authenticatedFetch } from "../utils/authenticatedFetch";

const Settings = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleDeleteCancel = () => setShowDeleteConfirm(false);
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await authenticatedFetch("/api/user/delete", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Account deletion failed");
      }
      clearUser();
      setShowDeleteConfirm(false);
      navigate("/login");
    } catch (err) {
      setError("Account deletion failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
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
      setError(null);

      await authenticatedFetch("/api/user/logout", {
        method: "POST",
      });

      clearUser();
      navigate("/login");
    } catch (error) {
      setError("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="page">
      <div className={styles.settingsContainer}>
        {error && (
          <div className={styles.errorAlert}>
            <div className={styles.errorHeader}>
              <AlertCircle size={20} />
              <span>Error</span>
              <button
                onClick={() => setError(null)}
                className={styles.errorClose}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}


        <div className={styles.settingsHeader}>
          <h1 className="title">Settings</h1>
          <div className="card enhanced" style={{marginTop: "2rem"}}>
            <div className={styles.settingsSectionHeader}>
              <h2>Account Management</h2>
            </div>
            <div className={styles.settingsItem}>
              <div className={styles.settingsItemInfoDelete}>
                <h3>Delete Account</h3>
                <p>Permanently delete your user account and all associated data</p>
              </div>
              <div className={styles.settingsItemControl}>
                <button onClick={handleDeleteClick} className={styles.btnDanger} disabled={isDeleting}>
                  <X size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <AlertTriangle size={24} />
              </div>
              <button className={styles.modalClose} onClick={handleDeleteCancel} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <h3>Delete account?</h3>
              <p>Are you sure you want to permanently delete your user account and all associated data?</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={handleDeleteCancel} disabled={isDeleting}>
                Cancel
              </button>
              <button className={styles.btnDanger} onClick={handleDeleteConfirm} disabled={isDeleting}>
                <X size={16} />
                {isDeleting ? "Deleting..." : "Yes, delete account"}
              </button>
            </div>
          </div>
        </div>
      )}

       
   

        <div className={styles.settingsContent}>
          <div className="card enhanced">
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

          <div className="card enhanced">
            <div className={styles.settingsSectionHeader}>
              <h2>Account</h2>
            </div>
            <div className={styles.settingsItem}>
              <div className={styles.settingsItemInfo}>
                <h3>Sign Out</h3>
                <p>Sign out from your account</p>
              </div>
              <div className={styles.settingsItemControl}>
                <button
                  onClick={handleLogoutClick}
                  className={styles.logoutBtn}
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

             <div className={styles.legalLinksBox}>
          <div className={styles.legalLinksHeader}>
            <span className={styles.legalLinksTitle}>Legal information</span>
          </div>
          <div className={styles.legalLinksLinks}>
            <Link className={styles.legalLink} to="/about">About HelloDev</Link>

            <Link className={styles.legalLink} to="/generaltermsandconditions">Datenschutz (Privacy Policy)</Link>

            <Link className={styles.legalLink} to="/gtc">AGB (Terms & Conditions)</Link>
            
            <Link className={styles.legalLink} to="/legalnotice">Impressum (Legal Notice)</Link>
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
    </div>
  );
};

export default Settings;
