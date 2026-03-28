/** Custom 3D Mapbox style (ShowUp / Laurier). */
export const LAURIER_MAP_STYLE =
  "mapbox://styles/drahcir05/cmnah016x000301qn4n860kkx";

/**
 * Bounding box as [minLng, minLat, maxLng, maxLat] — Wilfrid Laurier University,
 * Waterloo campus (main area + immediate student housing).
 */
export const LAURIER_WATERLOO_BBOX = [
  -80.548,
  43.462,
  -80.504,
  43.488,
] as const;

export const LAURIER_WATERLOO_CENTER = {
  lng: -80.5265,
  lat: 43.4728,
} as const;

export function isWithinLaurierWaterlooCampus(lng: number, lat: number): boolean {
  const [minLng, minLat, maxLng, maxLat] = LAURIER_WATERLOO_BBOX;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

/** For `Map` `maxBounds` — southwest + northeast corners. */
export function laurierMaxBounds(): [[number, number], [number, number]] {
  const [minLng, minLat, maxLng, maxLat] = LAURIER_WATERLOO_BBOX;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
