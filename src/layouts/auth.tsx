import { Outlet } from "react-router";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<main className="w-screen h-screen">
				<Outlet />
			</main>
			<Toaster />
		</ThemeProvider>
	);
}
