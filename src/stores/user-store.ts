import { createStore } from "zustand";
import { persist } from "zustand/middleware";

type UserStoreState = {
	user: { name: string; email: string };
	setUser: (user: { name: string; email: string }) => void;
	clearUser: () => void;
};

type AuthStoreActions = {
	setUser: (newUser: UserStoreState["user"]) => void;
};

type AuthStore = UserStoreState & AuthStoreActions;

export const useAuthStore = createStore<AuthStore>()(
	persist(
		(set) => ({
			user: { name: "", email: "" },
			setUser: (user: { name: string; email: string }) => set({ user }),
			clearUser: () => set({ user: { name: "", email: "" } }),
		}),
		{
			name: "user-storage",
		}
	)
);
