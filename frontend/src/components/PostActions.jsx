import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat, Share2 } from 'lucide-react';
import RepostModal from './RepostModal';
import { API_URL } from '../lib/config';

export default function PostActions({ post, currentUser, onLike, onRepost, onToggleComments }) {
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [isLiked, setIsLiked] = useState(
    post.likes?.some(like => like.user._id === currentUser?.userID) || false
  );
  const [isReposted, setIsReposted] = useState(false); // TODO: Check if user already reposted

  const handleLike = async () => {
    try {
      const endpoint = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/api/posts/${post._id}/like`, {
        method: endpoint,
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setIsLiked(!isLiked);
        onLike(post._id, !isLiked, data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRepost = async (comment = '') => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${post._id}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment })
      });

      const data = await response.json();
      if (data.success) {
        setIsReposted(true);
        setShowRepostModal(false);
        onRepost(data.repost);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  const handleShare = () => {
    // Copy post URL to clipboard
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    // TODO: Show toast notification
  };

  return (
    <div className="post-actions">
      <button 
        className={`action-btn ${isLiked ? 'liked' : ''}`}
        onClick={handleLike}
      >
        <Heart size={20} fill={isLiked ? '#e11d48' : 'none'} />
        <span>{post.likeCount || 0}</span>
      </button>

      <button className="action-btn" onClick={onToggleComments}>
        <MessageCircle size={20} />
        <span>{post.commentCount || 0}</span>
      </button>

      <button 
        className={`action-btn ${isReposted ? 'reposted' : ''}`}
        onClick={() => setShowRepostModal(true)}
        disabled={post.author._id === currentUser?.userID}
      >
        <Repeat size={20} />
        <span>{post.repostCount || 0}</span>
      </button>

      <button className="action-btn" onClick={handleShare}>
        <Share2 size={20} />
      </button>

      {showRepostModal && (
        <RepostModal
          post={post}
          onRepost={handleRepost}
          onClose={() => setShowRepostModal(false)}
        />
      )}
    </div>
  );
}