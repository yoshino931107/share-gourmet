"use client";
import { useEffect, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

/**
 * お店情報の型定義
 */
type Shop = {
  id: string;
  hotpepper_id: string;
  name: string;
  latitude: number;
  longitude: number;
  image_url?: string;
};

/**
 * Google Map表示コンポーネント
 * @param shops - 地図上に表示するお店の配列
 */
export const MapContent = ({ shops = [] }: { shops: Shop[] }) => {
  /**
   * マップを表示するコンテナ用のref
   */
  const mapContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Google Mapインスタンス保持用のref
   */
  const mapRef = useRef<google.maps.Map | null>(null);

  /**
   * マーカー配列を保持するref
   */
  const markersRef = useRef<google.maps.Marker[]>([]);

  /**
   * 現在表示中のInfoWindowを管理するref
   */
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  /**
   * shopsの内容が変わるたびに地図とマーカーを再描画
   */
  useEffect(() => {
    /**
     * Google Mapsライブラリを動的に読み込み＆地図・マーカー描画
     */
    const loadMap = async () => {
      if (!mapContainerRef.current) return;

      // Google Mapsライブラリをインポート
      const mapsLib = (await google.maps.importLibrary(
        "maps",
      )) as google.maps.MapsLibrary;
      const markerLib = (await google.maps.importLibrary(
        "marker",
      )) as google.maps.MarkerLibrary;

      const Map = mapsLib.Map;
      const InfoWindow = mapsLib.InfoWindow;
      const Marker = markerLib.Marker;

      /**
       * 地図の初期中心座標・ズームレベル
       */
      const center = { lat: 35.656, lng: 139.737 };
      const zoom = 15;

      // マップ生成（仮のcenterで）
      mapRef.current = new Map(mapContainerRef.current, {
        center,
        zoom,
      });

      // 念のため再初期化
      mapRef.current = new Map(mapContainerRef.current, {
        center,
        zoom: 15,
      });

      /**
       * 既存マーカー・InfoWindowをクリア
       */
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      /**
       * お店一覧が存在する場合、地図にマーカーを配置
       */
      if (shops.length > 0) {
        // 地図上の全マーカーを収めるためのBounds
        const bounds = new google.maps.LatLngBounds();
        shops.forEach((shop) => {
          // 各ショップ用マーカー生成
          const marker = new Marker({
            position: { lat: shop.latitude, lng: shop.longitude },
            map: mapRef.current!,
            title: shop.name,
          });
          markersRef.current.push(marker);

          // 吹き出し（InfoWindow）生成
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

          // マーカークリック時にInfoWindowを開く
          marker.addListener("click", () => {
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }
            infoWindow.open(mapRef.current, marker);
            infoWindowRef.current = infoWindow;
          });

          // Boundsにマーカー位置を追加
          bounds.extend({ lat: shop.latitude, lng: shop.longitude });
        });
        // 全マーカーが地図内に収まるように調整
        mapRef.current.fitBounds(bounds);
      }
    };

    // 実際の地図描画を実行
    loadMap();
  }, [shops]);

  /**
   * Google Maps API Providerと地図コンテナをレンダリング
   */
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ""}>
      <div
        ref={mapContainerRef}
        className="h-screen w-full rounded-lg shadow"
      />
    </APIProvider>
  );
};
