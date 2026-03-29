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

type CampusBuilding = {
  name: string;
  address: string;
  lng: number;
  lat: number;
  aliases: string[];
};

const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    name: "Science Building",
    address: "Science Building - 75 University Ave W, Waterloo, ON N2J 0E1",
    lng: -80.52498840101528,
    lat: 43.47345451304001,
    aliases: ["science", "science building", "75 university ave w"],
  },
  {
    name: "Bricker Academic Building",
    address:
      "Bricker Academic Building - 75 University Ave W, Waterloo, ON N2J 0E1",
    lng: -80.52648384055382,
    lat: 43.47266313368542,
    aliases: [
      "bricker",
      "bricker building",
      "bricker academic",
      "ba building",
      "academic building",
      "75 university ave w",
    ],
  },
  {
    name: "Peters Building",
    address: "Peters Building - 75 University Ave W, Waterloo, ON N2J 0E1",
    lng: -80.53027050049205,
    lat: 43.4732160449237,
    aliases: [
      "peters",
      "peters building",
      "schjleiagal building",
      "schjleiagal",
      "75 university ave w",
    ],
  },
  {
    name: "Lazaridis Hall",
    address: "Lazaridis Hall - 64 University Ave W, Waterloo, ON N2L 3C7",
    lng: -80.5293722956909,
    lat: 43.47514128575966,
    aliases: ["lazaridis", "lazaridis hall", "64 university ave w"],
  },
  {
    name: "Fred Nichols Campus Centre",
    address:
      "Fred Nichols Campus Centre - 75 University Ave W, Waterloo, ON N2L 3C5",
    lng: -80.52874389994808,
    lat: 43.4734859703637,
    aliases: ["fncc", "nichols", "campus centre", "student centre"],
  },
  {
    name: "Arts Building",
    address: "Arts Building - 75 University Ave W, Waterloo, ON N2L 3C5",
    lng: -80.52971004469768,
    lat: 43.473804760073556,
    aliases: ["arts", "arts building"],
  },
];

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
      localGeocoder: (query: string) => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        return CAMPUS_BUILDINGS.filter((b) => {
          if (b.name.toLowerCase().includes(q)) return true;
          if (b.address.toLowerCase().includes(q)) return true;
          return b.aliases.some((alias) => alias.includes(q));
        }).map((b) => ({
          id: `campus-${b.name.toLowerCase().replace(/\s+/g, "-")}`,
          type: "Feature",
          place_type: ["poi"],
          relevance: 1,
          text: b.name,
          place_name: b.address,
          center: [b.lng, b.lat],
          geometry: {
            type: "Point",
            coordinates: [b.lng, b.lat] as [number, number],
          },
          properties: {},
        }));
      },
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
    <div className="relative z-30 w-full">
      <div ref={containerRef} className="w-full" />
      {boundsMessage ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {boundsMessage}
        </p>
      ) : null}
    </div>
  );
}
