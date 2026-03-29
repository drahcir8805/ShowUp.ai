import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("trusted_friends")
      .select("id,user_id,friend_user_id,email,alerts_enabled,created_at,user_profiles!trusted_friends_friend_user_id_fkey(username,display_name)")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ trustedFriends: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load trusted friends.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const friendUserId = typeof body.friendUserId === "string" ? body.friendUserId : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const alertsEnabled = typeof body.alertsEnabled === "boolean" ? body.alertsEnabled : true;

    if (!friendUserId || !email) {
      return NextResponse.json({ error: "friendUserId and email are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("trusted_friends")
      .upsert(
        {
          user_id: auth.userId,
          friend_user_id: friendUserId,
          email,
          alerts_enabled: alertsEnabled,
        },
        { onConflict: "user_id,friend_user_id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ trustedFriend: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create trusted friend.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
