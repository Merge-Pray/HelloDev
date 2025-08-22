# User Profile Hooks Guide

## Overview

This guide explains how to use the user profile hooks in the HelloDev frontend application.

## Hooks Available

### 1. `useProfile()` - Own Profile Data
Fetches the current logged-in user's complete profile data.

```javascript
import { useProfile } from './hooks/useProfile';

function MyProfilePage() {
  const { data: profileData, isLoading, error, refetch } = useProfile();
  
  if (isLoading) return <div>Loading your profile...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Welcome, {profileData.username}!</h1>
      <p>Email: {profileData.email}</p>
      <p>About: {profileData.aboutMe}</p>
      {/* All profile fields available */}
    </div>
  );
}
```

### 2. `useOtherUserProfile(userId)` - Other Users' Profile Data
Fetches another user's profile data by their user ID.

```javascript
import { useOtherUserProfile } from './hooks/useProfile';

function UserCard({ userId }) {
  const { data: userProfile, isLoading, error } = useOtherUserProfile(userId);
  
  if (isLoading) return <div>Loading user...</div>;
  if (error) return <div>User not found</div>;
  
  return (
    <div className="user-card">
      <img src={userProfile.avatar} alt={userProfile.username} />
      <h3>{userProfile.nickname}</h3>
      <p>@{userProfile.username}</p>
      <p>{userProfile.aboutMe}</p>
      <div>
        <strong>Skills:</strong>
        {userProfile.programmingLanguages?.map(lang => (
          <span key={lang}>{lang}</span>
        ))}
      </div>
    </div>
  );
}
```

### 3. `useUpdateProfile()` - Update Own Profile
Mutation hook for updating the current user's profile.

```javascript
import { useUpdateProfile } from './hooks/useProfile';

function EditProfileForm() {
  const updateProfile = useUpdateProfile();
  
  const handleSubmit = async (formData) => {
    try {
      await updateProfile.mutateAsync(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={updateProfile.isLoading}
      >
        {updateProfile.isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
```

## Usage Examples

### User List Component
```javascript
function UserList({ userIds }) {
  return (
    <div className="user-list">
      {userIds.map(userId => (
        <UserCard key={userId} userId={userId} />
      ))}
    </div>
  );
}
```

### Post Author Display
```javascript
function PostCard({ post }) {
  const { data: author } = useOtherUserProfile(post.authorId);
  
  return (
    <div className="post">
      <div className="post-header">
        <img src={author?.avatar} alt={author?.username} />
        <span>{author?.nickname || 'Loading...'}</span>
      </div>
      <div className="post-content">
        {post.content}
      </div>
    </div>
  );
}
```

### Match Suggestions
```javascript
function MatchSuggestions({ matchIds }) {
  return (
    <div className="matches">
      <h2>Suggested Matches</h2>
      {matchIds.map(userId => {
        const { data: user, isLoading } = useOtherUserProfile(userId);
        
        if (isLoading) return <div key={userId}>Loading...</div>;
        
        return (
          <div key={userId} className="match-card">
            <h3>{user.nickname}</h3>
            <p>Skills: {user.programmingLanguages?.join(', ')}</p>
            <p>Location: {user.city}, {user.country}</p>
            <button>Connect</button>
          </div>
        );
      })}
    </div>
  );
}
```

## Key Features

### Automatic Caching
- Each user's data is cached separately
- Multiple components requesting the same user = single API call
- Smart cache invalidation and background updates

### Performance Optimized
- `enabled: !!userId` prevents unnecessary calls
- Shorter cache time for other users (2 min vs 5 min for own profile)
- Automatic cleanup of unused data

### Error Handling
- Built-in retry logic
- Automatic token refresh on auth errors
- Graceful error states

## Data Structure

### Own Profile Data (from `useProfile`)
```javascript
{
  id: "user_id",
  username: "johndoe",
  nickname: "John",
  email: "john@example.com",
  avatar: "avatar_url",
  aboutMe: "Full stack developer...",
  country: "Germany",
  city: "Berlin",
  age: 28,
  programmingLanguages: ["JavaScript", "Python"],
  techStack: ["React", "Node.js"],
  // ... all profile fields
}
```

### Other User's Profile Data (from `useOtherUserProfile`)
```javascript
{
  id: "user_id",
  username: "janedoe", 
  nickname: "Jane",
  avatar: "avatar_url",
  aboutMe: "Frontend specialist...",
  country: "France",
  city: "Paris",
  programmingLanguages: ["JavaScript", "TypeScript"],
  techStack: ["Vue.js", "React"],
  // ... public profile fields (no email, private data)
}
```

## Best Practices

1. **Always handle loading states** - Users appreciate feedback
2. **Provide fallbacks** - Show placeholders when data is loading
3. **Use conditional rendering** - Check if data exists before accessing properties
4. **Don't fetch unnecessarily** - Only call `useOtherUserProfile` when you have a valid userId
5. **Cache efficiently** - Let React Query handle the caching, don't store in local state

## Migration from Direct Fetches

If you have existing components doing direct fetches:

```javascript
// OLD: Direct fetch
useEffect(() => {
  fetch(`/api/user/profile/${userId}`)
    .then(res => res.json())
    .then(setUserData);
}, [userId]);

// NEW: Use the hook
const { data: userData } = useOtherUserProfile(userId);
```

This gives you automatic caching, error handling, and loading states!