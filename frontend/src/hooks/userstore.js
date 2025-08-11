import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) =>
        set({
          currentUser: {
            userID: user.userID,
            username: user.username,
          },
        }),
      clearUser: () => set({ currentUser: null }),
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
