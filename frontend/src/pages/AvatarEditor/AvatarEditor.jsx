import React, { useState, useRef, useEffect } from "react";
import Avatar from "../../components/avatar";
import { authenticatedFetch } from "../../utils/authenticatedFetch";
import useUserStore from "../../hooks/userstore";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./AvatarEditor.module.css";

const AvatarEditor = () => {
  const [avatarData, setAvatarData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialPixelData, setInitialPixelData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [gridSize, setGridSize] = useState(16); // Default 16x16
  const avatarRef = useRef(null);
  const { setCurrentUser } = useUserStore();
  const queryClient = useQueryClient();

  // Load existing avatar data when component mounts
  useEffect(() => {
    const loadExistingAvatarData = async () => {
      try {
        const userData = await authenticatedFetch("/api/user/user");
        if (userData.user?.avatarData) {
          let pixelArray;
          try {
            pixelArray = JSON.parse(userData.user.avatarData);
          } catch {
            pixelArray = null;
          }
          if (pixelArray && Array.isArray(pixelArray)) {
            setInitialPixelData(pixelArray);
            setAvatarData(pixelArray);
            // gridSize automatisch bestimmen anhand der Pixelanzahl
            if (pixelArray.length === 256) setGridSize(16);
            else if (pixelArray.length === 1024) setGridSize(32);
          }
        }
      } catch (error) {
        // Fehlerbehandlung
      }
    };
    loadExistingAvatarData();
  }, []);

  // Debug: Watch when initialPixelData changes
  useEffect(() => {
    console.log("🔄 initialPixelData changed:", {
      hasData: !!initialPixelData,
      length: initialPixelData?.length,
      firstPixel: initialPixelData?.[0],
    });
  }, [initialPixelData]);

  const handleAvatarChange = (data) => {
    setAvatarData(data);
  };

  const handleSave = async () => {
    if (!avatarData || !avatarRef.current) {
      alert("No avatar available for saving");
      return;
    }

    setIsSaving(true);

    try {
      // 1. PNG-Bild von der Avatar-Komponente generieren

      const pngDataURL = avatarRef.current.toPNGDataURL("transparent");

      // 2. DataURL zu Blob konvertieren

      const response = await fetch(pngDataURL);
      const blob = await response.blob();

      // 3. FormData mit Bild und Pixel-Daten erstellen

      const formData = new FormData();
      formData.append("image", blob, "avatar.png");
      formData.append("avatarData", JSON.stringify(avatarData));

      // 4. Mit authenticatedFetch an Backend senden

      const result = await authenticatedFetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
        headers: {
          // Content-Type wird von FormData automatisch gesetzt
          // Andere Headers (wie Authorization) bleiben erhalten
        },
      });

      if (result.user) {
        setCurrentUser(result.user);
        queryClient.setQueryData(["user-profile"], result.user);
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error saving avatar:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        avatarDataLength: avatarData?.length,
        hasAvatarRef: !!avatarRef.current,
      });
      alert(`Failed to save avatar: ${error.message} ❌`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = () => {
    setAvatarData(null);
    setShowResetConfirm(false);
    // Die Avatar-Komponente wird durch key-Änderung neu gerendert
    window.location.reload();
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Avatar Editor</h1>
        <p>
          {initialPixelData
            ? "Edit your existing pixel avatar"
            : "Create your own pixel avatar"}
        </p>
        {initialPixelData && (
          <div className={styles.loadedNotice}>
            Loaded your saved pixel design with {initialPixelData.length} pixels
          </div>
        )}
      </div>

      <div className={styles.editorSection}>
        <div className={styles.avatarWrapper}>
          <Avatar
            ref={avatarRef}
            sizePx={
              typeof window !== "undefined" && window.innerWidth < 600
                ? 320
                : 512
            }
            gridSize={gridSize}
            initialData={initialPixelData}
            onDataChange={handleAvatarChange}
          />
        </div>
      </div>

      <div className={styles.controls}>
        {/* Hauptaktion - Save Button prominent */}
        <div className={styles.primaryActions}>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={!avatarData || isSaving}
          >
            {isSaving ? "Saving..." : "Save avatar"}
          </button>
        </div>

        {/* Sekundäre Aktionen - weniger prominent, mit Trennung */}
        <div className={styles.secondaryActions}>
          <button onClick={handleResetClick} className={styles.resetButton}>
            Reset & Start Over
          </button>
          <div className={styles.destructiveWarning}>
            This will clear all your current work
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Reset Avatar Editor?</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to reset the avatar editor? This will:
              </p>
              <ul>
                <li>Clear all your current pixel work</li>
                <li>Remove any unsaved changes</li>
                <li>Reload the page with your last avatar</li>
              </ul>
              <p style={{ color: "var(--color-error)", fontWeight: "600" }}>
                This action cannot be undone!
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={handleResetCancel}>
                Cancel
              </button>
              <button className={styles.btnReset} onClick={handleResetConfirm}>
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="card enhanced"
            style={{
              minWidth: "220px",
              maxWidth: "95vw",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "24px 12px",
            }}
          >
            <div className="title" style={{ marginBottom: "16px" }}>
              Avatar has been saved successfully!
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
              <button
                className="btn btn-primary"
                onClick={() => (window.location.href = "/profile")}
              >
                Back to profile
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSuccessModal(false)}
              >
                Stay on the page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {avatarData && (
        <div className={styles.preview}>
          <h3>Vorschau:</h3>
          <p>Du hast {avatarData.length} Pixel erstellt</p>
          <details>
            <summary>Daten anzeigen</summary>
            <pre className={styles.dataPreview}>
              {JSON.stringify(avatarData, null, 2)}
            </pre>
          </details>
        </div>
      )} */}
    </div>
  );
};

export default AvatarEditor;
