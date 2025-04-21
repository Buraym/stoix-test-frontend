import axios from "axios";

export const api_instance = axios.create({
	baseURL: import.meta.env.VITE_API_HOST,
	withCredentials: true,
});

api_instance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			console.log(error.response);
			window.location.href = "/auth";
		}
		return Promise.reject(error);
	}
);

export function ExtractSrcFromEmbedded(iframeHTML: string) {
	const regex = /<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/i;
	const match = iframeHTML.match(regex);
	return match ? match[1] : null;
}
