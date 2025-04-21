import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainLayout from "./layouts/user.tsx";
import MainPanelPage from "./pages/MainPanel.tsx";
import CreateTaskPage from "./pages/CreateTaskPage.tsx";
import AuthLayout from "./layouts/auth.tsx";
import LoginPage from "./pages/auth/LoginPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";

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
				path: "task/:taskId",
				loader: async ({ params }) => {
					return { id: params.taskId };
				},
				Component: CreateTaskPage,
			},
		],
	},
	{
		path: "/auth",
		Component: AuthLayout,
		children: [
			{
				index: true,
				Component: LoginPage,
			},
			{
				path: "register",
				Component: RegisterPage,
			},
		],
	},
]);

const root = document.getElementById("root") as HTMLElement;

createRoot(root).render(<RouterProvider router={router} />);
