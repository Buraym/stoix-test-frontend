import axios from "axios";

export const api_instance = axios.create({
	baseURL: import.meta.env.VITE_API_HOST,
});

export function ExtractSrcFromEmbedded(iframeHTML: string) {
	const regex = /<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/i;
	const match = iframeHTML.match(regex);
	return match ? match[1] : null;
}
