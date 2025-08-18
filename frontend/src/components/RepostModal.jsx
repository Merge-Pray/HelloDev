import React, { useState } from 'react';
import { X, Repeat } from 'lucide-react';
import styles from './RepostModal.module.css';

export default function RepostModal({ post, onRepost, onClose }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onRepost(comment.trim());
    } catch (error) {
      console.error('Error reposting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>
            <Repeat size={20} />
            Repost
          </h3>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment to your repost (optional)"
              maxLength={500}
              rows={3}
              className={styles.commentInput}
            />
            
            <div className={styles.characterCount}>
              {comment.length}/500
            </div>

            {/* Preview of original post */}
            <div className={styles.originalPostPreview}>
              <div className={styles.previewHeader}>
                <img 
                  src={post.author.avatar || '/default-avatar.png'} 
                  alt={post.author.username}
                  className={styles.previewAvatar}
                />
                <span className={styles.previewAuthor}>
                  {post.author.username}
                </span>
              </div>
              <div className={styles.previewContent}>
                {post.content.length > 100 
                  ? `${post.content.substring(0, 100)}...` 
                  : post.content
                }
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                type="button" 
                onClick={onClose}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={styles.repostBtn}
              >
                {isSubmitting ? 'Reposting...' : 'Repost'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}