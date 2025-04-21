import { DoorOpen, Home } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../../components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { useAuthStore } from "@/stores/user-store";
import { useNavigate } from "react-router";

export function AppSidebar() {
	let navigate = useNavigate();

	function LogOut() {
		useAuthStore.getState().clearUser();
		navigate("/auth");
	}

	return (
		<Sidebar
			collapsible="icon"
			className="dark:border-sidebar-accent border-[#CDFE04]"
		>
			<SidebarContent className="dark:bg-sidebar-accent bg-[#CDFE04]">
				<SidebarGroup>
					<SidebarGroupLabel>Tarefas</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<a href="/">
										<Home />
										<span>Menu principal</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="dark:bg-sidebar-accent bg-[#CDFE04]">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<ModeToggle />
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={LogOut}>
							<DoorOpen />
							<span>Desconectar-se ?</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
