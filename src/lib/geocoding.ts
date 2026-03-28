import {
  isWithinLaurierWaterlooCampus,
  LAURIER_WATERLOO_BBOX,
} from "@/lib/laurier-campus";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const bboxParam = `${LAURIER_WATERLOO_BBOX[0]},${LAURIER_WATERLOO_BBOX[1]},${LAURIER_WATERLOO_BBOX[2]},${LAURIER_WATERLOO_BBOX[3]}`;

export type CoordinatesResult = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

/** Address → coordinates. Call when student saves a class location; persist to Supabase later. */
export async function addressToCoordinates(
  address: string,
): Promise<CoordinatesResult> {
  if (!MAPBOX_TOKEN) {
    throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
  }

  const encoded = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1&bbox=${bboxParam}&country=CA`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    features?: { geometry: { coordinates: [number, number] }; place_name: string }[];
  };

  if (!data.features || data.features.length === 0) {
    throw new Error("Address not found");
  }

  const [lng, lat] = data.features[0].geometry.coordinates;

  if (!isWithinLaurierWaterlooCampus(lng, lat)) {
    throw new Error("Address must be within Wilfrid Laurier University (Waterloo campus) bounds");
  }

  return {
    lat,
    lng,
    formattedAddress: data.features[0].place_name,
  };
}

/** Coordinates → address. Call when displaying where a student currently is. */
export async function coordinatesToAddress(
  lat: number,
  lng: number,
): Promise<string> {
  if (!MAPBOX_TOKEN) {
    throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    features?: { place_name: string }[];
  };

  if (!data.features || data.features.length === 0) {
    return "Unknown location";
  }

  return data.features[0].place_name;
}
