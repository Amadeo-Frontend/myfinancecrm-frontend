import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Wallet2 } from "lucide-react";

interface Props {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
}

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

export function DashboardCards({
  total_receitas,
  total_despesas,
  saldo,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receitas
          </CardTitle>
          <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {money(total_receitas)}
          </div>
          <p className="text-xs text-muted-foreground">
            Entradas acumuladas
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas
          </CardTitle>
          <ArrowDownCircle className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {money(total_despesas)}
          </div>
          <p className="text-xs text-muted-foreground">
            Saidas controladas
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo
          </CardTitle>
          <Wallet2 className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              saldo >= 0 ? "text-foreground" : "text-red-600"
            }`}
          >
            {money(saldo)}
          </div>
          <p className="text-xs text-muted-foreground">
            Resultado entre entradas e saidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
