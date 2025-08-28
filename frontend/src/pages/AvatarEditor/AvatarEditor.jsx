import React, { useState } from 'react';
import Avatar from '../../components/avatar';
import styles from './AvatarEditor.module.css';

const AvatarEditor = () => {
  const [avatarData, setAvatarData] = useState(null);

  const handleAvatarChange = (data) => {
    setAvatarData(data);
    console.log('Avatar-Daten geändert:', data);
  };

  const handleSave = () => {
    if (avatarData) {
      console.log('Avatar speichern:', avatarData);
      // Hier kannst du die Daten an dein Backend senden
      alert('Avatar wurde gespeichert! (Siehe Konsole für Daten)');
    } else {
      alert('Kein Avatar zum Speichern vorhanden');
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
        <h1>🎨 Avatar Editor</h1>
        <p>Erstelle deinen eigenen 32x32 Pixel-Avatar</p>
      </div>

      <div className={styles.editorSection}>
        <div className={styles.avatarWrapper}>
          <Avatar 
            sizePx={512}
            gridSize={32}
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
          💾 Avatar speichern
        </button>
        
        <button 
          onClick={handleReset}
          className={styles.resetButton}
        >
          🔄 Zurücksetzen
        </button>
      </div>

      {avatarData && (
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
      )}
    </div>
  );
};

export default AvatarEditor;
