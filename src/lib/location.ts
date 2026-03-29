export type AtClassResult = {
  present: boolean;
  distance: number;
};

export type StudentCoords = {
  lat: number;
  lng: number;
};

export interface CheckInResult {
  success: boolean;
  distance?: number;
  error?: string;
  studentLat?: number;
  studentLng?: number;
  checkedAt?: string;
}

export interface SilentCheckSchedule {
  classId: string;
  scheduledTime: number; // minutes since midnight
  checked: boolean;
}

/** studentLat, studentLng from browser GPS; classLat, classLng from saved class (Supabase later). */
export function isStudentAtClass(
  studentLat: number,
  studentLng: number,
  classLat: number,
  classLng: number,
  radiusMeters: number = 150,
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
    present: distance < radiusMeters,
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
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        resolve(coords);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Accept location cached for 1 minute
      }
    );
  });
}

export type ClassLocationForCheck = {
  id: string;
  lat: number;
  lng: number;
};

/** Manual check-in with location validation and 150m radius */
export async function performManualCheckIn(classData: ClassLocationForCheck): Promise<CheckInResult> {
  try {
    const studentLocation = await getStudentLocation();
    const result = isStudentAtClass(
      studentLocation.lat,
      studentLocation.lng,
      classData.lat,
      classData.lng,
      150, // 150m radius for manual check-in
    );

    return {
      success: result.present,
      distance: result.distance,
      studentLat: studentLocation.lat,
      studentLng: studentLocation.lng,
      checkedAt: new Date().toISOString(),
      error: !result.present 
        ? `You are ${result.distance - 150}m away from class location (need to be within 150m)`
        : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Check-in failed'
    };
  }
}

/** Silent check-in for random verification during lecture */
export async function performSilentCheckIn(classData: ClassLocationForCheck): Promise<CheckInResult> {
  try {
    const studentLocation = await getStudentLocation();
    const result = isStudentAtClass(
      studentLocation.lat,
      studentLocation.lng,
      classData.lat,
      classData.lng,
      200, // Slightly larger radius for silent check-in (200m)
    );

    return {
      success: result.present,
      distance: result.distance,
      studentLat: studentLocation.lat,
      studentLng: studentLocation.lng,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Silent check-in failed'
    };
  }
}

/** Parse time string to minutes since midnight */
export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Get current time in minutes since midnight */
export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** Check if current time is within a time range */
export function isTimeInRange(currentMinutes: number, startMinutes: number, endMinutes: number): boolean {
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/** Get random time within lecture range for silent check-in */
export function getRandomTimeInRange(startMinutes: number, endMinutes: number): number {
  const range = endMinutes - startMinutes;
  const randomOffset = Math.floor(Math.random() * range);
  return startMinutes + randomOffset;
}

/** Schedule a silent check-in during the lecture */
export function scheduleSilentCheckIn(
  classId: string, 
  startTime: string, 
  endTime: string
): SilentCheckSchedule {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  
  // Schedule random check-in between midpoint and end of lecture
  const midpoint = Math.floor((startMinutes + endMinutes) / 2);
  const scheduledTime = getRandomTimeInRange(midpoint, endMinutes);
  
  return {
    classId,
    scheduledTime,
    checked: false
  };
}

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
