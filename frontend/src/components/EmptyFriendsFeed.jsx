import React from 'react';
import { Users, Search, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function EmptyFriendsFeed({ friendsCount }) {
  const navigate = useNavigate();

  return (
    <div className="empty-friends-feed">
      <div className="empty-icon">
        <Users size={48} />
      </div>
      
      <h3>No friends yet!</h3>
      
      {friendsCount === 0 ? (
        <>
          <p>Connect with other developers to see their posts here.</p>
          <div className="empty-actions">
            <button 
              onClick={() => navigate('/search')}
              className="primary-btn"
            >
              <Search size={16} />
              Find Developers
            </button>
            <button 
              onClick={() => navigate('/matchoverview')}
              className="secondary-btn"
            >
              <UserPlus size={16} />
              Discover Matches
            </button>
          </div>
        </>
      ) : (
        <>
          <p>Your friends haven't posted anything yet.</p>
          <p>Encourage them to share their developer journey!</p>
          <button 
            onClick={() => navigate('/search')}
            className="secondary-btn"
          >
            <UserPlus size={16} />
            Find More Developers
          </button>
        </>
      )}
    </div>
  );
}