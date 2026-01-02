import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
}

export function DashboardCards({
  total_receitas,
  total_despesas,
  saldo,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Receitas</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-green-600">
          R$ {total_receitas}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despesas</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-red-600">
          R$ {total_despesas}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saldo</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">R$ {saldo}</CardContent>
      </Card>
    </div>
  );
}
