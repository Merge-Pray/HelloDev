import { create } from "zustand";
import { persist } from "zustand/middleware";

// Detect Samsung browser
const isSamsungBrowser = () => {
  return /SamsungBrowser/i.test(navigator.userAgent);
};

const zustandStorage = {
  getItem: (name) => {
    try {
      if (isSamsungBrowser()) {
        // For Samsung browser, also try sessionStorage as fallback
        const item = localStorage.getItem(name) || sessionStorage.getItem(name + '_samsung');
        return item ? JSON.parse(item) : null;
      }
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Zustand getItem error:", error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(name, jsonValue);
      
      if (isSamsungBrowser()) {
        // For Samsung browser, also store in sessionStorage as backup
        sessionStorage.setItem(name + '_samsung', jsonValue);
        console.log("🗄️ SAMSUNG: Stored in both localStorage and sessionStorage");
      }
    } catch (error) {
      console.error("Zustand setItem error:", error);
      if (isSamsungBrowser()) {
        // Fallback to sessionStorage only for Samsung
        try {
          sessionStorage.setItem(name + '_samsung', JSON.stringify(value));
          console.log("🗄️ SAMSUNG: Fallback to sessionStorage only");
        } catch (sessionError) {
          console.error("Samsung sessionStorage fallback failed:", sessionError);
        }
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
      if (isSamsungBrowser()) {
        sessionStorage.removeItem(name + '_samsung');
      }
    } catch (error) {
      console.error("Zustand removeItem error:", error);
    }
  },
};

const useUserStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      socket: null,

      setCurrentUser: (user) => {
        console.log("🗄️ ZUSTAND: setCurrentUser called", {
          hasUser: !!user,
          userId: user?._id,
          username: user?.username,
          timestamp: new Date().toISOString()
        });
        
        set({
          currentUser: user
            ? {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                nickname: user.nickname,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
              }
            : null,
        });
        
        console.log("🗄️ ZUSTAND: currentUser updated");
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
      }),
    }
  )
);

export default useUserStore;
