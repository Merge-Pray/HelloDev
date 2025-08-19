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
            userID: user.id || user._id,
            username: user.username,
            email: user.email,
            isMatchable: user.isMatchable,
            avatar: user.avatar,

            aboutMe: user.aboutMe,
            country: user.country,
            city: user.city,
            age: user.age,
            status: user.status,
            devExperience: user.devExperience,
            techArea: user.techArea,
            programmingLanguages: user.programmingLanguages,
            techStack: user.techStack,
            preferredOS: user.preferredOS,
            languages: user.languages,
            gaming: user.gaming,
            otherInterests: user.otherInterests,
            favoriteDrinkWhileCoding: user.favoriteDrinkWhileCoding,
            musicGenreWhileCoding: user.musicGenreWhileCoding,
            favoriteShowMovie: user.favoriteShowMovie,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
            points: user.points,
            rating: user.rating,
          },
        }),

      clearUser: () => set({ currentUser: null }),

      updateUser: (userData) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...userData }
            : null,
        })),
    }),

    {
      name: "user-storage",
      storage: zustandStorage,
    }
  )
);

export default useUserStore;
