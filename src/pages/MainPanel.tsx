import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { BadgePlus, Search, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useEffect } from "react";
import {
	ChangeListItemChecked,
	GetTasks,
	GetTasksByTitle,
	RemoveTaskById,
} from "@/utils/api";
import { tasksSchema } from "@/interfaces";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const formSchema = z.object({
	taskTitle: z.string().min(0),
	tasks: z.array(tasksSchema),
	createTask: z.object({
		title: z.string(),
		color: z.string(),
		descriptions: z.array(
			z.object({
				tipe: z.enum(["text", "image", "video", "list"]),
				content: z.string(),
				order: z.number(),
			})
		),
	}),
});

export default function MainPanelPage() {
	let form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			taskTitle: "",
			tasks: [],
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const tasks = await GetTasksByTitle(values.taskTitle);
		form.setValue("tasks", tasks);
	}

	async function ListTasks() {
		try {
			const tasks = await GetTasks();
			form.setValue("tasks", tasks);
		} catch (err) {
			toast("Houve um erro ao listar tarefas !");
			console.log(err);
		}
	}

	async function ChangeCheckedStatus({
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
		try {
			const tasks = form.watch("tasks").map((task) => {
				task.descriptions = task.descriptions.map((description) => {
					if (description.id === task_description_id) {
						description.list_items = description.list_items.map(
							(item) => {
								if (item.id === id) {
									item.done = done;
								}
								return item;
							}
						);
					}
					return description;
				});
				return task;
			});
			form.setValue("tasks", tasks);
			const message = await ChangeListItemChecked({
				id,
				name,
				order,
				done,
				task_description_id,
			});
			toast(message);
		} catch (err) {
			toast("Houve um erro ao atualizar o status do item da lista !");
			console.log(err);
		}
	}

	async function DeleteTask(id: number) {
		try {
			const message = await RemoveTaskById(id);
			const tasks = form.watch("tasks").filter((task) => task.id === id);
			form.setValue("tasks", tasks);
			toast(message);
		} catch (err) {
			console.log(err);
			toast("Houve um erro ao deletar o tarefa !");
		}
	}

	useEffect(() => {
		ListTasks();
	}, []);

	return (
		<div className="flex flex-col items-center justify-start w-full max-w-screen h-full p-4 gap-y-4 ">
			<div className="flex justify-start items-center w-full gap-x-2">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-x-2 flex"
					>
						<FormField
							control={form.control}
							name="taskTitle"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Título da tarefa"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							variant="outline"
							type="submit"
							className="dark:text-[#CDFE04]"
						>
							<Search />
						</Button>
					</form>
				</Form>
				<Link to="/create-task">
					<Button variant="outline" className="dark:text-[#CDFE04]">
						<BadgePlus />
					</Button>
				</Link>
			</div>
			<ScrollArea className="h-full flex w-full rounded-lg border p-4">
				<div className="flex h-full w-3xl gap-x-4">
					{form.watch("tasks").map((task) => (
						<Card
							style={{
								backgroundColor: task.color,
								borderColor: task.color,
							}}
							className="w-96 min-w-72 h-full	"
							key={task.id}
						>
							<CardHeader>
								<CardTitle>
									<h2 className="leading-none font-extrabold">
										{task.title}
									</h2>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{task.descriptions.map((description) =>
									description.type === "text" ? (
										<p
											key={description.id}
											className="text-sm font-medium leading-none mt-0 text-justify"
										>
											{description.content}
										</p>
									) : description.type === "list" ? (
										<div
											key={description.id}
											className="flex flex-col justify-start items-start gap-y-2"
										>
											<small
												key={description.id}
												className="text-sm font-medium leading-none mt-4"
											>
												{description.content}
											</small>
											{description.list_items.length >
												0 && (
												<ul className="ml-2 list-none [&>li]:mt-2">
													{description.list_items.map(
														(list_item) => (
															<li
																key={
																	list_item.order
																}
															>
																<Checkbox
																	className="mr-2"
																	defaultChecked={
																		list_item.done
																	}
																	onCheckedChange={(
																		checked
																	) =>
																		ChangeCheckedStatus(
																			{
																				id: list_item.id,
																				name: list_item.name,
																				order: list_item.order,
																				done:
																					checked ===
																					true
																						? true
																						: false,
																				task_description_id:
																					description.id,
																			}
																		)
																	}
																/>
																{list_item.done ? (
																	<s>
																		{
																			list_item.name
																		}
																	</s>
																) : (
																	<span>
																		{
																			list_item.name
																		}
																	</span>
																)}
															</li>
														)
													)}
												</ul>
											)}
										</div>
									) : description.type === "video" ? (
										<iframe
											width="560"
											height="315"
											className="w-full h-full my-4 rounded"
											src={description.content}
											title="YouTube video player"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
											referrerPolicy="strict-origin-when-cross-origin"
											allowFullScreen
										></iframe>
									) : (
										<Dialog>
											<DialogTrigger asChild>
												<AspectRatio ratio={16 / 9}>
													<img
														src={
															description.content
														}
														className="w-full h-full rounded-md object-cover"
														alt="Description image"
													/>
												</AspectRatio>
											</DialogTrigger>
											<DialogContent className="w-screen h-[90vh]">
												<div className="flex max-h-[80vh] justify-center items-center">
													<img
														src={
															description.content
														}
														className="rounded-md w-full h-full object-contain"
														alt="Description image"
													/>
												</div>
											</DialogContent>
										</Dialog>
									)
								)}
							</CardContent>
							<CardFooter>
								<Dialog>
									<DialogTrigger asChild>
										<Button
											variant="destructive"
											className="text-[#DD1C1A] hover:bg-[#DD1C1A] hover:text-white transition-colors"
										>
											<Trash2 />
										</Button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-md">
										<DialogHeader>
											<DialogTitle>
												Deseja realmente deletar esta
												tarefa
											</DialogTitle>
											<DialogDescription>
												Está ação será irreversível, e
												todos os dados serão perdidos
												uma vez que concluída.
											</DialogDescription>
										</DialogHeader>
										<DialogFooter className="sm:justify-start">
											<DialogClose asChild>
												<Button
													type="button"
													variant="outline"
													className="text-[#DD1C1A] hover:bg-[#DD1C1A] hover:border-[#DD1C1A] hover:text-white transition-colors"
													onClick={() =>
														DeleteTask(task.id)
													}
												>
													Deletar
												</Button>
											</DialogClose>
											<DialogClose asChild>
												<Button type="button">
													Cancelar
												</Button>
											</DialogClose>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</CardFooter>
						</Card>
					))}
				</div>
				<ScrollBar
					orientation="horizontal"
					className="text-[#272D2D]"
				/>
			</ScrollArea>
		</div>
	);
}
