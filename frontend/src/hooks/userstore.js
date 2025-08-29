import { create } from "zustand";
import { persist } from "zustand/middleware";

// Samsung Internet Browser detection
const isSamsungInternet = () => {
  return typeof navigator !== 'undefined' && /SamsungBrowser/i.test(navigator.userAgent);
};

const zustandStorage = {
  getItem: (name) => {
    try {
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(name, stringValue);
      
      // Samsung Browser sometimes needs extra verification
      if (isSamsungInternet()) {
        setTimeout(() => {
          const verification = localStorage.getItem(name);
          if (verification !== stringValue) {
            console.warn('Samsung Browser: localStorage write verification failed, retrying...');
            localStorage.setItem(name, stringValue);
          }
        }, 10);
      }
    } catch (error) {
      console.error('localStorage setItem error:', error);
      // Try again after a brief delay for Samsung Browser
      if (isSamsungInternet()) {
        setTimeout(() => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (retryError) {
            console.error('localStorage retry failed:', retryError);
          }
        }, 50);
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
      
      // Samsung Browser verification for removal
      if (isSamsungInternet()) {
        setTimeout(() => {
          if (localStorage.getItem(name) !== null) {
            console.warn('Samsung Browser: localStorage removal verification failed, retrying...');
            localStorage.removeItem(name);
          }
        }, 10);
      }
    } catch (error) {
      console.error('localStorage removeItem error:', error);
    }
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
            method: 'POST',
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
