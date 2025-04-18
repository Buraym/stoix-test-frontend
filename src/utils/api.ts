import { api_instance } from ".";
import { ITask } from "@/interfaces";

export async function GetTasks() {
	try {
		const tasks = (await api_instance.get("tasks")).data;
		return tasks;
	} catch (err) {
		console.log(err);
	}
}

export async function GetTasksByTitle(title: string): Promise<ITask[]> {
	try {
		const tasks = (
			await api_instance.get("tasks/search", {
				params: {
					title,
				},
			})
		).data;
		return tasks;
	} catch (err) {
		console.log(err);
		return [];
	}
}

export async function RemoveTaskById(id: number): Promise<string> {
	const message = (await api_instance.delete(`tasks/${id}`)).data;
	return message.msg;
}

export async function CreateTask({
	title,
	color,
	descriptions,
}: {
	title: string;
	color: string;
	descriptions: Array<{
		type: "text" | "image" | "video" | "list";
		id: string;
		content: string;
		order: number;
		list_items: Array<{
			name: string;
			done: boolean;
		}>;
	}>;
}) {
	let { msg, task } = (
		await api_instance.post("tasks", {
			title,
			color,
		})
	).data;
	let descriptionPromises: Promise<any>[] = [];
	for (let i = 0; i < descriptions.length; i++) {
		try {
			if (descriptions[i].list_items.length > 0) {
				const { description } = (
					await api_instance.post("task-descriptions", {
						type: descriptions[i].type,
						content: descriptions[i].content,
						order: i,
						task_id: task.id,
					})
				).data;
				if (description) {
					for (
						let j = 0;
						j < descriptions[i].list_items.length;
						j++
					) {
						descriptionPromises.push(
							api_instance.post("list-item", {
								name: descriptions[i].list_items[j].name,
								order: j,
								done: descriptions[i].list_items[j].done,
								task_description_id: description.id,
							})
						);
					}
				}
			} else {
				descriptionPromises.push(
					api_instance.post("task-descriptions", {
						type: descriptions[i].type,
						content: descriptions[i].content,
						order: i,
						task_id: task.id,
					})
				);
			}
		} catch (err) {
			console.log(err);
		}
	}
	await Promise.all(descriptionPromises);

	return { msg, task };
}

export async function ChangeListItemChecked({
	id,
	name,
	order,
	done,
	task_description_id,
}: {
	id: number;
	name: string;
	order: number;
	done: boolean;
	task_description_id: number;
}) {
	const { msg } = (
		await api_instance.put(`list-item/${id}`, {
			name,
			done,
			order,
			task_description_id,
		})
	).data;
	return msg;
}
