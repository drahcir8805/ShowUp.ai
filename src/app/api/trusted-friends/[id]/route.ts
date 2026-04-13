import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const { id } = await context.params;
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const patch: Record<string, unknown> = {};
    if (typeof body.alertsEnabled === "boolean") {
      patch.alerts_enabled = body.alertsEnabled;
    }
    if (typeof body.email === "string" && body.email.trim().length > 0) {
      patch.email = body.email.trim();
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("trusted_friends")
      .update(patch)
      .eq("id", id)
      .eq("user_id", auth.userId)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ trustedFriend: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update trusted friend.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
