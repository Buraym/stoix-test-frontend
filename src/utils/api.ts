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
