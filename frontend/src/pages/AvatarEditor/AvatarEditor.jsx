import React, { useState, useRef } from "react";
import Avatar from "../../components/avatar";
import { authenticatedFetch } from "../../utils/authenticatedFetch";
import useUserStore from "../../hooks/userstore";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./AvatarEditor.module.css";

const AvatarEditor = () => {
  const [avatarData, setAvatarData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const avatarRef = useRef(null);
  const { setCurrentUser } = useUserStore();
  const queryClient = useQueryClient();

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
        // queryClient.setQueryData(["user-profile"], result.user);
      }

      alert("Avatar has been saved successfully! ✅");
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

  const handleReset = () => {
    setAvatarData(null);
    // Die Avatar-Komponente wird durch key-Änderung neu gerendert
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Avatar Editor</h1>
        <p>Create your own pixel avatar</p>
      </div>

      <div className={styles.editorSection}>
        <div className={styles.avatarWrapper}>
          <Avatar
            ref={avatarRef}
            sizePx={512}
            gridSize={16}
            onDataChange={handleAvatarChange}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <button
          onClick={handleSave}
          className={styles.saveButton}
          disabled={!avatarData || isSaving}
        >
          {isSaving ? "💾 Saving..." : "💾 Save avatar"}
        </button>

        <button onClick={handleReset} className={styles.resetButton}>
          🔄 Reset
        </button>
      </div>

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
