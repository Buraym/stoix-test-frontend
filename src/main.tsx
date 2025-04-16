import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainLayout from "./layouts/user.tsx";
import MainPanelPage from "./pages/MainPanel.tsx";
import { api_instance } from "./utils/index.ts";

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
				path: "configs",
				Component: MainPanelPage,
			},
		],
	},
]);

const root = document.getElementById("root") as HTMLElement;

createRoot(root).render(<RouterProvider router={router} />);
