import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { processClassCheckIn } from "@/lib/checkin-service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request);
    const body = await request.json();

    const classId = typeof body.classId === "string" ? body.classId : "";
    const currentLatitude = Number(body.currentLatitude);
    const currentLongitude = Number(body.currentLongitude);

    if (!classId || Number.isNaN(currentLatitude) || Number.isNaN(currentLongitude)) {
      return NextResponse.json(
        { error: "classId, currentLatitude, and currentLongitude are required." },
        { status: 400 },
      );
    }

    const result = await processClassCheckIn({
      userId: user.userId,
      classId,
      currentLatitude,
      currentLongitude,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process check-in.";
    const statusCode = message.toLowerCase().includes("unauthorized") ? 401 : 400;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
