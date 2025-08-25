import React, { useEffect, useRef, useCallback } from 'react';
import styles from '../KlipyGifPicker.module.css';
import GifItem from './GifItem';
import LoadingSpinner from './LoadingSpinner';

const GifGrid = ({ 
  gifs, 
  onGifClick, 
  onLoadMore, 
  hasMore, 
  loading, 
  error 
}) => {
  const observerRef = useRef();
  const loadMoreRef = useRef();

  const lastGifElementRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!loading && gifs.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyMessage}>No GIFs found</p>
      </div>
    );
  }

  return (
    <div className={styles.gifGrid}>
      {gifs.map((gif, index) => {
        const isLast = index === gifs.length - 1;
        return (
          <div
            key={gif.id || index}
            ref={isLast ? lastGifElementRef : null}
          >
            <GifItem gif={gif} onGifClick={onGifClick} />
          </div>
        );
      })}
      
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default GifGrid;