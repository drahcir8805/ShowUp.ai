import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("follows")
      .select("id,created_at,following_id,user_profiles!follows_following_id_fkey(id,user_id,username,display_name,bio,avatar_url)")
      .eq("follower_id", auth.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ following: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load following list.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
