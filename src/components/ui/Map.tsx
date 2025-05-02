"use client";
import { useEffect, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

export const MapContent = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const loadMap = async () => {
      const { Map } = await google.maps.importLibrary("maps");
      const { Marker } = await google.maps.importLibrary("marker");

      mapRef.current = new Map(mapContainerRef.current, {
        center: { lat: 35.656, lng: 139.737 },
        zoom: 15,
      });

      new Marker({
        position: { lat: 35.656, lng: 139.737 },
        map: mapRef.current,
        title: "シェアグル本部 🍜",
      });
    };

    loadMap();
  }, []);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ""}>
      <div
        ref={mapContainerRef}
        className="h-screen w-full rounded-lg shadow"
      />
    </APIProvider>
  );
};
