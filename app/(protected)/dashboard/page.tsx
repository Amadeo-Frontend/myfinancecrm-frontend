"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardCards } from "@/components/dashboard-cards";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { toast } from "sonner";

type DashboardData = {
  total_receitas: number;
  total_despesas: number;
  saldo: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get<DashboardData>("/dashboard");
        setData(res.data);
      } catch (error) {
        toast.error("Erro ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {loading && <DashboardSkeleton />}

      {data && (
        <DashboardCards
          total_receitas={data.total_receitas}
          total_despesas={data.total_despesas}
          saldo={data.saldo}
        />
      )}
    </div>
  );
}
