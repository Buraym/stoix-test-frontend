import { api_instance } from ".";
import { ITask } from "@/interfaces";

export async function GetTasks() {
	const tasks = (await api_instance.get("tasks")).data;
	return tasks;
}

export async function GetTaskById(id: number) {
	try {
		let task = (await api_instance.get(`tasks/${id}`)).data;
		task!.descriptions = task!.descriptions.map((description: any) => {
			description.id = String(description.id);
			description.list_items = description.list_items.map((item: any) => {
				item.id = String(item.id);
				return item;
			});
			return description;
		});
		return task;
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
			id: string;
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
							api_instance.post("list-items", {
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

export async function UpdateTaskById({
	id,
	title,
	color,
	descriptions,
	deleted,
	news,
}: {
	id: string;
	title: string;
	color: string;
	descriptions: Array<{
		type: "text" | "image" | "video" | "list";
		id: string;
		content: string;
		order: number;
		list_items: Array<{
			id: string;
			name: string;
			done: boolean;
			order: number;
		}>;
	}>;
	news: {
		descriptions: number[];
		list_items: number[];
	};
	deleted: {
		descriptions: number[];
		list_items: number[];
	};
}) {
	let descriptionPromises: Promise<any>[] = [];
	let addedPromises: Promise<any>[] = [];
	let deletedPromises: Promise<any>[] = [];

	for (let n = 0; n < news.descriptions.length; n++) {
		try {
			const actualDescription = descriptions.find(
				(description) => description.id === String(news.descriptions[n])
			);
			const actualDescriptionOrder = descriptions.findIndex(
				(description) => description.id === String(news.descriptions[n])
			);

			if (actualDescription!.list_items.length > 0) {
				const { description } = (
					await api_instance.post("task-descriptions", {
						type: actualDescription!.type,
						content: actualDescription!.content,
						order: actualDescriptionOrder,
						task_id: id,
					})
				).data;
				if (description) {
					for (
						let j = 0;
						j <
						descriptions[actualDescriptionOrder].list_items.length;
						j++
					) {
						addedPromises.push(
							api_instance.post("list-items", {
								name: descriptions[actualDescriptionOrder]
									.list_items[j].name,
								order: j,
								done: descriptions[actualDescriptionOrder]
									.list_items[j].done,
								task_description_id: description.id,
							})
						);
					}
				}
			} else {
				addedPromises.push(
					api_instance.post("task-descriptions", {
						type: actualDescription!.type,
						content: actualDescription!.content,
						order: actualDescriptionOrder,
						task_id: id,
					})
				);
			}
		} catch (err) {
			console.log(err);
		}
	}

	for (let n = 0; n < news.list_items.length; n++) {
		try {
			const actualTaskDescription = descriptions.find((description) =>
				description.list_items.find(
					(list_item) => list_item.id === String(news.list_items[n])
				)
			);

			const actualListItem = descriptions
				.flatMap((description) => description.list_items)
				.find(
					(list_item) => list_item.id === String(news.descriptions[n])
				);

			const actualListItemOrder =
				actualTaskDescription?.list_items.findIndex(
					(list_item) => list_item.id === String(news.descriptions[n])
				);

			addedPromises.push(
				api_instance.post("list-items", {
					name: actualListItem!.name,
					order: actualListItemOrder,
					done: actualListItem!.done,
					task_description_id: actualTaskDescription!.id,
				})
			);
		} catch (err) {
			console.log(err);
		}
	}

	let descriptionsToBeUpdated = descriptions
		.map((description, index) => {
			description.list_items = description.list_items.filter(
				(list_item) => !news.list_items.includes(Number(list_item.id))
			);
			description.order = index;
			return description;
		})
		.filter(
			(description) => !news.descriptions.includes(Number(description.id))
		);

	for (let i = 0; i < descriptionsToBeUpdated.length; i++) {
		try {
			descriptionPromises.push(
				api_instance.put(
					`task-descriptions/${descriptionsToBeUpdated[i].id}`,
					{
						type: descriptionsToBeUpdated[i].type,
						content: descriptionsToBeUpdated[i].content,
						order: descriptionsToBeUpdated[i].order,
						task_id: id,
					}
				)
			);
			if (descriptionsToBeUpdated[i].list_items.length > 0) {
				for (
					let j = 0;
					j < descriptionsToBeUpdated[i].list_items.length;
					j++
				) {
					descriptionPromises.push(
						api_instance.put(
							`list-items/${descriptionsToBeUpdated[i].list_items[j].id}`,
							{
								name: descriptionsToBeUpdated[i].list_items[j]
									.name,
								order: descriptionsToBeUpdated[i].list_items[j]
									.order,
								done: descriptionsToBeUpdated[i].list_items[j]
									.done,
								task_description_id:
									descriptionsToBeUpdated[i].id,
							}
						)
					);
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	for (let d = 0; d < deleted.descriptions.length; d++) {
		deletedPromises.push(
			api_instance.delete(`task-descriptions/${deleted.descriptions[d]}`)
		);
	}

	for (let d = 0; d < deleted.list_items.length; d++) {
		deletedPromises.push(
			api_instance.delete(`list-items/${deleted.list_items[d]}`)
		);
	}

	await Promise.all([
		...addedPromises,
		...deletedPromises,
		...descriptionPromises,
		api_instance.put(`tasks/${id}`, {
			title,
			color,
		}),
	]);

	return "Atualizado com sucesso !";
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
		await api_instance.put(`list-items/${id}`, {
			name,
			done,
			order,
			task_description_id,
		})
	).data;
	return msg;
}
