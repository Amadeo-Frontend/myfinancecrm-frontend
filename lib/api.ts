import { getSession } from "next-auth/react";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const session = await getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.apiToken) {
    headers.Authorization = `Bearer ${session.apiToken}`;
  }

  return fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    ...options,
    headers,
  });
}
