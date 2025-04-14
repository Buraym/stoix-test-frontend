import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/ui/app-sidebar";
import { Separator } from "../components/ui/separator";
import { ThemeProvider } from "../components/theme-provider";

export default function MainLayout() {
	return (
		<SidebarProvider>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<AppSidebar />
				<main className="w-full">
					<div className="flex flex-col justify-start items-start w-full">
						<SidebarTrigger />
						<Separator className="h-1 bg-black" />
						<Outlet />
					</div>
				</main>
			</ThemeProvider>
		</SidebarProvider>
	);
}
