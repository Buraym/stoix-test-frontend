import { Home, Kanban, Settings } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../../components/ui/sidebar";

const topics = [
	{
		title: "Menu principal",
		url: "",
		icon: Home,
	},
	{
		title: "Kanban",
		url: "kanban",
		icon: Kanban,
	},
	{
		title: "Configurações",
		url: "configs",
		icon: Settings,
	},
];

export function AppSidebar() {
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
		</Sidebar>
	);
}
