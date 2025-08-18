import React from 'react';
import { Repeat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostCard from './PostCard';

export default function RepostCard({ repost, onLike, onComment, onRepost }) {
  return (
    <div className="repost-card">
      {/* Repost header */}
      <div className="repost-header">
        <Repeat size={16} />
        <img 
          src={repost.author.avatar || '/default-avatar.png'} 
          alt={repost.author.username}
          className="repost-author-avatar"
        />
        <span className="repost-info">
          <strong>{repost.author.username}</strong> reposted
        </span>
        <time className="repost-time">
          {formatDistanceToNow(new Date(repost.createdAt), { addSuffix: true })}
        </time>
      </div>

      {/* Repost comment if any */}
      {repost.repostComment && (
        <div className="repost-comment">
          <p>{repost.repostComment}</p>
        </div>
      )}

      {/* Original post content */}
      <div className="original-post">
        <PostCard 
          post={repost.originalPost} 
          onLike={onLike}
          onComment={onComment}
          onRepost={onRepost}
          isEmbedded={true}
        />
      </div>
    </div>
  );
}