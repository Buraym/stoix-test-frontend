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
import { ClipboardPlus, GripHorizontal, ListPlus, Trash2 } from "lucide-react";
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
import {
	CreateTask,
	GetTasks,
	GetTasksByTitle,
	RemoveTaskById,
} from "@/utils/api";
import { toast } from "sonner";

export interface IDescription {
	id: string;
	type: "text" | "image" | "video" | "list";
	content: string;
	order: number;
}

export interface ISortableItem {
	id: string;
	content: string;
	type: "video" | "image" | "text" | "list";
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
		})
	),
});

const SortableDescription = ({
	id,
	content,
	type,
	onChange,
	removeDescription,
}: ISortableItem) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

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
				<Select
					defaultValue={type}
					onValueChange={(val) => onChange(id, "type", String(val))}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Selecione um tipo" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Tipos disponíveis</SelectLabel>
							<SelectItem value="text">Texto simples</SelectItem>
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
				<Button
					className="text-[#DD1C1A] hover:bg-[#DD1C1A] hover:border-[#DD1C1A] hover:text-white transition-colors"
					onClick={() => removeDescription(id)}
				>
					<Trash2 />
				</Button>
			</div>
			<Textarea
				value={content}
				onChange={(ev) =>
					onChange(id, "content", String(ev?.target?.value))
				}
			/>
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
						onChange={onChange}
						removeDescription={removeDescription}
					/>
				))}
			</SortableContext>
		</DndContext>
	);
};

export default function CreateTaskPage() {
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
			console.log(values);
			await CreateTask(values);
			toast("Era pra criar alguma coisa kkkkkkk");
		} catch (err) {
			toast("Pelo visto n deu certo n kkkkk kkkkkkk");
		}
	}

	function AddDescription() {
		let descriptionList: IDescription[] = form.getValues("descriptions");
		descriptionList.push({
			id: String(new Date().valueOf()),
			type: "text",
			content: "",
			order: descriptionList.length,
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
							type="submit"
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
						{form.watch("descriptions").map((description, index) =>
							description.type === "text" ? (
								<small
									key={description.id}
									className="text-sm font-medium leading-none mt-4"
								>
									{description.content}
								</small>
							) : (
								<p
									key={description.id}
									className="leading-7 [&:not(:first-child)]:mt-6"
								>
									{description.content}
								</p>
							)
						)}
					</div>
					<ScrollBar orientation="vertical" />
				</ScrollArea>
			</div>
		</div>
	);
}
