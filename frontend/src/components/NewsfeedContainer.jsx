import React, { useState, useEffect } from "react";
import FeedToggle from "./FeedToggle";
import PostComposer from "./PostComposer";
import FeedFilters from "./FeedFilters";
import NewsfeedList from "./NewsfeedList";
import EmptyFriendsFeed from "./EmptyFriendsFeed";
import SearchBar from "./SearchBar";
import useUserStore from "../hooks/userstore";
import { API_URL } from "../lib/config";
import styles from "./NewsfeedContainer.module.css";

export default function NewsfeedContainer() {
  const [posts, setPosts] = useState([]);
  const [feedType, setFeedType] = useState("all");
  const [algorithm, setAlgorithm] = useState("mixed");
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const currentUser = useUserStore((state) => state.currentUser);

  const fetchPosts = async (resetPosts = true) => {
    setLoading(true);
    setError(null);

    try {
      const currentPage = resetPosts ? 1 : page;

      let url;
      if (isSearchActive && searchQuery.trim()) {
        url = `${API_URL}/api/posts/search?q=${encodeURIComponent(
          searchQuery
        )}&page=${currentPage}&limit=20`;
      } else {
        url = `${API_URL}/api/posts/newsfeed?feedType=${feedType}&algorithm=${algorithm}&page=${currentPage}&limit=20`;
      }

      const response = await fetch(url, { credentials: "include" });

      const data = await response.json();
      if (data.success) {
        if (resetPosts) {
          setPosts(data.posts);
          setPage(2);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
          setPage((prev) => prev + 1);
        }
        setFriendsCount(data.friendsCount || 0);
        setHasNextPage(data.pagination.hasNextPage);
      } else {
        setError(data.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [feedType, algorithm, isSearchActive, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearchActive(!!query.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
  };

  const handleFeedTypeChange = (newFeedType) => {
    setFeedType(newFeedType);
  };

  const handleAlgorithmChange = (newAlgorithm) => {
    setAlgorithm(newAlgorithm);
  };

  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = (postId, isLiked, newLikeCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              likeCount: newLikeCount,
              likes: isLiked
                ? [...(post.likes || []), { user: currentUser._id }]
                : (post.likes || []).filter((like) => {
                    const likeUserId = like.user?._id || like.user;
                    return likeUserId !== currentUser._id;
                  }),
            }
          : post
      )
    );
  };

  const handleComment = (postId, newComment) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: [...(post.comments || []), newComment],
              commentCount: (post.commentCount || 0) + 1,
            }
          : post
      )
    );
  };

  const handleRepost = (newRepost) => {
    setPosts((prev) => [newRepost, ...prev]);

    setPosts((prev) =>
      prev.map((post) =>
        post._id === newRepost.originalPost._id
          ? { ...post, repostCount: (post.repostCount || 0) + 1 }
          : post
      )
    );
  };

  const handleLoadMore = () => {
    if (!loading && hasNextPage) {
      fetchPosts(false);
    }
  };

  return (
    <div className={styles.newsfeedContainer}>
      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        onClear={handleClearSearch}
        isActive={isSearchActive}
        query={searchQuery}
      />

      {/* Feed Controls - Hide during search */}
      {!isSearchActive && (
        <div className={styles.feedControls}>
           
          <FeedToggle
            feedType={feedType}
            onFeedTypeChange={handleFeedTypeChange}
            friendsCount={friendsCount}
          />         
        </div>
      )}

      {/* Post Composer - Hide during search */}
      {!isSearchActive && <PostComposer onPostCreated={handleNewPost} />}

      {/* Search Results Header */}
      {isSearchActive && (
        <div className={styles.searchResultsHeader}>
          <h3>Search Results for "{searchQuery}"</h3>
          <button onClick={handleClearSearch} className={styles.clearSearchBtn}>
            Clear Search
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={() => fetchPosts(true)}>Try Again</button>
        </div>
      )}

      {/* Empty States */}
      {!isSearchActive &&
        feedType === "friends" &&
        posts.length === 0 &&
        !loading && (
          <EmptyFriendsFeed
            friendsCount={friendsCount}
            className={styles.emptyFriendsFeed}
          />
        )}
<FeedFilters
            algorithm={algorithm}
            onAlgorithmChange={handleAlgorithmChange}
          />
      {isSearchActive && posts.length === 0 && !loading && (
        <div className={styles.emptySearchResults}>
          <h3>No posts found</h3>
          <p>Try different keywords or check your spelling.</p>
        </div>
      )}

      {/* Posts List */}
      {posts.length > 0 && (
        <NewsfeedList
          posts={posts}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onLoadMore={handleLoadMore}
          loading={loading}
          hasNextPage={hasNextPage}
          className={styles.newsfeedList}
        />
      )}
    </div>
  );
}