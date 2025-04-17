import axios from "axios";

export const api_instance = axios.create({
	baseURL: import.meta.env.VITE_API_HOST,
});
