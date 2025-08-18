import React from 'react';
import { Users, Globe } from 'lucide-react';
import styles from './FeedToggle.module.css';

export default function FeedToggle({ feedType, onFeedTypeChange, friendsCount }) {
  return (
    <div className={styles.feedToggle}>
      <button 
        className={`${styles.toggleBtn} ${feedType === 'all' ? styles.active : ''}`}
        onClick={() => onFeedTypeChange('all')}
      >
        <Globe size={20} />
        <span>All Posts</span>
      </button>
      
      <button 
        className={`${styles.toggleBtn} ${feedType === 'friends' ? styles.active : ''}`}
        onClick={() => onFeedTypeChange('friends')}
      >
        <Users size={20} />
        <span>Friends ({friendsCount})</span>
      </button>
    </div>
  );
}