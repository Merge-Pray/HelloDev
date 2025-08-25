import { useState, useCallback } from "react";

const KLIPY_BASE_URL = "https://api.klipy.com/api/v1";


const FALLBACK_GIFS = [
  {
    id: "demo-1",
    url: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif",
    preview: "https://media.giphy.com/media/13HgwGsXF0aiGY/200w.gif",
    title: "Coding Cat",
    width: 480,
    height: 270,
  },
  {
    id: "demo-2",
    url: "https://media.giphy.com/media/ZVik7pBtu9dNS/giphy.gif",
    preview: "https://media.giphy.com/media/ZVik7pBtu9dNS/200w.gif",
    title: "Programming",
    width: 480,
    height: 270,
  },
  {
    id: "demo-3",
    url: "https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif",
    preview: "https://media.giphy.com/media/LmNwrBhejkK9EFP504/200w.gif",
    title: "Developer Life",
    width: 480,
    height: 270,
  },
  {
    id: "demo-4",
    url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
    preview: "https://media.giphy.com/media/JIX9t2j0ZTN9S/200w.gif",
    title: "Debugging",
    width: 480,
    height: 270,
  },
  {
    id: "demo-5",
    url: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
    preview: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/200w.gif",
    title: "Hello World",
    width: 480,
    height: 270,
  },
  {
    id: "demo-6",
    url: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif",
    preview: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/200w.gif",
    title: "Code Review",
    width: 480,
    height: 270,
  },
];

export const useKlipyApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_TENOR_API_KEY; // Using existing env var name

  const makeRequest = useCallback(
    async (endpoint, params = {}) => {
      if (!apiKey) {
        throw new Error("VITE_TENOR_API_KEY is required for Klipy API");
      }

      const url = new URL(`${KLIPY_BASE_URL}/${apiKey}${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });


      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Invalid API key. Please get a proper Klipy API key from https://klipy.com/docs"
          );
        }
        const errorText = await response.text();
        throw new Error(
          `API request failed: ${response.status} - ${errorText}`
        );
      }

      if (response.status === 204) {
        return { results: [], pagination: { hasMore: false } };
      }

      const text = await response.text();

      if (!text) {
        return { results: [], pagination: { hasMore: false } };
      }

      try {
        const data = JSON.parse(text);
        if (data.result && data.data && data.data.data) {
          return {
            results: data.data.data.map(gif => ({
              id: gif.id,
              url: gif.file.hd.gif.url,
              preview: gif.file.sm.gif.url,
              title: gif.title,
              width: gif.file.hd.gif.width,
              height: gif.file.hd.gif.height
            })),
            pagination: {
              offset: (data.data.current_page - 1) * data.data.per_page,
              limit: data.data.per_page,
              total: data.data.total || 1000,
              hasMore: data.data.has_next || false
            }
          };
        }
        
        return data;
      } catch (err) {
        return { results: [], pagination: { hasMore: false } };
      }
    },
    [apiKey]
  );

  const getFallbackData = useCallback((query, offset = 0, limit = 20) => {
    let filteredGifs = FALLBACK_GIFS;

    if (query && query.trim()) {
      filteredGifs = FALLBACK_GIFS.filter((gif) =>
        gif.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    const start = offset;
    const end = offset + limit;
    const results = filteredGifs.slice(start, end);

    return {
      results,
      pagination: {
        offset,
        limit,
        total: filteredGifs.length,
        hasMore: end < filteredGifs.length,
      },
    };
  }, []);

  const searchGifs = useCallback(
    async (query, offset = 0, limit = 20) => {
      setLoading(true);
      setError(null);

      try {
        const data = await makeRequest("/gifs/search", {
          q: query,
          page: Math.floor(offset / limit) + 1,
          per_page: limit,
          customer_id: "hellodev_user_" + Date.now(),
          locale: "us",
          content_filter: "medium"
        });

        if (!data.results || data.results.length === 0) {
          return getFallbackData(query, offset, limit);
        }

        return data;
      } catch (err) {
        setError(null);
        return getFallbackData(query, offset, limit);
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, getFallbackData]
  );

  const getTrendingGifs = useCallback(
    async (offset = 0, limit = 20) => {
      setLoading(true);
      setError(null);

      try {
        const data = await makeRequest("/gifs/trending", {
          page: Math.floor(offset / limit) + 1,
          per_page: limit,
          customer_id: "hellodev_user_" + Date.now(),
          locale: "us"
        });

        // If API returns empty results, use fallback
        if (!data.results || data.results.length === 0) {
          return getFallbackData("", offset, limit);
        }

        return data;
      } catch (err) {
        setError(null); // Don't show error, just use fallback
        return getFallbackData("", offset, limit);
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, getFallbackData]
  );

  const getFavoriteGifs = useCallback(
    async (offset = 0, limit = 20) => {
      setLoading(true);
      setError(null);

      try {
        const data = await makeRequest("/gifs/recent/hellodev_user", {
          page: Math.floor(offset / limit) + 1,
          per_page: limit,
        });

        // If API returns empty results, use fallback
        if (!data.results || data.results.length === 0) {
          return getFallbackData("", offset, limit);
        }

        return data;
      } catch (err) {
        setError(null); // Don't show error, just use fallback
        return getFallbackData("", offset, limit);
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, getFallbackData]
  );

  return {
    searchGifs,
    getTrendingGifs,
    getFavoriteGifs,
    loading,
    error,
    hasApiKey: !!apiKey,
  };
};
