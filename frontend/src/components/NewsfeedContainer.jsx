import React, { useState, useEffect } from 'react';
import FeedToggle from './FeedToggle';
import PostComposer from './PostComposer';
import FeedFilters from './FeedFilters';
import NewsfeedList from './NewsfeedList';
import EmptyFriendsFeed from './EmptyFriendsFeed';
import { API_URL } from '../lib/config';

export default function NewsfeedContainer() {
  const [posts, setPosts] = useState([]);
  const [feedType, setFeedType] = useState('all');
  const [algorithm, setAlgorithm] = useState('mixed');
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async (resetPosts = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = resetPosts ? 1 : page;
      const response = await fetch(
        `${API_URL}/api/posts/newsfeed?feedType=${feedType}&algorithm=${algorithm}&page=${currentPage}&limit=20`,
        { credentials: 'include' }
      );
      
      const data = await response.json();
      if (data.success) {
        if (resetPosts) {
          setPosts(data.posts);
          setPage(2);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
          setPage(prev => prev + 1);
        }
        setFriendsCount(data.friendsCount);
        setHasNextPage(data.pagination.hasNextPage);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when feed type or algorithm changes
  useEffect(() => {
    fetchPosts(true);
  }, [feedType, algorithm]);

  const handleFeedTypeChange = (newFeedType) => {
    setFeedType(newFeedType);
  };

  const handleAlgorithmChange = (newAlgorithm) => {
    setAlgorithm(newAlgorithm);
  };

  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (postId, isLiked, newLikeCount) => {
    setPosts(prev => prev.map(post => 
      post._id === postId 
        ? { ...post, likeCount: newLikeCount }
        : post
    ));
  };

  const handleComment = (postId, newComment) => {
    setPosts(prev => prev.map(post => 
      post._id === postId 
        ? { 
            ...post, 
            comments: [...(post.comments || []), newComment],
            commentCount: (post.commentCount || 0) + 1
          }
        : post
    ));
  };

  const handleRepost = (newRepost) => {
    // Add repost to the top of the feed
    setPosts(prev => [newRepost, ...prev]);
    
    // Update original post repost count
    setPosts(prev => prev.map(post => 
      post._id === newRepost.originalPost._id 
        ? { ...post, repostCount: (post.repostCount || 0) + 1 }
        : post
    ));
  };

  const handleLoadMore = () => {
    if (!loading && hasNextPage) {
      fetchPosts(false);
    }
  };

  return (
    <div className="newsfeed-container">
      {/* Feed Controls */}
      <div className="feed-controls">
        <FeedToggle 
          feedType={feedType}
          onFeedTypeChange={handleFeedTypeChange}
          friendsCount={friendsCount}
        />
        
        <FeedFilters 
          algorithm={algorithm} 
          onAlgorithmChange={handleAlgorithmChange} 
        />
      </div>

      {/* Post Composer */}
      <PostComposer onPostCreated={handleNewPost} />

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchPosts(true)}>Try Again</button>
        </div>
      )}

      {/* Empty Friends Feed */}
      {feedType === 'friends' && posts.length === 0 && !loading && (
        <EmptyFriendsFeed friendsCount={friendsCount} />
      )}

      {/* Posts List */}
      {(feedType === 'all' || posts.length > 0) && (
        <NewsfeedList 
          posts={posts}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onLoadMore={handleLoadMore}
          loading={loading}
          hasNextPage={hasNextPage}
        />
      )}
    </div>
  );
}