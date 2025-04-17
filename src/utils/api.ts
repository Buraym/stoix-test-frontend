import { UseFormSetValue } from "react-hook-form";
import { api_instance } from ".";
import { ITask } from "@/interfaces";

export async function GetTasks(setValue?: UseFormSetValue<any>) {
	try {
		const tasks = (await api_instance.get("tasks")).data;
		if (setValue) {
			setValue("tasks", tasks);
		} else {
			return { tasks };
		}
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

export async function RemoveTaskById(id: number): Promise<{ msg: string }> {
	try {
		const message = (await api_instance.delete(`tasks/${id}`)).data;
		return {
			msg: message.data.msg,
		};
	} catch (err) {
		console.log(err);
		return {
			msg: String(err),
		};
	}
}

export async function CreateTask({
	title,
	color,
	descriptions,
}: {
	title: string;
	color: string;
	descriptions: {
		type: "text" | "image" | "video" | "list";
		id: string;
		content: string;
		order: number;
	}[];
}) {
	let { msg, task } = (
		await api_instance.post("tasks", {
			title,
			color,
		})
	).data;
	let descriptionPromises: Promise<any>[] = [];
	for (let i = 0; i < descriptions.length; i++) {
		descriptionPromises.push(
			api_instance.post("task-descriptions", {
				type: descriptions[i].type,
				content: descriptions[i].content,
				order: i,
				task_id: task.id,
			})
		);
	}
	await Promise.all(descriptionPromises);

	return { msg, task };
}
