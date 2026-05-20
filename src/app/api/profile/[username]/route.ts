import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type Context = {
  params: Promise<{ username: string }>;
};

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { username } = await context.params;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_profiles")
      .select("id,user_id,username,display_name,bio,avatar_url,created_at,updated_at")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
