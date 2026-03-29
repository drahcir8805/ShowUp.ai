import { supabase } from "@/lib/supabase";

export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

export async function authenticatedFetch(path: string, init?: RequestInit) {
  const token = await getAccessToken();

  const headers = new Headers(init?.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(path, {
    ...init,
    headers,
  });
}
