import React, { useState } from 'react';
import styles from '../KlipyGifPicker.module.css';
import LoadingSpinner from './LoadingSpinner';

const GifItem = ({ gif, onGifClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (imageLoaded && !imageError) {
      onGifClick(gif);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className={styles.gifItem} onClick={handleClick}>
      {!imageLoaded && (
        <div className={styles.gifItemPlaceholder}>
          <LoadingSpinner size="small" />
        </div>
      )}
      {!imageError ? (
        <img
          src={gif.preview || gif.url}
          alt={gif.title || 'GIF'}
          className={`${styles.gifItemImage} ${imageLoaded ? styles.loaded : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className={styles.gifItemError}>
          <span>Failed to load</span>
        </div>
      )}
    </div>
  );
};

export default GifItem;