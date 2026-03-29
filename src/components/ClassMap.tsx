"use client";

import {
  LAURIER_MAP_STYLE,
  laurierMaxBounds,
} from "@/lib/laurier-campus";
import Map, { Marker, Layer, useMap } from "react-map-gl/mapbox";
import { useSyncExternalStore, useRef, useEffect, useState } from "react";

type ClassMapProps = {
  lat?: number;
  lng?: number;
  enableFlyTo?: boolean;
};

// Component to handle fly-to animation
function MapController({ lat, lng, enableFlyTo }: { lat?: number; lng?: number; enableFlyTo?: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (enableFlyTo && lat && lng && map?.current) {
      // Fly to the building with smooth animation
      map.current.flyTo({
        center: [lng, lat],
        zoom: 18,
        pitch: 60,
        bearing: -20,
        duration: 2000, // 2 second smooth animation
      });
    }
  }, [lat, lng, enableFlyTo, map]);

  return null;
}

/** Enhanced map preview with 3D buildings and fly-to animation */
export function ClassMap({ lat, lng, enableFlyTo = false }: ClassMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!lat || !lng) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400">
        Add address to see map
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400">
        Loading map…
      </div>
    );
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-400">
        Map token not configured
      </div>
    );
  }

  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{
        longitude: lng,
        latitude: lat,
        zoom: 16.5,
        pitch: 58,
        bearing: 32,
      }}
      style={{ width: "100%", height: "300px", borderRadius: "12px" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      maxBounds={laurierMaxBounds()}
      minZoom={14}
      maxZoom={19.5}
      interactive={enableFlyTo}
    >
      <MapController lat={lat} lng={lng} enableFlyTo={enableFlyTo} />
      
      <Marker longitude={lng} latitude={lat} anchor="bottom">
        <div
          className="h-4 w-4 rounded-full border-2 border-white shadow-lg"
          style={{ backgroundColor: "#7C3AED" }}
        />
      </Marker>

      {/* 3D buildings layer */}
      <Layer
        id="3d-buildings"
        source="composite"
        source-layer="building"
        filter={['==', 'extrude', 'true']}
        type="fill-extrusion"
        minzoom={15}
        paint={{
          'fill-extrusion-color': '#888888',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6
        }}
      />
      
      {/* Alternative building layer for better coverage */}
      <Layer
        id="3d-buildings-v2"
        source="mapbox-streets"
        source-layer="building"
        filter={['==', 'extrude', 'true']}
        type="fill-extrusion"
        minzoom={15}
        paint={{
          'fill-extrusion-color': '#999999',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.5
        }}
      />
    </Map>
  );
}
