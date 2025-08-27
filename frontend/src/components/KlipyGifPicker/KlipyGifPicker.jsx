import React, { useState, useEffect, useCallback } from "react";
import { useKlipyApi } from "./hooks/useKlipyApi";
import SearchBar from "./components/SearchBar";
import GifGrid from "./components/GifGrid";
import styles from "./KlipyGifPicker.module.css";

const KlipyGifPicker = ({
  onGifClick,
  width = 350,
  height = 400,
  searchPlaceholder = "Search KLIPY...",
}) => {
  const [gifs, setGifs] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const { searchGifs, getTrendingGifs, loading, error, hasApiKey } =
    useKlipyApi();

  useEffect(() => {
    loadInitialGifs();
  }, []);

  const loadInitialGifs = async () => {
    try {
      setInitialLoading(true);
      const data = await getTrendingGifs(0, 20);

      if (data && data.results) {
        setGifs(data.results);
        setOffset(20);
        setHasMore(data.pagination?.hasMore ?? true);
      }
    } catch (err) {
      console.error("Failed to load initial GIFs:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = useCallback(
    async (query) => {
      if (query === currentQuery) return;

      setCurrentQuery(query);
      setGifs([]);
      setOffset(0);
      setHasMore(true);

      try {
        let data;
        if (query.trim()) {
          data = await searchGifs(query, 0, 20);
        } else {
          data = await getTrendingGifs(0, 20);
        }

        if (data && data.results) {
          setGifs(data.results);
          setOffset(20);
          setHasMore(data.pagination?.hasMore ?? true);
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    },
    [currentQuery, searchGifs, getTrendingGifs]
  );

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      let data;
      if (currentQuery.trim()) {
        data = await searchGifs(currentQuery, offset, 20);
      } else {
        data = await getTrendingGifs(offset, 20);
      }

      if (data && data.results) {
        setGifs((prev) => [...prev, ...data.results]);
        setOffset((prev) => prev + 20);
        setHasMore(data.pagination?.hasMore ?? false);
      }
    } catch (err) {
      console.error("Load more failed:", err);
    }
  }, [currentQuery, offset, loading, hasMore, searchGifs, getTrendingGifs]);

  const handleGifClick = (gif) => {
    const transformedGif = {
      url: gif.url,
      preview: gif.preview,
      id: gif.id,
      title: gif.title,
      width: gif.width,
      height: gif.height,
    };

    onGifClick(transformedGif);
  };

  if (!hasApiKey) {
    return (
      <div className={styles.container} style={{ width, height }}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>
            API key not found. Please add VITE_TENOR_API_KEY to your environment
            variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ width, height }}>
      <SearchBar onSearch={handleSearch} placeholder={searchPlaceholder} />

      <div className={styles.content}>
        {initialLoading ? (
          <div className={styles.initialLoadingContainer}>
            <div className={styles.loadingSpinner}>Loading GIFs...</div>
          </div>
        ) : (
          <GifGrid
            gifs={gifs}
            onGifClick={handleGifClick}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default KlipyGifPicker;
