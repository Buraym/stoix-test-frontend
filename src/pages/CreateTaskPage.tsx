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
	Plus,
	Trash2,
} from "lucide-react";
import { useForm, UseFormReturn } from "react-hook-form";
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
import { CreateTask } from "@/utils/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ExtractSrcFromEmbedded } from "@/utils";
import { useNavigate } from "react-router";

export interface IDescription {
	id: string;
	type: "text" | "image" | "video" | "list";
	content: string;
	order: number;
	list_items: {
		name: string;
		done: boolean;
	}[];
}

export interface ISortableItem {
	id: string;
	content: string;
	type: "video" | "image" | "text" | "list";
	list_items: {
		name: string;
		done: boolean;
	}[];
	onChange: any;
	removeDescription: any;
}

export interface IDescriptionDnDColumn {
	onChange: any;
	removeDescription: any;
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
					name: string;
					done: boolean;
				}[];
			}[];
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
					name: string;
					done: boolean;
				}[];
			}[];
		}
	>;
}

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
					name: z.string(),
					done: z.boolean(),
				})
			),
		})
	),
});

const SortableDescription = ({
	id,
	content,
	type,
	list_items,
	onChange,
	removeDescription,
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
							className="dark:text-[#CDFE04]"
							onClick={() =>
								onChange(id, "list_items", [
									...list_items,
									{ name: "", done: false },
								])
							}
						>
							<Plus />
						</Button>
					)}
				</div>

				<Button
					type="button"
					className="text-[#DD1C1A] hover:bg-[#DD1C1A] hover:border-[#DD1C1A] hover:text-white transition-colors"
					onClick={() => removeDescription(id)}
				>
					<Trash2 />
				</Button>
			</div>
			{type === "list" ? (
				<div className="flex flex-col justify-start items-start">
					<Input
						value={content}
						onChange={(ev) =>
							onChange(id, "content", String(ev?.target?.value))
						}
					/>
					{list_items?.map((list_item, list_item_index) => (
						<div
							key={list_item_index}
							className="flex w-full justify-center items-center gap-x-2 px-2 pt-4"
						>
							<Checkbox
								checked={list_item.done}
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
							/>
							<Input
								value={list_item.name}
								onChange={(ev) =>
									onChange(
										id,
										"list_items",
										list_items.map((_, index) => {
											if (list_item_index === index) {
												_.name = String(
													ev?.target?.value
												);
											}
											return _;
										})
									)
								}
							/>
						</div>
					))}
				</div>
			) : type === "video" ? (
				<div className="flex flex-col justify-start items-start gap-y-2">
					<Input
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
					onChange={(ev) =>
						onChange(id, "content", String(ev?.target?.value))
					}
				/>
			) : (
				<div className="flex flex-col justify-start items-start gap-y-2">
					<Input
						type="file"
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
	removeDescription,
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
					/>
				))}
			</SortableContext>
		</DndContext>
	);
};

export default function CreateTaskPage() {
	let navigate = useNavigate();
	let form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "Estudar para a prova de quinta ( RES. MAT II )",
			color: "#CDFE04",
			descriptions: [],
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			await CreateTask(values);
			toast("Tarefa criada com sucesso !");
			navigate("/");
		} catch (err) {
			console.log(err);
			toast("Erro ao criar tarefa");
		}
	}

	function AddDescription() {
		let descriptionList: IDescription[] = form.getValues("descriptions");
		descriptionList.push({
			id: String(new Date().valueOf()),
			type: "text",
			content: "",
			order: descriptionList.length,
			list_items: [],
		});
		form.setValue("descriptions", descriptionList);
	}

	function ChangeDescription(
		id: string,
		field: "type" | "content",
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
			.filter((description) => description.id === id);
		form.setValue("descriptions", descriptions);
	}

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
							className="dark:text-[#CDFE04] dark:bg-transparent dark:border-[#CDFE04] dark:hover:bg-[#CDFE04] dark:hover:text-black"
							onClick={AddDescription}
						>
							<ListPlus />
							Adicionar descrição
						</Button>
						<DescriptionDnDColumn
							form={form}
							onChange={ChangeDescription}
							removeDescription={RemoveDescription}
						/>
						<Button
							variant="outline"
							type="submit"
							className="dark:bg-[#CDFE04] dark:border-none"
						>
							<ClipboardPlus />
							Registrar tarefa
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
															defaultChecked={
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
								></iframe>
							) : (
								<img
									key={description.id}
									src={description.content}
									className="rounded-md w-full h-full object-contain"
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
