import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainLayout from "./layouts/user.tsx";
import MainPanelPage from "./pages/MainPanel.tsx";
import CreateTaskPage from "./pages/CreateTaskPage.tsx";

let router = createBrowserRouter([
	{
		path: "/",
		Component: MainLayout,
		children: [
			{
				index: true,
				Component: MainPanelPage,
			},
			{
				path: "create-task",
				Component: CreateTaskPage,
			},
			{
				path: "configs",
				Component: MainPanelPage,
			},
		],
	},
]);

const root = document.getElementById("root") as HTMLElement;

createRoot(root).render(<RouterProvider router={router} />);
