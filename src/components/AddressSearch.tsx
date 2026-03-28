"use client";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import {
  isWithinLaurierWaterlooCampus,
  LAURIER_WATERLOO_BBOX,
  LAURIER_WATERLOO_CENTER,
} from "@/lib/laurier-campus";
import { useEffect, useRef, useState } from "react";

export type AddressSelection = {
  address: string;
  lat: number;
  lng: number;
};

type AddressSearchProps = {
  onSelect: (location: AddressSelection) => void;
  placeholder?: string;
};

/** Drop-in address autocomplete; `onSelect` receives values to store in form state or pass to `createClassObject`. */
export function AddressSearch({ onSelect, placeholder }: AddressSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const [boundsMessage, setBoundsMessage] = useState<string | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is missing");
      return;
    }

    const geocoder = new MapboxGeocoder({
      accessToken: token,
      placeholder: placeholder ?? "Search for a location...",
      types: "address,poi,place",
      proximity: {
        longitude: LAURIER_WATERLOO_CENTER.lng,
        latitude: LAURIER_WATERLOO_CENTER.lat,
      },
      bbox: [...LAURIER_WATERLOO_BBOX],
      countries: "CA",
    });

    geocoder.addTo(el);

    const handler = (e: {
      result: { place_name: string; geometry: { coordinates: [number, number] } };
    }) => {
      const [lng, lat] = e.result.geometry.coordinates;
      if (!isWithinLaurierWaterlooCampus(lng, lat)) {
        setBoundsMessage("Choose a location on Laurier's Waterloo campus.");
        return;
      }
      setBoundsMessage(null);
      onSelectRef.current({
        address: e.result.place_name,
        lat,
        lng,
      });
    };

    geocoder.on("result", handler);

    return () => {
      geocoder.onRemove();
    };
  }, [placeholder]);

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full" />
      {boundsMessage ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {boundsMessage}
        </p>
      ) : null}
    </div>
  );
}
