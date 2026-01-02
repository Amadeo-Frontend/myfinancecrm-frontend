import { getSession } from "next-auth/react";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const session = await getSession();

  return fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${session?.apiToken}`,
      "Content-Type": "application/json",
    },
  });
}
