import React from 'react';
import styles from '../KlipyGifPicker.module.css';

const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className={`${styles.spinner} ${styles[`spinner-${size}`]}`}>
      <div className={styles.spinnerInner}></div>
    </div>
  );
};

export default LoadingSpinner;