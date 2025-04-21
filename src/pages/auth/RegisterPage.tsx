import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterUser } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserRoundPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	name: z.string(),
	email: z.string(),
	password: z.string(),
	password_confirmation: z.string(),
	loading: z.boolean(),
});

export default function RegisterPage() {
	let navigate = useNavigate();

	let form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			loading: false,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			form.setValue("loading", true);
			const message = await RegisterUser({
				name: values.name,
				email: values.email,
				password: values.password,
				password_confirmation: values.password_confirmation,
			});
			toast(message);
			navigate("/auth");
			form.setValue("loading", false);
		} catch (err) {
			form.setValue("loading", false);
			console.log(err);
			toast("Houve um erro ao registrar usuário !");
		}
	}

	return (
		<div className="flex items-center justify-start w-full h-full dark:bg-[#272D2D]">
			<div className="flex w-full sm:w-1/2 flex-col justify-center items-center p-4 ">
				<h1 className="flex items-center font-display text-3xl mb-6 gap-x-2 text-[#272D2D] dark:text-[#CDFE04] select-none">
					Registrar-se ?
				</h1>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-x-2 flex flex-col gap-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Nome completo"
											className="border-transparent dark:border-[#CDFE04] dark:ring-[#CDFE04] dark:text-[#CDFE04]"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											type="email"
											placeholder="Email da conta"
											className="border-transparent dark:border-[#CDFE04] dark:ring-[#CDFE04] dark:text-[#CDFE04]"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											type="password"
											placeholder="Senha"
											className="border-transparent dark:border-[#CDFE04] dark:ring-[#CDFE04] dark:text-[#CDFE04]"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password_confirmation"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											type="password"
											placeholder="Confirme sua senha"
											className="border-transparent dark:border-[#CDFE04] dark:ring-[#CDFE04] dark:text-[#CDFE04]"
											{...field}
										/>
									</FormControl>
									<FormDescription className="dark:text-[#CDFE04] dark:hover:opacity-60 transition-all text-center">
										<Link to="/auth/">
											Já possui uma conta ?
										</Link>
									</FormDescription>
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="bg-[#CDFE04]"
							disabled={form.watch("loading")}
						>
							{form.watch("loading") ? (
								<>
									<Loader2 className="animate-spin" />
									Processando
								</>
							) : (
								<>
									<UserRoundPlus /> Registrar-se
								</>
							)}
						</Button>
					</form>
				</Form>
			</div>
			<div className="hidden sm:flex flex-col justify-center items-center p-4 w-1/2 h-full ">
				<div className="w-full h-full bg-[#CDFE04] rounded-3xl"></div>
			</div>
		</div>
	);
}
