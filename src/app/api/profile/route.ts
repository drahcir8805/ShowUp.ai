import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ profile: data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const username = typeof body.username === "string" ? body.username.trim() : "";
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    const bio = typeof body.bio === "string" ? body.bio.trim() : null;
    const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : null;

    if (!username || !displayName) {
      return NextResponse.json({ error: "username and displayName are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: auth.userId,
          username: username.toLowerCase(),
          display_name: displayName,
          bio: bio || null,
          avatar_url: avatarUrl || null,
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
