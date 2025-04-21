import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	ClipboardPlus,
	GripHorizontal,
	ListPlus,
	ListX,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { CSS } from "@dnd-kit/utilities";
import { z } from "zod";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CreateTask, GetTaskById, UpdateTaskById } from "@/utils/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ExtractSrcFromEmbedded } from "@/utils";
import { useNavigate } from "react-router";
import { useLoaderData } from "react-router";
import { useEffect } from "react";
import {
	IDescription,
	ISortableItem,
	IDescriptionDnDColumn,
} from "@/interfaces";

const formSchema = z.object({
	title: z.string(),
	color: z.string(),
	descriptions: z.array(
		z.object({
			id: z.string(),
			type: z.enum(["text", "image", "video", "list"]),
			content: z.string(),
			order: z.number(),
			list_items: z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					done: z.boolean(),
					order: z.number(),
				})
			),
		})
	),
	new: z.object({
		descriptions: z.array(z.number()),
		list_items: z.array(z.number()),
	}),
	removed: z.object({
		descriptions: z.array(z.number()),
		list_items: z.array(z.number()),
	}),
	loading: z.boolean(),
});

const SortableDescription = ({
	id,
	content,
	type,
	list_items,
	onChange,
	addDescription,
	removeDescription,
	RemoveListItem,
	loading,
}: ISortableItem) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	function GetVideoURL(id: string, iframeHTML: string) {
		let result = ExtractSrcFromEmbedded(iframeHTML);
		if (result === null) {
			toast("Houve um erro ao processar o vídeo !");
		} else {
			onChange(id, "content", result);
		}
	}

	async function GetBase64IMG(id: string, ev: any) {
		try {
			const file = ev.target.files?.[0];
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result;
				if (typeof result === "string") {
					onChange(id, "content", result);
				} else {
					toast("Houve um erro ao processar a imagem !");
				}
			};

			reader.readAsDataURL(file);
		} catch (err) {
			console.log(err);
			toast("Houve um erro ao selecionar a imagem !");
		}
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="w-full flex flex-col gap-y-4 p-4 rounded-xl bg-gray-200 dark:bg-[#CDFE04] mb-2 shadow cursor-move"
		>
			<div
				{...attributes}
				{...listeners}
				className="w-full flex justify-center items-center cursor-grab"
			>
				<GripHorizontal className="text-black size-3.5" />
			</div>
			<div className="w-full flex justify-between items-center">
				<div className="flex justify-start items-center gap-x-2">
					<Select
						defaultValue={type}
						onValueChange={(val) =>
							onChange(id, "type", String(val))
						}
						disabled={loading}
					>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Selecione um tipo" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Tipos disponíveis</SelectLabel>
								<SelectItem value="text">
									Texto simples
								</SelectItem>
								<SelectItem value="image">Imagem</SelectItem>
								<SelectItem value="video">
									Vídeo ( Youtube ){" "}
								</SelectItem>
								<SelectItem value="list">
									Lista de afazeres
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					{type === "list" && (
						<Button
							type="button"
							variant="outline"
							className="border-[#CDFE04] bg-[#CDFE04] dark:text-[#CDFE04] dark:bg-sidebar-accent dark:border-sidebar-accent"
							onClick={() => addDescription(id)}
							disabled={loading}
						>
							{loading ? <Loader2 /> : <Plus />}
						</Button>
					)}
				</div>

				<Button
					type="button"
					className="text-[#DD1C1A] hover:bg-[#DD1C1A] hover:border-[#DD1C1A] hover:text-white transition-colors"
					onClick={() => removeDescription(id)}
					disabled={loading}
				>
					{loading ? <Loader2 /> : <Trash2 />}
				</Button>
			</div>
			{type === "list" ? (
				<div className="flex flex-col justify-start items-start">
					<Input
						value={content}
						onChange={(ev) =>
							onChange(id, "content", String(ev?.target?.value))
						}
						disabled={loading}
					/>
					{list_items?.map((list_item, list_item_index) => (
						<div
							key={list_item_index}
							className="flex w-full justify-center items-center gap-x-2 pt-4"
						>
							<Checkbox
								checked={list_item.done}
								className="data-[state=checked]:border-none data-[state=checked]:bg-[#CDFE04] border-[#CDFE04] dark:border-[#272D2D] dark:data-[state=checked]:bg-[#272D2D] dark:data-[state=checked]:text-[#CDFE04] transition-all"
								onCheckedChange={(checked) =>
									onChange(
										id,
										"list_items",
										list_items.map((_, index) => {
											if (list_item_index === index) {
												_.done =
													checked === true
														? true
														: false;
											}
											return _;
										})
									)
								}
								disabled={loading}
							/>
							<Input
								value={list_item.name}
								onChange={(ev) =>
									onChange(
										id,
										"list_items",
										list_items.map(
											(actual_list_item, index) => {
												if (list_item_index === index) {
													actual_list_item.name =
														String(
															ev?.target?.value
														);
												}
												return actual_list_item;
											}
										)
									)
								}
								disabled={loading}
							/>
							<Button
								variant="outline"
								className="text-[#DD1C1A] bg-transparent hover:bg-[#DD1C1A] hover:border-[#DD1C1A] hover:text-white transition-colors"
								onClick={() => RemoveListItem(id, list_item.id)}
								disabled={loading}
							>
								{loading ? <Loader2 /> : <ListX />}
							</Button>
						</div>
					))}
				</div>
			) : type === "video" ? (
				<div className="flex flex-col justify-start items-start gap-y-2">
					<Input
						disabled={loading}
						onChange={(ev) =>
							GetVideoURL(id, String(ev?.target?.value))
						}
					/>
					{content !== "" && (
						<iframe
							width="560"
							height="315"
							className="w-full h-full my-4 rounded"
							src={content}
							title="YouTube video player"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							referrerPolicy="strict-origin-when-cross-origin"
							allowFullScreen
						></iframe>
					)}
				</div>
			) : type === "text" ? (
				<Textarea
					value={content}
					disabled={loading}
					onChange={(ev) =>
						onChange(id, "content", String(ev?.target?.value))
					}
				/>
			) : (
				<div className="flex flex-col justify-start items-start gap-y-2">
					<Input
						type="file"
						disabled={loading}
						onChange={(ev) => GetBase64IMG(id, ev)}
					/>
					{content !== "" && (
						<img
							src={content}
							className="rounded-md w-full h-full object-contain"
							alt="Description image"
						/>
					)}
				</div>
			)}
		</div>
	);
};

