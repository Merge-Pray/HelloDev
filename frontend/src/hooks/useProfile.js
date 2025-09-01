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
      console.log('useUpdateProfile: Starting profile update with data:', profileData);
      
      const makeRequest = async () => {
        console.log('useUpdateProfile: Making request to /api/user/update');
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
      console.log('useUpdateProfile: Response status:', response.status);
      console.log('useUpdateProfile: Response ok:', response.ok);

      if (isAuthError(response)) {
        console.log('useUpdateProfile: Auth error detected, retrying...');
        response = await handleAuthErrorAndRetry(makeRequest);
        console.log('useUpdateProfile: Retry response status:', response.status);
      }

      if (!response.ok) {
        console.error('useUpdateProfile: Request failed with status:', response.status);
        let errorData;
        try {
          errorData = await response.json();
          console.error('useUpdateProfile: Error data:', errorData);
        } catch (e) {
          console.error('useUpdateProfile: Could not parse error response:', e);
          errorData = { message: `HTTP ${response.status}` };
        }
        throw new Error(errorData.message || "Failed to update profile");
      }

      const result = await response.json();
      console.log('useUpdateProfile: Success response:', result);
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile"], data.user);

      const { setCurrentUser } = useUserStore.getState();
      setCurrentUser({
        _id: data.user._id,
        username: data.user.username,
        nickname: data.user.nickname,
        avatar: data.user.avatar,
        isOnline: data.user.isOnline,
        lastSeen: data.user.lastSeen,
      });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });
};

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
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!userId,
  });
};

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
