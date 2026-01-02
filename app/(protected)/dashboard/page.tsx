"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Banknote,
  CalendarDays,
  CirclePlus,
  CreditCard,
  Loader2,
  LogOut,
  RefreshCcw,
  Receipt,
  Trash2,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { DashboardCards } from "@/components/dashboard-cards";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";

type DashboardData = {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
};

type MovimentoBase = {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
};

type Movimento = MovimentoBase & {
  tipo: "receita" | "despesa";
};

const movimentoSchema = z.object({
  descricao: z.string().min(3, "Descreva com pelo menos 3 caracteres."),
  valor: z.coerce.number().positive("Valor deve ser maior que zero."),
  categoria: z.string().min(2, "Informe uma categoria."),
  data: z.string().min(1, "Data obrigatoria."),
  tipo: z.enum(["receita", "despesa"]),
});

type MovimentoForm = z.infer<typeof movimentoSchema>;
type MovimentoErrors = Partial<Record<keyof MovimentoForm, string>>;

type Filtros = {
  inicio: string;
  fim: string;
  busca: string;
  tipo: "todos" | "receita" | "despesa";
};

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR");

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardData | null>(null);
  const [receitas, setReceitas] = useState<Movimento[]>([]);
  const [despesas, setDespesas] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [filters, setFilters] = useState<Filtros>({
    inicio: "",
    fim: "",
    busca: "",
    tipo: "todos",
  });
  const [form, setForm] = useState<MovimentoForm>({
    descricao: "",
    valor: 0,
    categoria: "",
    data: "",
    tipo: "receita",
  });
  const [errors, setErrors] = useState<MovimentoErrors>({});

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function loadAll() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.inicio) params.append("inicio", filters.inicio);
      if (filters.fim) params.append("fim", filters.fim);
      if (filters.busca) params.append("busca", filters.busca);

      const query = params.toString() ? `?${params.toString()}` : "";

      const [dashRes, recRes, desRes] = await Promise.all([
        apiFetch("/dashboard"),
        apiFetch(`/receitas${query}`),
        apiFetch(`/despesas${query}`),
      ]);

      if (!dashRes.ok) throw new Error("Falha ao carregar resumo");
      if (!recRes.ok) throw new Error("Falha ao carregar receitas");
      if (!desRes.ok) throw new Error("Falha ao carregar despesas");

      const dashBody = (await dashRes.json()) as DashboardData;
      const recBody = (await recRes.json()) as MovimentoBase[];
      const desBody = (await desRes.json()) as MovimentoBase[];

      setSummary(dashBody);
      setReceitas(
        recBody.map((item) => ({
          ...item,
          valor: Number(item.valor),
          tipo: "receita",
        }))
      );
      setDespesas(
        desBody.map((item) => ({
          ...item,
          valor: Number(item.valor),
          tipo: "despesa",
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Nao foi possivel carregar os dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = movimentoSchema.safeParse(form);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        descricao: fieldErrors.descricao?.[0],
        valor: fieldErrors.valor?.[0],
        categoria: fieldErrors.categoria?.[0],
        data: fieldErrors.data?.[0],
        tipo: fieldErrors.tipo?.[0],
      });
      toast.error("Revise os campos destacados.");
      return;
    }

    setErrors({});
    setSaving(true);

    const endpoint =
      form.tipo === "receita" ? "/receitas" : "/despesas";

    try {
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          descricao: parsed.data.descricao,
          valor: parsed.data.valor,
          categoria: parsed.data.categoria,
          data: parsed.data.data,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar movimento");
      }

      toast.success(
        form.tipo === "receita"
          ? "Receita adicionada!"
          : "Despesa adicionada!"
      );

      setForm({
        descricao: "",
        valor: 0,
        categoria: "",
        data: "",
        tipo: form.tipo,
      });

      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error("Nao foi possivel salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, tipo: Movimento["tipo"]) {
    const endpoint = tipo === "receita" ? "/receitas" : "/despesas";
    try {
      const res = await apiFetch(`${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao remover");
      toast.success(
        tipo === "receita" ? "Receita removida." : "Despesa removida."
      );
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error("Nao foi possivel remover o registro.");
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await signOut({ callbackUrl: "/login" });
    } catch (err) {
      console.error(err);
      toast.error("Nao foi possivel sair. Tente de novo.");
    } finally {
      setLoggingOut(false);
    }
  }

  const ultimosMovimentos = useMemo(() => {
    const merged = [...receitas, ...despesas];
    const filtrados = filters.tipo === "todos"
      ? merged
      : merged.filter((m) => m.tipo === filters.tipo);

    return filtrados
      .sort(
        (a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
      )
      .slice(0, 6);
  }, [filters.tipo, receitas, despesas]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 rounded-2xl border border-border/60 bg-gradient-to-b from-background via-background to-primary/5 p-4 sm:p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Visao geral
          </p>
          <h1 className="text-3xl font-semibold leading-tight">Dashboard financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe receitas, despesas e saldo em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {new Date().toLocaleDateString("pt-BR")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => loadAll()}
              disabled={loading}
              className="gap-2"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={loggingOut}
              className="gap-2"
              size="sm"
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sair
            </Button>
          </div>
        </div>
      </div>

      {loading && <DashboardSkeleton />}
      {!loading && summary && (
        <DashboardCards
          total_receitas={summary.total_receitas}
          total_despesas={summary.total_despesas}
          saldo={summary.saldo}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card className="border-border/80 shadow-lg backdrop-blur bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Movimentacoes recentes</CardTitle>
            <Receipt className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="busca">Buscar</Label>
                <Input
                  id="busca"
                  placeholder="Descricao"
                  value={filters.busca}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, busca: e.target.value }))
                  }
                  onBlur={() => loadAll()}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="inicio">Inicio</Label>
                <Input
                  id="inicio"
                  type="date"
                  value={filters.inicio}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, inicio: e.target.value }))
                  }
                  onBlur={() => loadAll()}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fim">Fim</Label>
                <Input
                  id="fim"
                  type="date"
                  value={filters.fim}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, fim: e.target.value }))
                  }
                  onBlur={() => loadAll()}
                />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["todos", "receita", "despesa"] as const).map((tipo) => (
                    <Button
                      key={tipo}
                      type="button"
                      variant={filters.tipo === tipo ? "default" : "outline"}
                      className="w-full text-xs"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, tipo })) }
                    >
                      {tipo === "todos" ? "Todos" : tipo === "receita" ? "Receitas" : "Despesas"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ultimosMovimentos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum movimento cadastrado ainda.
                    </TableCell>
                  </TableRow>
                )}
                {ultimosMovimentos.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.tipo === "receita"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {item.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.descricao}
                    </TableCell>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell>{formatDate(item.data)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.tipo === "receita" ? "+" : "-"}
                      {currency(item.valor)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(item.id, item.tipo)}
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-lg backdrop-blur bg-card/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Adicionar movimento</CardTitle>
            <p className="text-sm text-muted-foreground">
              Cadastre receitas ou despesas para atualizar o saldo.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="descricao">Descricao</Label>
                  <Input
                    id="descricao"
                    value={form.descricao}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    aria-invalid={Boolean(errors.descricao)}
                    placeholder="Ex.: Fatura cartao, salario"
                  />
                  {errors.descricao && (
                    <p className="text-sm text-destructive">
                      {errors.descricao}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <div className="relative">
                    <Banknote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={form.valor}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          valor: e.target.valueAsNumber,
                        }))
                      }
                      aria-invalid={Boolean(errors.valor)}
                      className="pl-10"
                    />
                  </div>
                  {errors.valor && (
                    <p className="text-sm text-destructive">
                      {errors.valor}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={form.categoria}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        categoria: e.target.value,
                      }))
                    }
                    aria-invalid={Boolean(errors.categoria)}
                    placeholder="Ex.: Alimentacao, Salario"
                  />
                  {errors.categoria && (
                    <p className="text-sm text-destructive">
                      {errors.categoria}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="data"
                      type="date"
                      value={form.data}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          data: e.target.value,
                        }))
                      }
                      aria-invalid={Boolean(errors.data)}
                      className="pl-10"
                    />
                  </div>
                  {errors.data && (
                    <p className="text-sm text-destructive">
                      {errors.data}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={form.tipo === "receita" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setForm((prev) => ({ ...prev, tipo: "receita" }))}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Receita
                    </Button>
                    <Button
                      type="button"
                      variant={form.tipo === "despesa" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setForm((prev) => ({ ...prev, tipo: "despesa" }))}
                    >
                      <CirclePlus className="mr-2 h-4 w-4" />
                      Despesa
                    </Button>
                  </div>
                  {errors.tipo && (
                    <p className="text-sm text-destructive">
                      {errors.tipo}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Cadastrar movimento"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
