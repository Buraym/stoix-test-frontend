import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { BadgePlus, Search, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { GetTasks, GetTasksByTitle, RemoveTaskById } from "@/utils/api";
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

const formSchema = z.object({
	taskTitle: z.string().min(0),
	tasks: z.array(tasksSchema),
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

	useEffect(() => {
		GetTasks(form.setValue);
	}, []);

	return (
		<div className="flex flex-col items-center justify-start w-full max-w-screen h-full p-4 gap-y-4">
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
						<Button variant="outline" type="submit">
							<Search />
						</Button>
					</form>
				</Form>
				<Button variant="outline">
					<BadgePlus />
				</Button>
			</div>
			<ScrollArea className="h-full flex w-full rounded-lg border p-4">
				<div className="flex h-full w-3xl gap-x-4">
					{form.watch("tasks").map((task) => (
						<Card
							style={{
								backgroundColor: task.color,
								borderColor: task.color,
							}}
							className="w-96 min-w-72 h-full"
							key={task.id}
						>
							<CardHeader>
								<CardTitle>{task.title}</CardTitle>
							</CardHeader>
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
											<Button
												type="button"
												variant="outline"
												className="text-[#DD1C1A] hover:bg-[#DD1C1A] hover:border-[#DD1C1A] hover:text-white transition-colors"
												onClick={() =>
													RemoveTaskById(task.id)
												}
											>
												Deletar
											</Button>
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
