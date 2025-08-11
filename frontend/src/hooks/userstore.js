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
            userID: user.userID,
            username: user.username,
          },
        }),
      clearUser: () => set({ currentUser: null }),
      //       checkToken: async () => {
      //     try {
      //       const currentUser = get().currentUser;

      //       if (!currentUser) {
      //         set({ currentUser: null });
      //         return;
      //       }

      //       const response = await fetch(
      //         `${API_URL}/api/user/${currentUser.id}`,
      //         {
      //           method: "GET",
      //           credentials: "include",
      //         }
      //       );

      //       if (response.ok) {
      //         const user = await response.json();
      //         set({ currentUser: user });
      //       } else {
      //         set({ currentUser: null });
      //       }
      //     } catch (error) {
      //       console.error("Error checking token:", error);
      //       set({ currentUser: null });
      //     }
      //   },
    }),

    {
      name: "user-storage",
      storage: zustandStorage,
    }
  )
);

export default useUserStore;
