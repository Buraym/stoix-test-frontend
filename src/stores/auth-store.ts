import { createStore } from "zustand";
import { persist } from "zustand/middleware";

type AuthStoreState = {
	token: string;
	setToken: (token: string) => void;
	clearToken: () => void;
};

type AuthStoreActions = {
	setToken: (newToken: AuthStoreState["token"]) => void;
};

type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = createStore<AuthStore>()(
	persist(
		(set) => ({
			token: "",
			setToken: (token: string) => set({ token }),
			clearToken: () => set({ token: "" }),
		}),
		{
			name: "auth-storage",
		}
	)
);

// export const useAuthStore = create<AuthStore>()((set) => ({
// 	token: null,
// 	user: null,
// 	setToken: (token: string) => set({ token }),
// 	clearToken: () => set({ token: null }),
// }));
