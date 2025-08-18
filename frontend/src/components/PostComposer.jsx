import React, { useState } from 'react';
import { API_URL } from '../lib/config';

export default function PostComposer({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          visibility,
          hashtags: extractHashtags(content)
        })
      });

      const data = await response.json();
      if (data.success) {
        setContent('');
        onPostCreated(data.post);
      } else {
        console.error('Error creating post:', data.message);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractHashtags = (text) => {
    const matches = text.match(/#(\w+)/g) || [];
    return matches.map(tag => tag.slice(1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="post-composer">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind? Use #hashtags and @mentions"
          maxLength={2000}
          rows={3}
          required
        />
        
        <div className="composer-actions">
          <select 
            value={visibility} 
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="contacts_only">Contacts Only</option>
            <option value="private">Private</option>
          </select>
          
          <div className="character-count">
            {content.length}/2000
          </div>
          
          <button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}