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

      setCurrentUser: (user) => {
        try {
          // Clean user data to avoid any potential circular references
          const cleanUser = user ? {
            _id: user._id,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
          } : null;
          
          // Test if the cleaned user can be JSON stringified
          if (cleanUser) {
            JSON.stringify(cleanUser);
          }
          
          set({ currentUser: cleanUser });
        } catch (error) {
          console.error('❌ Error setting user in store:', error);
          console.log('🔧 Attempting to set user with minimal data only');
          
          // Fallback to absolute minimum data
          const minimalUser = user ? {
            _id: String(user._id || ''),
            username: String(user.username || ''),
            nickname: String(user.nickname || user.username || ''),
            avatar: user.avatar && typeof user.avatar === 'string' ? user.avatar : null,
          } : null;
          
          set({ currentUser: minimalUser });
        }
      },

      setSocket: (socket) => set({ socket }),

      clearUser: () => {
        const currentSocket = get().socket;
        if (currentSocket) {
          currentSocket.disconnect();
        }
        set({ currentUser: null, socket: null });
        localStorage.removeItem("user-storage");
      },

      logout: async () => {
        try {
          await fetch(`${import.meta.env.VITE_BACKENDPATH}/api/user/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          const currentSocket = get().socket;
          if (currentSocket) {
            currentSocket.disconnect();
          }
          set({ currentUser: null, socket: null });
          localStorage.removeItem("user-storage");
        }
      },
    }),

    {
      name: "user-storage",
      storage: zustandStorage,
      partialize: (state) => ({
        currentUser: state.currentUser,
        // Exclude socket from persistence to avoid circular reference
      }),
    }
  )
);

export default useUserStore;
