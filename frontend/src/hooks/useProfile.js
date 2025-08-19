import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../lib/config';

/**
 * Hook to fetch user profile data
 * Returns: { data: profile, isLoading, error, refetch }
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/user/user`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      return data.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes - cache retention
    retry: 2, // Retry failed requests twice
  });
};

/**
 * Hook to update user profile data
 * Returns: { mutate, isLoading, error, isSuccess }
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData) => {
      const response = await fetch(`${API_URL}/api/user/update`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update the cache with fresh data
      queryClient.setQueryData(['user-profile'], data.user);
      // Or invalidate to refetch
      // queryClient.invalidateQueries(['user-profile']);
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
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
      queryKey: ['user-profile'],
      queryFn: async () => {
        const response = await fetch(`${API_URL}/api/user/user`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to prefetch profile');
        const data = await response.json();
        return data.user;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};