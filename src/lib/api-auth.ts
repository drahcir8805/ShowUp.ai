import { NextRequest } from "next/server";
import { getSupabaseAnonClient } from "@/lib/supabase-server";

export async function requireAuthenticatedUser(request: NextRequest): Promise<{
  userId: string;
  email: string | null;
}> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing authorization token.");
  }

  const accessToken = authHeader.slice("Bearer ".length).trim();
  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new Error("Unauthorized request.");
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
  };
}
