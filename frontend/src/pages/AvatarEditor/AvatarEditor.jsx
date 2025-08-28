import React, { useState, useRef } from 'react';
import Avatar from '../../components/avatar';
import { authenticatedFetch } from '../../utils/authenticatedFetch';
import useUserStore from '../../hooks/userstore';
import styles from './AvatarEditor.module.css';

const AvatarEditor = () => {
  const [avatarData, setAvatarData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const avatarRef = useRef(null);
  const { setCurrentUser, currentUser } = useUserStore();

  const handleAvatarChange = (data) => {
    setAvatarData(data);
    console.log('Avatar data changed:', data);
  };

  const handleSave = async () => {
    if (!avatarData || !avatarRef.current) {
      alert('No avatar available for saving');
      return;
    }

    console.log('Starting avatar save process...');
    console.log('Avatar data:', avatarData);
    console.log('Avatar ref:', avatarRef.current);

    setIsSaving(true);
    
    try {
      // 1. PNG-Bild von der Avatar-Komponente generieren
      console.log('Generating PNG...');
      const pngDataURL = avatarRef.current.toPNGDataURL('transparent');
      console.log('PNG DataURL generated, length:', pngDataURL.length);
      
      // 2. DataURL zu Blob konvertieren
      console.log('Converting to blob...');
      const response = await fetch(pngDataURL);
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size, 'type:', blob.type);
      
      // 3. FormData mit Bild und Pixel-Daten erstellen
      console.log('Creating FormData...');
      const formData = new FormData();
      formData.append('image', blob, 'avatar.png');
      formData.append('avatarData', JSON.stringify(avatarData));
      console.log('FormData created');
      
      // 4. Mit authenticatedFetch an Backend senden
      console.log('Sending to backend...');
      const result = await authenticatedFetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        headers: {
          // Content-Type wird von FormData automatisch gesetzt
          // Andere Headers (wie Authorization) bleiben erhalten
        },
      });
      
      console.log('Avatar saved successfully:', result);
      
      // User Store mit neuer Avatar URL aktualisieren
      if (result.user && currentUser) {
        setCurrentUser({
          ...currentUser,
          avatar: result.user.avatar,
          avatarData: result.user.avatarData
        });
        console.log('User store updated with new avatar:', result.user.avatar);
      }
      
      alert('Avatar has been saved successfully! ✅');
      
    } catch (error) {
      console.error('Error saving avatar:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        avatarDataLength: avatarData?.length,
        hasAvatarRef: !!avatarRef.current
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
          {isSaving ? '💾 Saving...' : '💾 Save avatar'}
        </button>
        
        <button 
          onClick={handleReset}
          className={styles.resetButton}
        >
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
