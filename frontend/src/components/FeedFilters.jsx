import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import styles from './FeedFilters.module.css';

export default function FeedFilters({ algorithm, onAlgorithmChange }) {
  const algorithms = [
    {
      key: 'chronological',
      label: 'Latest',
      icon: <Clock size={16} aria-hidden="true" />,
      description: 'Most recent posts first'
    },
    {
      key: 'engagement',
      label: 'Popular',
      icon: <TrendingUp size={16} aria-hidden="true" />,
      description: 'Most liked and commented'
    }
  ];

  return (
    <div className={styles.wrapper} role="group" aria-label="Feed filters">
      {algorithms.map((algo) => {
        const isActive = algorithm === algo.key;
        return (
          <button
            key={algo.key}
            type="button"
            className={`${styles.btn} ${isActive ? styles.active : ''}`}
            onClick={() => onAlgorithmChange(algo.key)}
            aria-pressed={isActive}
            title={algo.description}
          >
            <span className={styles.icon}>{algo.icon}</span>
            <span className={styles.label}>{algo.label}</span>
          </button>
        );
      })}
    </div>
  );
}