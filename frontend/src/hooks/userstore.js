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

      setCurrentUser: (user) =>
        set({
          currentUser: {
            _id: user.id || user._id,
            username: user.username,
          },
        }),

      clearUser: () => set({ currentUser: null }),

      // Helper to check if user is authenticated
      isAuthenticated: () => !!get().currentUser,
    }),

    {
      name: "user-storage", // Keep original name for compatibility
      storage: zustandStorage,
    }
  )
);

export default useUserStore;
