import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../lib/config";

export const useProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/user/user`, {
        credentials: "include",
      });

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
      const response = await fetch(`${API_URL}/api/user/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile"], data.user);
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
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
        const response = await fetch(`${API_URL}/api/user/user`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to prefetch profile");
        const data = await response.json();
        return data.user;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};