const DescriptionDnDColumn = ({
	form,
	onChange,
	addDescriptionList,
	removeDescription,
	RemoveListItem,
	loading,
}: IDescriptionDnDColumn) => {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over!.id) {
			let descriptions = form.getValues("descriptions");
			const oldIndex = descriptions.findIndex(
				(item: IDescription) => String(item.id) === String(active.id)
			);
			const newIndex = descriptions.findIndex(
				(item: IDescription) => String(item.id) === String(over!.id)
			);
			form.setValue(
				"descriptions",
				arrayMove(descriptions, oldIndex, newIndex)
			);
		}
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={form
					.watch("descriptions")
					.map((description) => description.id)}
				strategy={verticalListSortingStrategy}
			>
				{form.watch("descriptions").map((description) => (
					<SortableDescription
						key={String(description.id)}
						id={String(description.id)}
						content={description.content}
						type={description.type}
						list_items={description.list_items}
						onChange={onChange}
						removeDescription={removeDescription}
						addDescription={addDescriptionList}
						RemoveListItem={RemoveListItem}
						loading={loading}
					/>
				))}
			</SortableContext>
		</DndContext>
	);
};

export default function CreateTaskPage() {
	let navigate = useNavigate();
	let params = useLoaderData();
	let form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: params?.id
				? ""
				: "Estudar para a prova de quinta ( RES. MAT II )",
			color: params?.id ? "" : "#CDFE04",
			descriptions: [],
			new: {
				descriptions: [],
				list_items: [],
			},
			removed: {
				descriptions: [],
				list_items: [],
			},
			loading: false,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			form.setValue("loading", true);
			if (params?.id) {
				let id = String(params?.id);
				const message = await UpdateTaskById({
					id,
					title: values.title,
					color: values.color,
					descriptions: values.descriptions,
					news: values.new,
					deleted: values.removed,
				});
				toast(message);
			} else {
				await CreateTask(values);
				toast("Tarefa criada com sucesso !");
				navigate("/");
			}
			form.setValue("loading", false);
		} catch (err) {
			form.setValue("loading", false);
			console.log(err);
			toast("Erro ao criar tarefa");
		}
	}

	function AddDescription() {
		let descriptionList: IDescription[] = form.getValues("descriptions");
		let newlyAddedDescriptionList: number[] =
			form.getValues("new.descriptions");
		let newDescription = {
			id: String(new Date().valueOf()),
			type: "text",
			content: "",
			order: descriptionList.length,
			list_items: [],
		} as any;
		descriptionList.push(newDescription);
		newlyAddedDescriptionList.push(Number(newDescription.id));
		form.setValue("descriptions", descriptionList);
		form.setValue("new.descriptions", newlyAddedDescriptionList);
	}

	function AddListItem(description_id: string) {
		let descriptionList: IDescription[] = form.watch("descriptions");
		let newListItemId = String(new Date().valueOf());
		descriptionList = descriptionList.map((description) => {
			if (description.id === description_id) {
				description.list_items = [
					...description.list_items,
					{
						id: newListItemId,
						name: "",
						done: false,
						order: description.list_items.length,
					},
				];
			}
			return description;
		});
		let newlyAddedDescriptionList: number[] = form.watch("new.list_items");
		newlyAddedDescriptionList.push(Number(newListItemId));
		form.setValue("descriptions", descriptionList);
		form.setValue("new.list_items", newlyAddedDescriptionList);
	}

	function ChangeDescription(
		id: string,
		field: "type" | "content" | "list_items",
		value: any
	) {
		let descriptions = form.watch("descriptions");
		descriptions = descriptions.map((description) => {
			if (description.id === id) {
				description[field] = value;
			}
			return description;
		});
		form.setValue("descriptions", descriptions);
	}

	function RemoveDescription(id: string) {
		let descriptions = form
			.watch("descriptions")
			.filter((description) => String(description.id) !== id);
		let removedDescriptions = form.watch("removed.descriptions");
		removedDescriptions.push(Number(id));

		let newlyAddedDescription = form.watch("new.descriptions");
		if (!newlyAddedDescription.includes(Number(id))) {
			form.setValue("removed.descriptions", removedDescriptions);
		} else {
			form.setValue(
				"new.descriptions",
				newlyAddedDescription.filter((item) => String(item) === id)
			);
		}
		form.setValue("descriptions", descriptions);
	}

	function RemoveListItem(description_id: string, id: string) {
		let descriptions = form.watch("descriptions").map((description) => {
			if (description.id === description_id) {
				description.list_items = description.list_items.filter(
					(list_item) => list_item.id !== id
				);
			}
			return description;
		});

		let newlyAddedListItems = form.watch("new.list_items");

		if (!newlyAddedListItems.includes(Number(id))) {
			let removedListItem = form.watch("removed.list_items");
			removedListItem.push(Number(id));
			form.setValue("removed.list_items", removedListItem);
		} else {
			form.setValue(
				"new.list_items",
				newlyAddedListItems.filter((item) => String(item) !== id)
			);
		}

		form.setValue("descriptions", descriptions);
	}

	async function LoadTask(id: string) {
		try {
			const task = await GetTaskById(Number(id));
			form.setValue("title", task.title);
			form.setValue("color", task.color);
			form.setValue("descriptions", task.descriptions);
		} catch (err) {
			console.log(err);
			toast("Houve um erro ao carregar a tarefa !");
		}
	}

	useEffect(() => {
		if (params) {
			LoadTask(params.id);
		}
	}, []);

	return (
		<div className="flex items-start justify-between w-full max-w-screen h-full p-4 gap-4">
			<div className="flex flex-col items-start justify-start w-full h-full">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="w-full space-x-2 flex flex-col justify-start items-start gap-y-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>Título da tarefa</FormLabel>
									<FormControl>
										<Input
											placeholder="Ex: Estudar para a prova de quinta ( RES. MAT II )"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="color"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Cor de fundo</FormLabel>
									<FormControl>
										<Input type="color" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
						<Button
							variant="outline"
							type="button"
							className="border-[#CDFE04] bg-transparent text-[#CDFE04] hover:bg-[#CDFE04] hover:text-sidebar-foreground  dark:bg-transparent dark:text-sidebar-accent dark:border-sidebar-accent dark:hover:bg-sidebar-accent dark:hover:text-[#CDFE04] transition-all"
							onClick={AddDescription}
							disabled={form.watch("loading")}
						>
							{form.watch("loading") ? (
								<>
									<Loader2 className="animate-spin" />
									Processando
								</>
							) : (
								<>
									<ListPlus />
									Adicionar descrição
								</>
							)}
						</Button>
						<DescriptionDnDColumn
							form={form}
							onChange={ChangeDescription}
							removeDescription={RemoveDescription}
							addDescriptionList={AddListItem}
							RemoveListItem={RemoveListItem}
							loading={form.watch("loading")}
						/>
						<Button
							variant="outline"
							type="submit"
							className="border-[#CDFE04] bg-[#CDFE04] dark:text-[#CDFE04] dark:bg-sidebar-accent dark:border-sidebar-accent"
							disabled={form.watch("loading")}
						>
							{form.watch("loading") ? (
								<>
									<Loader2 className="animate-spin" />
									Processando
								</>
							) : (
								<>
									<ClipboardPlus />
									{params?.id
										? "Atualizar"
										: "Registrar"}{" "}
									tarefa
								</>
							)}
						</Button>
					</form>
				</Form>
			</div>
			<div
				style={{ backgroundColor: form.watch("color") }}
				className="text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm w-96 min-w-72 h-full p-4"
			>
				<ScrollArea className="flex flex-col rounded-lg border p-4 border-none">
					<div className="w-full h-full flex flex-col">
						<h2 className="leading-none font-extrabold">
							{form.watch("title")}
						</h2>
						{form.watch("descriptions").map((description) =>
							description.type === "text" ? (
								<small
									key={description.id}
									className="text-sm font-medium leading-none mt-4"
								>
									{description.content}
								</small>
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
									{description.list_items.length > 0 && (
										<ul className="ml-2 list-none [&>li]:mt-2">
											{description.list_items.map(
												(list_item, index) => (
													<li key={index}>
														<Checkbox
															className="mr-2"
															checked={
																list_item.done
															}
														/>
														{list_item.done ? (
															<s>
																{list_item.name}
															</s>
														) : (
															<span>
																{list_item.name}
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
									key={description.id}
								></iframe>
							) : (
								<img
									key={description.id}
									src={description.content}
									className="rounded-md w-full h-full object-contain mt-4"
									alt="Description image"
								/>
							)
						)}
					</div>
					<ScrollBar orientation="vertical" />
				</ScrollArea>
			</div>
		</div>
	);
}
