import { z } from "zod";

export interface ITask {
	id: number;
	title: string;
	color: string;
	created_at: string;
	updated_at: string;
	descriptions: Array<{
		id: number;
		type: "text" | "image" | "video" | "list";
		content: string;
		order: number;
		task_id: number;
		created_at: string;
		updated_at: string;
	}>;
}

export const tasksSchema: z.ZodType<ITask> = z.object({
	id: z.number(),
	title: z.string(),
	color: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	descriptions: z.array(
		z.object({
			id: z.number(),
			type: z.enum(["text", "image", "video", "list"]),
			content: z.string(),
			order: z.number(),
			task_id: z.number(),
			created_at: z.string(),
			updated_at: z.string(),
		})
	),
});
