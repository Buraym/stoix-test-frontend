import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckUser, GetCRSFCookie, GetUserLogin } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCheck, Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	email: z.string(),
	password: z.string(),
	rememberme: z.boolean(),
	loading: z.boolean(),
});

export default function LoginPage() {
	let navigate = useNavigate();

	let form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberme: false,
			loading: false,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			form.setValue("loading", true);
			const responseData = await GetUserLogin({
				email: values.email,
				password: values.password,
				rememberme: values.rememberme,
			});
			form.setValue("loading", false);
		} catch (err) {
			form.setValue("loading", false);
			console.log(err);
			toast("Houve um erro ao se conectar á conta !");
		}
	}

	return (
		<div className="flex items-center justify-start w-full h-full dark:bg-[#272D2D]">
			<div className="hidden sm:flex flex-col justify-center items-center p-4 w-1/2 h-full ">
				<div className="w-full h-full bg-[#CDFE04] rounded-3xl"></div>
			</div>
			<div className="flex w-full sm:w-1/2 flex-col justify-center items-center p-4 ">
				<h1 className="flex items-center font-display text-3xl sm:text-5xl mb-6 gap-x-2 text-[#272D2D] dark:text-[#CDFE04] select-none">
					<CheckCheck className="text-[#CDFE04] h-6 sm:size-14" />
					Tasks
				</h1>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-x-2 flex flex-col gap-y-4"
					>
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
									<FormDescription className="dark:text-[#CDFE04] dark:hover:opacity-60 transition-all text-center">
										<Link to="/auth/register">
											Ainda não possui conta ?
										</Link>
									</FormDescription>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="rememberme"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
									<FormControl>
										<Checkbox
											className="border-[#CDFE04] data-[state=checked]:border-none data-[state=checked]:bg-[#CDFE04]  data-[state=checked]:text-[#272D2D] transition-all"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel className="dark:text-[#CDFE04]">
											Lembrar-me desta conta ?
										</FormLabel>
									</div>
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
									<LogIn /> Conectar-se
								</>
							)}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
