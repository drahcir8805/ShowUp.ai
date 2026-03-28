export type AtClassResult = {
  present: boolean;
  distance: number;
};

export type StudentCoords = {
  lat: number;
  lng: number;
};

/** studentLat, studentLng from browser GPS; classLat, classLng from saved class (Supabase later). */
export function isStudentAtClass(
  studentLat: number,
  studentLng: number,
  classLat: number,
  classLng: number,
): AtClassResult {
  const R = 6371e3;
  const φ1 = (studentLat * Math.PI) / 180;
  const φ2 = (classLat * Math.PI) / 180;
  const Δφ = ((classLat - studentLat) * Math.PI) / 180;
  const Δλ = ((classLng - studentLng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return {
    present: distance < 100,
    distance: Math.round(distance),
  };
}

/** Get student's current GPS coordinates from the browser. */
export function getStudentLocation(): Promise<StudentCoords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => reject(error),
    );
  });
}

export type ClassLocationForCheck = {
  id: string;
  lat: number;
  lng: number;
};

/** Full attendance check at class time — result shape ready for Supabase `attendance_logs` later. */
export async function checkAttendance(classData: ClassLocationForCheck) {
  const studentLocation = await getStudentLocation();
  const result = isStudentAtClass(
    studentLocation.lat,
    studentLocation.lng,
    classData.lat,
    classData.lng,
  );

  return {
    present: result.present,
    distance: result.distance,
    studentLat: studentLocation.lat,
    studentLng: studentLocation.lng,
    classId: classData.id,
    checkedAt: new Date().toISOString(),
    // TODO: save this to Supabase attendance_logs table
  };
}
