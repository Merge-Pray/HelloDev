import React from 'react';
import { TrendingUp, Clock, Zap } from 'lucide-react';

export default function FeedFilters({ algorithm, onAlgorithmChange }) {
  const algorithms = [
    {
      key: 'mixed',
      label: 'Smart Feed',
      icon: <Zap size={16} />,
      description: 'Best posts from your network'
    },
    {
      key: 'chronological',
      label: 'Latest',
      icon: <Clock size={16} />,
      description: 'Most recent posts first'
    },
    {
      key: 'engagement',
      label: 'Popular',
      icon: <TrendingUp size={16} />,
      description: 'Most liked and commented'
    }
  ];

  return (
    <div className="feed-filters">
      <h4>Feed Algorithm</h4>
      <div className="filter-buttons">
        {algorithms.map((algo) => (
          <button
            key={algo.key}
            className={`filter-btn ${algorithm === algo.key ? 'active' : ''}`}
            onClick={() => onAlgorithmChange(algo.key)}
            title={algo.description}
          >
            {algo.icon}
            <span>{algo.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}