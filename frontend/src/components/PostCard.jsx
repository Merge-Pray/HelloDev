import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import PostActions from './PostActions';
import CommentSection from './CommentSection';
import RepostCard from './RepostCard';
import useUserStore from '../hooks/userstore';

export default function PostCard({ post, onLike, onComment, onRepost }) {
  const [showComments, setShowComments] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);

  const renderContent = (content) => {
    // Replace hashtags with clickable links
    let processedContent = content.replace(
      /#(\w+)/g, 
      '<span class="hashtag" data-hashtag="$1">#$1</span>'
    );
    
    // Replace mentions with clickable links
    processedContent = processedContent.replace(
      /@(\w+)/g, 
      '<span class="mention" data-username="$1">@$1</span>'
    );
    
    return { __html: processedContent };
  };

  const handleHashtagClick = (hashtag) => {
    // Navigate to hashtag page
    window.location.href = `/hashtag/${hashtag}`;
  };

  const handleMentionClick = (username) => {
    // Navigate to user profile
    window.location.href = `/user/${username}`;
  };

  // Handle clicks on hashtags and mentions
  const handleContentClick = (e) => {
    if (e.target.classList.contains('hashtag')) {
      const hashtag = e.target.dataset.hashtag;
      handleHashtagClick(hashtag);
    } else if (e.target.classList.contains('mention')) {
      const username = e.target.dataset.username;
      handleMentionClick(username);
    }
  };

  // If this is a repost, render the repost card
  if (post.isRepost) {
    return (
      <RepostCard 
        repost={post} 
        onLike={onLike}
        onComment={onComment}
        onRepost={onRepost}
      />
    );
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <img 
          src={post.author.avatar || '/default-avatar.png'} 
          alt={post.author.username}
          className="author-avatar"
        />
        <div className="author-info">
          <h4>{post.author.username}</h4>
          <div className="post-meta">
            <span className="post-time">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
            {post.author.isOnline && <span className="online-indicator">●</span>}
          </div>
        </div>
        
        {post.visibility !== 'public' && (
          <span className="visibility-badge">
            {post.visibility === 'contacts_only' ? 'Friends' : 'Private'}
          </span>
        )}
      </div>

      <div className="post-content">
        <p 
          dangerouslySetInnerHTML={renderContent(post.content)}
          onClick={handleContentClick}
        />
      </div>

      {post.hashtags && post.hashtags.length > 0 && (
        <div className="post-hashtags">
          {post.hashtags.map((tag, index) => (
            <span 
              key={index} 
              className="hashtag-pill"
              onClick={() => handleHashtagClick(tag)}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <PostActions
        post={post}
        currentUser={currentUser}
        onLike={onLike}
        onRepost={onRepost}
        onToggleComments={() => setShowComments(!showComments)}
      />

      {showComments && (
        <CommentSection
          postId={post._id}
          comments={post.comments}
          onComment={onComment}
        />
      )}
    </div>
  );
}