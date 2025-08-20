import { Users, Globe } from 'lucide-react';
import styles from './FeedToggle.module.css';

export default function FeedToggle({ feedType, onFeedTypeChange, friendsCount = 0 }) {
  return (
    <div className={styles.feedToggle}>
      <div className={styles.wrapper} role="group" aria-label="Feed filter">
        <button
          type="button"
          className={`${styles.btn} ${feedType === 'all' ? styles.active : ''}`}
          onClick={() => onFeedTypeChange('all')}
          aria-pressed={feedType === 'all'}
        >
          <Globe className={styles.icon} size={18} aria-hidden="true" />
          <span className={styles.label}>All Posts</span>
        </button>

        <button
          type="button"
          className={`${styles.btn} ${feedType === 'friends' ? styles.active : ''}`}
          onClick={() => onFeedTypeChange('friends')}
          aria-pressed={feedType === 'friends'}
        >
          <Users className={styles.icon} size={18} aria-hidden="true" />
          <span className={styles.label}>Friends</span>
          <span className={styles.count}>{friendsCount}</span>
        </button>
      </div>
    </div>
  );
}