import { findNearestBuilding, isWithinGeofence } from "@/lib/geofence";
import { sendSuspiciousCheckInEmail } from "@/lib/mailer";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export type CheckInInput = {
  userId: string;
  classId: string;
  currentLatitude: number;
  currentLongitude: number;
};

export type CheckInFlowResult = {
  accepted: boolean;
  status: "valid" | "blocked" | "suspicious";
  message: string;
  checkInId: string;
  nearestBuildingName?: string | null;
  attemptedBuildingName: string;
  distanceFromClassMeters: number;
};

export async function processClassCheckIn(input: CheckInInput): Promise<CheckInFlowResult> {
  const supabase = getSupabaseServerClient();

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, course_id")
    .eq("user_id", input.userId)
    .eq("course_id", input.classId)
    .maybeSingle();

  if (enrollmentError) {
    throw enrollmentError;
  }
  if (!enrollment) {
    throw new Error("You are not enrolled in this class.");
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, code, name, building_location_id, building_locations(id,name,latitude,longitude,radius_meters)")
    .eq("id", input.classId)
    .single();

  if (courseError || !course?.building_locations) {
    throw new Error("Class building location not found.");
  }

  const classBuilding = Array.isArray(course.building_locations)
    ? course.building_locations[0]
    : course.building_locations;

  const geofenceResult = isWithinGeofence(
    { latitude: input.currentLatitude, longitude: input.currentLongitude },
    { latitude: classBuilding.latitude, longitude: classBuilding.longitude },
    classBuilding.radius_meters,
  );

  const attemptedAt = new Date().toISOString();
  const checkInStatus = geofenceResult.withinRange ? "valid" : "blocked";

  const { data: insertedCheckIn, error: checkInError } = await supabase
    .from("check_ins")
    .insert({
      user_id: input.userId,
      course_id: input.classId,
      check_in_time: attemptedAt,
      user_latitude: input.currentLatitude,
      user_longitude: input.currentLongitude,
      status: checkInStatus,
      resolved_building_id: classBuilding.id,
      distance_from_class_meters: Math.round(geofenceResult.distanceMeters),
    })
    .select("id")
    .single();

  if (checkInError || !insertedCheckIn) {
    throw checkInError ?? new Error("Failed to create check-in.");
  }

  if (geofenceResult.withinRange) {
    return {
      accepted: true,
      status: "valid",
      message: `Check-in accepted for ${course.name}.`,
      checkInId: insertedCheckIn.id,
      attemptedBuildingName: classBuilding.name,
      distanceFromClassMeters: Math.round(geofenceResult.distanceMeters),
    };
  }

  const { data: allBuildings, error: buildingsError } = await supabase
    .from("building_locations")
    .select("id,name,latitude,longitude,radius_meters");

  if (buildingsError) {
    throw buildingsError;
  }

  const nearest = findNearestBuilding(
    { latitude: input.currentLatitude, longitude: input.currentLongitude },
    (allBuildings ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      latitude: b.latitude,
      longitude: b.longitude,
      radiusMeters: b.radius_meters,
    })),
  );

  const { data: trustedFriends, error: trustedFriendsError } = await supabase
    .from("trusted_friends")
    .select("id,email,alerts_enabled,friend_user_id")
    .eq("user_id", input.userId)
    .eq("alerts_enabled", true);

  if (trustedFriendsError) {
    throw trustedFriendsError;
  }

  let emailSent = false;
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("display_name,username")
    .eq("user_id", input.userId)
    .maybeSingle();

  const displayName = userProfile?.display_name || userProfile?.username || "A user";

  for (const recipient of trustedFriends ?? []) {
    try {
      await sendSuspiciousCheckInEmail(recipient.email, {
        userDisplayName: displayName,
        attemptedClassName: course.name,
        attemptedBuildingName: classBuilding.name,
        actualNearbyBuildingName: nearest.building?.name ?? null,
        timestampIso: attemptedAt,
        latitude: input.currentLatitude,
        longitude: input.currentLongitude,
        blocked: true,
      });
      emailSent = true;
    } catch (error) {
      console.error("Failed to send suspicious check-in email", error);
    }
  }

  const { error: suspiciousError } = await supabase.from("suspicious_check_in_events").insert({
    check_in_id: insertedCheckIn.id,
    user_id: input.userId,
    attempted_course_id: input.classId,
    actual_nearby_building_id: nearest.building?.id ?? null,
    attempted_at: attemptedAt,
    reason: "User outside class geofence during check-in attempt.",
    email_sent: emailSent,
    email_sent_at: emailSent ? new Date().toISOString() : null,
  });

  if (suspiciousError) {
    throw suspiciousError;
  }

  return {
    accepted: false,
    status: "blocked",
    message: nearest.building?.name
      ? `You appear to be near ${nearest.building.name}, so your ${course.name} check-in was blocked. Your trusted friend has been notified.`
      : `Your ${course.name} check-in was blocked because you're outside the required location.`,
    checkInId: insertedCheckIn.id,
    nearestBuildingName: nearest.building?.name ?? null,
    attemptedBuildingName: classBuilding.name,
    distanceFromClassMeters: Math.round(geofenceResult.distanceMeters),
  };
}
