"use client";
import Header from "@/components/ui/header";
import DetailPhoto from "@/components/ui/DetailPhoto";
import Tab from "@/components/ui/tab";
import HorizontalLine from "@/components/ui/horizontalLine";
import {
  BookmarkIcon,
  HeartIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import { supabase } from "@/utils/supabase/supabase";

export default function Detail() {
  const shop = {
    id: "J001123456",
    name: "ラーメンやさん",
    image_url: "https://placehold.jp/410x250.png",
    url: "https://www.hotpepper.jp/strJ001123456/",
    address: "東京都渋谷区1-2-3",
    genre: "ラーメン",
  };

  const handleShare = async () => {
    const { data, error } = await supabase.from("shared_shops").insert([
      {
        user_id: null, // ← あとで認証機能を実装したらuser.idを入れる ＆ supabaseのセキュリティちゃんとする
        hotpepper_id: shop.id,
        name: shop.name,
        image_url: shop.image_url,
        url: shop.url,
        address: shop.address,
        genre: shop.genre,
      },
    ]);

    if (error) {
      console.error("❌ シェア失敗:", error);
      alert("シェアに失敗しました🥲");
    } else {
      alert("シェアしました🎉");
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      <main className="overflow-y-auto bg-gray-50">
        <DetailPhoto
          src={"https://placehold.jp/410x250.png"}
          alt={"result画像1"}
        />
        <div className="flex-1">
          <h2 className="m-5 text-3xl font-semibold text-gray-900">
            お店の名前お店の名前お店の名前お店の名前
          </h2>
          <div className="m-5">
            <div className="flex items-center">
              <span className="mt-1 mr-2 text-xl text-rose-500">★★★★☆ 4.0</span>
              <span className="text-xs text-gray-500">（食べログ評価）</span>
            </div>
            <div className="mt-1 flex text-sm text-gray-700">
              <span className="mr-2">駅名駅名駅名</span>
              <span className="mr-2">/</span>
              <span>ジャンル</span>
            </div>
            <div className="mt-2 flex text-sm text-gray-700">
              <span className="mr-2">☀️0,000〜0,000円</span>
              <span>🌙0,000〜0,000円</span>
            </div>
          </div>
          <h3 className="mt-5 mr-5 mb-3 ml-5 text-2xl font-semibold text-gray-900">
            お店の詳細見出しお店の詳細見出し
          </h3>
          <p className="mt-3 mr-5 mb-5 ml-5 text-base text-gray-900">
            お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細
          </p>
        </div>
        <HorizontalLine />
        <h3 className="mt-5 mr-5 mb-3 ml-5 text-xl font-semibold text-gray-900">
          店舗情報
        </h3>
        <p className="mt-3 mr-5 mb-5 ml-5 text-base text-gray-900">
          住所：東京都渋谷区1-2-3
          <br />
          電話番号：03-1234-5678
          <br />
          営業時間：11:00〜23:00
          <br />
          定休日：月曜日
          <br />
          アクセス：渋谷駅から徒歩5分
          <br />
          駐車場：なし
          <br />
          席数：50席
          <br />
          禁煙・喫煙：全席禁煙
          <br />
          クレジットカード：可
          <br />
          Wi-Fi：あり
          <br />
          バリアフリー：あり
          <br />
          お子様連れ：歓迎
          <br />
          ペット：不可
          <br />
          予約：可
          <br />
          貸切：不可
          <br />
          サービス料：10%
          <br />
          チャージ料：500円
          <br />
        </p>
      </main>
      <div className="fixed bottom-25 left-1/2 z-10 flex w-full max-w-md -translate-x-1/2 justify-between gap-x-2 bg-transparent px-4 py-2">
        <button className="flex flex-1 flex-col items-center rounded-xl border border-gray-500 bg-gray-100 bg-gradient-to-b from-white via-gray-100 to-gray-200 py-2 text-xs text-gray-700 shadow-md">
          <BookmarkIcon className="mb-1 h-6 w-6 text-gray-700" />
          保存する
        </button>
        <button
          onClick={handleShare}
          className="flex flex-1 flex-col items-center rounded-xl border border-gray-500 bg-gray-100 bg-gradient-to-b from-white via-rose-50 to-rose-100 py-2 text-xs text-rose-500 shadow-md"
        >
          <HeartIcon className="mb-1 h-6 w-6 text-rose-500" />
          シェア！
        </button>
        <button className="flex flex-1 flex-col items-center rounded-xl border border-gray-500 bg-gray-100 bg-gradient-to-b from-white via-gray-100 to-gray-200 py-2 text-xs text-gray-700 shadow-md">
          <CalendarDaysIcon className="mb-1 h-6 w-6 text-gray-700" />
          予約する
        </button>
      </div>
      <Tab />
    </div>
  );
}
