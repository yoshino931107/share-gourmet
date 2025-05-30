"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

type Shop = {
  id: string;
  hotpepper_id: string;
  name: string;
  image_url: string | null;
  genre: string | null;
  url: string | null;
  address: string | null;
};

type ResultClientProps = {
  className?: string;
};

/**
 * 検索結果の店舗一覧を表示するコンポーネント
 * @param {string} className - コンポーネントのクラス名
 */
const ResultClient: React.FC<ResultClientProps> = ({ className }) => {
  /**
   * 取得した店舗データの配列を管理するステート
   */
  const [shops, setShops] = useState<Shop[]>([]);

  /**
   * データ取得中かどうかのローディング状態を管理するステート
   */
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * ルーターオブジェクト（ページ遷移用）
   */
  const router = useRouter();

  /**
   * URLのクエリパラメータを取得するためのフック
   */
  const searchParams = useSearchParams();

  /**
   * クエリパラメータから取得した検索キーワード
   */
  const keyword = searchParams.get("keyword") || "";

  /**
   * キーワードが変更されたときにAPIから店舗データを取得する副作用
   */
  useEffect(() => {
    setLoading(true);
    fetch("/api/hotpepper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword }),
    })
      .then((res) => res.json())
      .then((result) => {
        setShops(Array.isArray(result) ? result : []);
      })
      .finally(() => setLoading(false));
  }, [keyword]);

  /**
   * 店舗がクリックされたときに詳細ページへ遷移する処理
   * @param {Shop} shop - クリックされた店舗データ
   */
  const handleShopClick = (shop: Shop) => {
    if (!shop.hotpepper_id) {
      return;
    }
    router.push(`/detail/${shop.hotpepper_id}`);
  };

  /**
   * 画像URLを安全なhttps形式に変換し、画像がない場合はプレースホルダー画像を返す関数
   * @param {string | null | undefined} url - 画像URL
   * @returns {string} 画像URLまたはプレースホルダー画像のURL
   */
  function getImageUrl(url?: string | null): string {
    if (url && !url.includes("noimage.jpg")) {
      return url.replace("http://", "https://");
    }
    return "https://placehold.jp/150x150.png";
  }

  /**
   * コンポーネントの描画部分
   * ローディング中はローディング表示を出し、取得した店舗一覧をリスト表示する
   * 店舗がない場合は該当なしメッセージを表示
   */
  return (
    <div className={className}>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="text-lg text-gray-500">Loading...</span>
          </div>
        ) : (
          <ul className="space-y-4">
            {shops.map((shop) => {
              return (
                <li
                  key={shop.id}
                  className="flex cursor-pointer rounded-lg bg-white p-4 shadow-md transition hover:bg-gray-50"
                  onClick={() => handleShopClick(shop)}
                >
                  <Image
                    src={getImageUrl(shop.image_url)}
                    alt={shop.name}
                    width={96}
                    height={96}
                    className="mr-4 h-24 w-24 flex-shrink-0 rounded-md object-cover"
                    unoptimized
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{shop.name}</h3>
                      {shop.genre && (
                        <span className="text-sm text-gray-500">
                          {shop.genre}
                        </span>
                      )}
                    </div>
                    {shop.address && (
                      <div className="mt-2 text-xs text-gray-400">
                        {shop.address}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
            {!loading && shops.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                お店が見つかりませんでした
              </div>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResultClient;
