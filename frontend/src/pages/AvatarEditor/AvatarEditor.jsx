import React, { useState } from 'react';
import Avatar from '../../components/avatar';
import styles from './AvatarEditor.module.css';

const AvatarEditor = () => {
  const [avatarData, setAvatarData] = useState(null);

  const handleAvatarChange = (data) => {
    setAvatarData(data);
    console.log('Avatar data changed:', data);
  };

  const handleSave = () => {
    if (avatarData) {
      console.log('Save avatar:', avatarData);
      // Hier kannst du die Daten an dein Backend senden
      alert('Avatar has been saved! (See console for data)');
    } else {
      alert('No avatar available for saving');
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
          disabled={!avatarData}
        >
          💾 Save avatar
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
