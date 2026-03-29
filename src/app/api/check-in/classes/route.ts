import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("enrollments")
      .select(
        "id,course_id,courses(id,code,name,start_time,end_time,building_location_id,building_locations(id,name,latitude,longitude,radius_meters))",
      )
      .eq("user_id", auth.userId);

    if (error) throw error;

    const enrolledClasses = (data ?? []).map((item) => {
      const course = Array.isArray(item.courses) ? item.courses[0] : item.courses;
      const building = Array.isArray(course?.building_locations)
        ? course?.building_locations[0]
        : course?.building_locations;

      return {
        id: course?.id,
        code: course?.code,
        name: course?.name,
        startTime: course?.start_time,
        endTime: course?.end_time,
        building: building
          ? {
              id: building.id,
              name: building.name,
              latitude: building.latitude,
              longitude: building.longitude,
              radiusMeters: building.radius_meters,
            }
          : null,
      };
    });

    return NextResponse.json({ classes: enrolledClasses.filter((item) => item.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load classes.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
