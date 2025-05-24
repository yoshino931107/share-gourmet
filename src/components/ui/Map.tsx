"use client";
import { useEffect, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

type Shop = {
  id: string;
  hotpepper_id: string;
  name: string;
  latitude: number;
  longitude: number;
  image_url?: string;
};

export const MapContent = ({ shops = [] }: { shops: Shop[] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      if (!mapContainerRef.current) return;

      const mapsLib = (await google.maps.importLibrary(
        "maps",
      )) as google.maps.MapsLibrary;
      const markerLib = (await google.maps.importLibrary(
        "marker",
      )) as google.maps.MarkerLibrary;

      const Map = mapsLib.Map;
      const InfoWindow = mapsLib.InfoWindow;
      const Marker = markerLib.Marker;

      const center = { lat: 35.656, lng: 139.737 };
      const zoom = 15;

      // マップ生成（仮のcenterで）
      mapRef.current = new Map(mapContainerRef.current, {
        center,
        zoom,
      });

      mapRef.current = new Map(mapContainerRef.current, {
        center,
        zoom: 15,
      });

      // 既存マーカー削除
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // 既存InfoWindowを閉じる
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      // Boundsを作る
      if (shops.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        shops.forEach((shop) => {
          const marker = new Marker({
            position: { lat: shop.latitude, lng: shop.longitude },
            map: mapRef.current!,
            title: shop.name,
          });
          markersRef.current.push(marker);

          // InfoWindow生成
          const infoWindow = new InfoWindow({
            content: `
              <a href="/share-detail/${shop.hotpepper_id}" style="text-decoration:none;color:inherit;" target="_blank" rel="noopener noreferrer">
                <div style="min-width:100px;max-width:120px;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
                  <img src="${shop.image_url}" style="width:90px;height:90px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
                  <div style="width:90px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;white-space:normal;line-height:1.2;">
                    <b>${shop.name}</b>
                  </div>
                </div>
              </a>
            `,
          });

          marker.addListener("click", () => {
            // ほかの吹き出しを閉じる
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }
            infoWindow.open(mapRef.current, marker);
            infoWindowRef.current = infoWindow;
          });

          // Boundsに追加
          bounds.extend({ lat: shop.latitude, lng: shop.longitude });
        });
        // すべてのマーカーが見えるように調整
        mapRef.current.fitBounds(bounds);
      }
    };

    loadMap();
  }, [shops]);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ""}>
      <div
        ref={mapContainerRef}
        className="h-screen w-full rounded-lg shadow"
      />
    </APIProvider>
  );
};
