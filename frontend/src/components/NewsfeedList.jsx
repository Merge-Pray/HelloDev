import React, { useEffect, useRef } from 'react';
import PostCard from './PostCard';

export default function NewsfeedList({ 
  posts, 
  onLike, 
  onComment, 
  onRepost,
  onLoadMore, 
  loading,
  hasNextPage 
}) {
  const observerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, loading, onLoadMore]);

  if (!posts || posts.length === 0) {
    return (
      <div className="empty-feed">
        <h3>No posts yet</h3>
        <p>Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="newsfeed-list">
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onLike={onLike}
          onComment={onComment}
          onRepost={onRepost}
        />
      ))}
      
      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>Loading more posts...</span>
        </div>
      )}
      
      {/* Intersection observer target */}
      <div ref={observerRef} style={{ height: '20px' }} />
      
      {!hasNextPage && posts.length > 0 && (
        <div className="end-of-feed">
          <p>You've reached the end!</p>
        </div>
      )}
    </div>
  );
}