export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type BuildingForDistance = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

export function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusMeters = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  return earthRadiusMeters * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function isWithinGeofence(
  userCoords: Coordinates,
  buildingCoords: Coordinates,
  radiusMeters: number,
): { withinRange: boolean; distanceMeters: number } {
  const distanceMeters = getDistanceMeters(
    userCoords.latitude,
    userCoords.longitude,
    buildingCoords.latitude,
    buildingCoords.longitude,
  );

  return {
    withinRange: distanceMeters <= radiusMeters,
    distanceMeters,
  };
}

export function findNearestBuilding(
  userCoords: Coordinates,
  allBuildings: BuildingForDistance[],
): { building: BuildingForDistance | null; distanceMeters: number | null } {
  if (allBuildings.length === 0) {
    return { building: null, distanceMeters: null };
  }

  let nearest: BuildingForDistance | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const building of allBuildings) {
    const distance = getDistanceMeters(
      userCoords.latitude,
      userCoords.longitude,
      building.latitude,
      building.longitude,
    );

    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = building;
    }
  }

  return {
    building: nearest,
    distanceMeters: Number.isFinite(bestDistance) ? bestDistance : null,
  };
}
