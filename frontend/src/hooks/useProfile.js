import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../lib/config";
import { handleAuthErrorAndRetry, isAuthError } from "../utils/tokenRefresh";
import useUserStore from "./userstore";

export const useProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const makeRequest = async () => {
        return await fetch(`${API_URL}/api/user/user`, {
          credentials: "include",
        });
      };

      let response = await makeRequest();

      if (isAuthError(response)) {
        response = await handleAuthErrorAndRetry(makeRequest);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      return data.user;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      const makeRequest = async () => {
        return await fetch(`${API_URL}/api/user/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(profileData),
        });
      };

      let response = await makeRequest();

      if (isAuthError(response)) {
        response = await handleAuthErrorAndRetry(makeRequest);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile"], data.user);

      const { setCurrentUser } = useUserStore.getState();
      setCurrentUser({
        _id: data.user.id,
        username: data.user.username,
        nickname: data.user.nickname,
      });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });
};

/**
 * Hook to fetch another user's profile data
 * @param {string} userId - The ID of the user whose profile to fetch
 */
export const useOtherUserProfile = (userId) => {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const makeRequest = async () => {
        return await fetch(`${API_URL}/api/user/profile/${userId}`, {
          credentials: "include",
        });
      };

      let response = await makeRequest();

      if (isAuthError(response)) {
        response = await handleAuthErrorAndRetry(makeRequest);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      return data.user;
    },
    staleTime: 2 * 60 * 1000,  // Fresh for 2 minutes (shorter than own profile)
    cacheTime: 5 * 60 * 1000,  // Keep in memory for 5 minutes
    retry: 2,
    enabled: !!userId, // Only run if userId is provided
  });
};

/**
 * Hook to prefetch profile data (useful for performance)
 */
export const usePrefetchProfile = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: ["user-profile"],
      queryFn: async () => {
        const makeRequest = async () => {
          return await fetch(`${API_URL}/api/user/user`, {
            credentials: "include",
          });
        };

        let response = await makeRequest();

        if (isAuthError(response)) {
          response = await handleAuthErrorAndRetry(makeRequest);
        }

        if (!response.ok) throw new Error("Failed to prefetch profile");
        const data = await response.json();
        return data.user;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};
