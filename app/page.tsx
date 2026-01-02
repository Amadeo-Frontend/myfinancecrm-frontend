"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  BarChart3,
  Clock3,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Informe um email valido."),
  password: z.string().min(6, "Senha precisa de 6 caracteres ou mais."),
});

type LoginForm = z.infer<typeof loginSchema>;
type LoginErrors = Partial<Record<keyof LoginForm, string>>;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  function handleInputChange(field: keyof LoginForm) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = loginSchema.safeParse(formData);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      toast.error("Revise os campos destacados.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await signIn("credentials", {
        ...parsed.data,
        redirect: false,
      });

      if (response?.ok) {
        toast.success("Login realizado com sucesso.");
        router.push("/dashboard");
      } else {
        toast.error(
          response?.error ?? "Nao foi possivel entrar. Confira as credenciais."
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-12 md:flex-row md:items-center">
        <div className="relative space-y-6 md:w-1/2">
          <div className="absolute inset-y-[-80px] left-[-120px] right-[-40px] -z-10 blur-3xl opacity-70">
            <div className="h-full bg-[radial-gradient(circle_at_top,_theme(colors.primary/25),_transparent_55%)]" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Acesso seguro
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Entre para acompanhar sua gestao financeira
            </h1>
            <p className="text-muted-foreground">
              Centralize contas, fluxo de caixa e indicadores em um painel
              claro. Conecte-se e retome de onde parou.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-card/70 p-3 shadow-xs backdrop-blur">
              <BarChart3 className="mt-0.5 h-5 w-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  Indicadores em tempo real
                </p>
                <p className="text-sm text-muted-foreground">
                  Dashboards com saldo, despesas e recebiveis atualizados.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-card/70 p-3 shadow-xs backdrop-blur">
              <Clock3 className="mt-0.5 h-5 w-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">Sessao protegida</p>
                <p className="text-sm text-muted-foreground">
                  Autenticacao rapida com verificacao de credenciais.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md border-border/80 bg-card/80 shadow-lg backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email corporativo</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@empresa.com"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    aria-invalid={Boolean(errors.email)}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    aria-invalid={Boolean(errors.password)}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
                {errors.password ? (
                  <p className="text-sm text-destructive">{errors.password}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Seus dados ficam protegidos com autenticacao segura.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
