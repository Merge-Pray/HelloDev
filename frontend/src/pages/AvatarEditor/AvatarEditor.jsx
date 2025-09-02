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
  const avatarRef = useRef(null);
  const { setCurrentUser } = useUserStore();
  const queryClient = useQueryClient();

  // Load existing avatar data when component mounts
  useEffect(() => {
    const loadExistingAvatarData = async () => {
      try {
        console.log('� AvatarEditor mounted - starting to load existing avatar data...');
        
        // Fetch current user data to get avatarData
        console.log('📡 Making API call to /api/user/user...');
        const userData = await authenticatedFetch('/api/user/user');
        console.log('📦 User data received:', userData);
        console.log('🔍 User object in response:', userData.user);
        console.log('🔍 Avatar data in response:', userData.user?.avatarData);
        console.log('🔍 Avatar data type:', typeof userData.user?.avatarData);
        
        if (userData.user?.avatarData) {
          console.log('✅ Found existing avatar data, type:', typeof userData.user.avatarData);
          console.log('📝 Raw avatarData value:', userData.user.avatarData);
          
          // Parse the JSON string to get pixel array
          let pixelArray;
          try {
            pixelArray = JSON.parse(userData.user.avatarData);
            console.log('✅ Successfully parsed avatar data:', pixelArray);
            console.log('📊 Parsed data info:', {
              isArray: Array.isArray(pixelArray),
              length: pixelArray?.length,
              firstFewPixels: pixelArray?.slice(0, 5)
            });
          } catch (parseError) {
            console.error('❌ Error parsing avatarData:', parseError);
            console.error('📝 Raw avatarData that failed to parse:', userData.user.avatarData);
            pixelArray = null;
          }
          
          if (pixelArray && Array.isArray(pixelArray)) {
            console.log('📥 Setting initial pixel data with', pixelArray.length, 'pixels');
            setInitialPixelData(pixelArray);
            setAvatarData(pixelArray);
            console.log('✅ State updated with pixel data');
          } else {
            console.log('❌ Pixel array is invalid:', { pixelArray, isArray: Array.isArray(pixelArray) });
          }
        } else {
          console.log('📝 No existing avatar data found - starting fresh');
          console.log('🔍 Full user data keys:', Object.keys(userData.user || {}));
        }
      } catch (error) {
        console.error('❌ Error loading avatar data:', error);
        console.error('📝 Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    };

    loadExistingAvatarData();
  }, []);

  // Debug: Watch when initialPixelData changes
  useEffect(() => {
    console.log('🔄 initialPixelData changed:', {
      hasData: !!initialPixelData,
      length: initialPixelData?.length,
      firstPixel: initialPixelData?.[0]
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
        <p>
          {initialPixelData 
            ? "✏️ Edit your existing pixel avatar" 
            : "🎨 Create your own pixel avatar"
          }
        </p>
        {initialPixelData && (
          <div className={styles.loadedNotice}>
            ✅ Loaded your saved pixel design with {initialPixelData.length} pixels
          </div>
        )}
      </div>

      <div className={styles.editorSection}>
        <div className={styles.avatarWrapper}>
          <Avatar
            ref={avatarRef}
            sizePx={512}
            gridSize={16}
            initialData={initialPixelData}
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
