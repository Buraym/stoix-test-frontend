import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainPanelPage from "./App.tsx";

let router = createBrowserRouter([
	{
		path: "/",
		Component: MainPanelPage,
	},
]);

const root = document.getElementById("root") as HTMLElement;

createRoot(root).render(<RouterProvider router={router} />);
