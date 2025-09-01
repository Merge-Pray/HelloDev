import { create } from "zustand";
import { persist } from "zustand/middleware";

const zustandStorage = {
  getItem: (name) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

const useUserStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      socket: null,

      setCurrentUser: (user) =>
        set({
          currentUser: {
            _id: user._id,
            username: user.username,
            nickname: user.nickname,
            email: user.email,
            avatar: user.avatar,
            avatarData: user.avatarData,
            aboutMe: user.aboutMe,
            country: user.country,
            city: user.city,
            age: user.age,
            status: user.status,
            devExperience: user.devExperience,
            techArea: user.techArea,
            favoriteTimeToCode: user.favoriteTimeToCode,
            favoriteLineOfCode: user.favoriteLineOfCode,
            programmingLanguages: user.programmingLanguages,
            techStack: user.techStack,
            preferredOS: user.preferredOS,
            languages: user.languages,
            gaming: user.gaming,
            otherInterests: user.otherInterests,
            favoriteDrinkWhileCoding: user.favoriteDrinkWhileCoding,
            musicGenreWhileCoding: user.musicGenreWhileCoding,
            favoriteShowMovie: user.favoriteShowMovie,
            linkedinProfile: user.linkedinProfile,
            githubProfile: user.githubProfile,
            personalWebsites: user.personalWebsites,
            profileLinksVisibleToContacts: user.profileLinksVisibleToContacts,
            isMatchable: user.isMatchable,
            rating: user.rating,
            points: user.points,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        }),

      setSocket: (socket) => set({ socket }),

      clearUser: () => {
        const currentSocket = get().socket;
        if (currentSocket) {
          currentSocket.disconnect();
        }
        set({ currentUser: null, socket: null });
        // Also remove from localStorage when clearing user
        localStorage.removeItem('user-storage');
      },

      logout: async () => {
        try {
          await fetch(`${import.meta.env.VITE_BACKENDPATH}/api/user/logout`, {
            method: 'Post',
            credentials: 'include'
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          const currentSocket = get().socket;
          if (currentSocket) {
            currentSocket.disconnect();
          }
          
          // Clear the state
          set({ currentUser: null, socket: null });
          
          // Directly remove from localStorage - most reliable method
          localStorage.removeItem('user-storage');
        }
      },
    }),

    {
      name: "user-storage",
      storage: zustandStorage,
      partialize: (state) => {
        // Only persist if currentUser exists and is not null
        if (state.currentUser) {
          return { currentUser: state.currentUser };
        }
        // Return empty object when currentUser is null - this will remove the localStorage entry
        return {};
      },
    }
  )
);

export default useUserStore;
