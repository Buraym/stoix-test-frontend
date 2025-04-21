import { DoorOpen, Home, Kanban, Settings } from "lucide-react";

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
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "react-router";

const topics = [
	{
		title: "Menu principal",
		url: "/",
		icon: Home,
	},
	{
		title: "Kanban",
		url: "/kanban",
		icon: Kanban,
	},
];

export function AppSidebar() {
	let navigate = useNavigate();

	function LogOut() {
		useAuthStore.getState().clearToken();
		navigate("/auth");
	}

	return (
		<Sidebar collapsible="icon">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Tarefas</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{topics.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<ModeToggle />
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<a href="configs">
								<Settings />
								<span>Configurações</span>
							</a>
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
