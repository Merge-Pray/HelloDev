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
          currentUser: user ? {
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            nickname: user.nickname,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
            // Essential auth + frequently used UI fields only
            // All other profile data handled by React Query
          } : null,
        }),

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
            method: "Post",
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
        currentUser: state.currentUser
      }),
    }
  )
);

export default useUserStore;
