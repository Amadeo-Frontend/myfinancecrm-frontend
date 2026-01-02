"use client";

import Link from "next/link";
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background p-4">
      <h2 className="mb-6 text-xl font-bold">MYFinanceCRM</h2>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          href="/receitas"
          className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
        >
          <ArrowUpCircle size={18} />
          Receitas
        </Link>

        <Link
          href="/despesas"
          className="flex items-center gap-2 rounded-md p-2 hover:bg-accent"
        >
          <ArrowDownCircle size={18} />
          Despesas
        </Link>
      </nav>
    </aside>
  );
}
