"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { AxiosError } from "axios";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface ErrorResponse {
  detail?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", res.data.access_token);

      toast.success("Login realizado com sucesso");
      router.push("/dashboard");
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;

      console.error("Login error:", error.response?.data);

      toast.error(error.response?.data?.detail ?? "Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 rounded-lg border p-6"
      >
        <h1 className="text-2xl font-bold text-center">MYFinanceCRM</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-md border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full rounded-md border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary py-2 text-white disabled:opacity-70"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
