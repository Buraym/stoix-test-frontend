import { UseFormReturn } from "react-hook-form";
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
		list_items: Array<{
			id: number;
			name: string;
			done: boolean;
			order: number;
		}>;
		created_at: string;
		updated_at: string;
	}>;
}

export interface IDescription {
	id: string;
	type: "text" | "image" | "video" | "list";
	content: string;
	order: number;
	list_items: {
		id: string;
		name: string;
		done: boolean;
		order: number;
	}[];
}

export interface ISortableItem {
	id: string;
	content: string;
	type: "video" | "image" | "text" | "list";
	list_items: {
		id: string;
		name: string;
		done: boolean;
		order: number;
	}[];
	onChange: any;
	addDescription: any;
	removeDescription: any;
	RemoveListItem: any;
}

export interface IDescriptionDnDColumn {
	onChange: any;
	addDescriptionList: any;
	removeDescription: any;
	RemoveListItem: any;
	form: UseFormReturn<
		{
			title: string;
			color: string;
			descriptions: {
				type: "text" | "image" | "video" | "list";
				id: string;
				content: string;
				order: number;
				list_items: {
					id: string;
					name: string;
					done: boolean;
					order: number;
				}[];
			}[];
			new: {
				descriptions: number[];
				list_items: number[];
			};
			removed: {
				descriptions: number[];
				list_items: number[];
			};
		},
		any,
		{
			title: string;
			color: string;
			descriptions: {
				type: "text" | "image" | "video" | "list";
				id: string;
				content: string;
				order: number;
				list_items: {
					id: string;
					name: string;
					done: boolean;
					order: number;
				}[];
			}[];
			new: {
				descriptions: number[];
				list_items: number[];
			};
			removed: {
				descriptions: number[];
				list_items: number[];
			};
		}
	>;
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
			list_items: z.array(
				z.object({
					id: z.number(),
					name: z.string(),
					done: z.boolean(),
					order: z.number(),
					created_at: z.string(),
					updated_at: z.string(),
				})
			),
			created_at: z.string(),
			updated_at: z.string(),
		})
	),
});
