import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type Context = {
  params: Promise<{ userId: string }>;
};

export async function POST(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const { userId: targetUserId } = await context.params;
    const supabase = getSupabaseServerClient();

    if (targetUserId === auth.userId) {
      return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("follows")
      .insert({
        follower_id: auth.userId,
        following_id: targetUserId,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ follow: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to follow user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const { userId: targetUserId } = await context.params;
    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", auth.userId)
      .eq("following_id", targetUserId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to unfollow user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
