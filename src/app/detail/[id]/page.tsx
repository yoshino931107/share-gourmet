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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function Detail() {
  const [shop, setShop] = useState<any>(null);
  const params = useParams();

  useEffect(() => {
    const id = params?.id as string;

    if (!id) return;

    const fetchShop = async () => {
      try {
        const res = await fetch("/api/hotpepper", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        console.log("🔥 Hotpepperデータ:", data); // デバッグログ
        setShop(data);
      } catch (error) {
        console.error("❌ Fetchエラー:", error);
      }
    };

    fetchShop();
  }, [params]);

  const router = useRouter();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState([
    { id: "ramen-group-id", name: "ラーメン部" },
    { id: "cafe-group-id", name: "カフェ会" },
  ]);

  const handleShare = () => {
    setShowGroupModal(true);
  };

  const handleGroupSelect = async (groupId: string) => {
    setShowGroupModal(false);

    const { error } = await supabase.from("shared_shops").insert([
      {
        user_id: "demo-user-id",
        hotpepper_id: shop?.id,
        name: shop?.name,
        image_url: shop?.photo?.pc?.l,
        url: shop?.urls?.pc,
        address: shop?.address,
        genre: shop?.genre?.name,
        group_id: groupId,
      },
    ]);

    if (error) {
      console.error("❌ シェア失敗:", error);
      alert("シェアに失敗しました🥲");
    } else {
      alert("グループにシェアしました🎉");
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      <main className="overflow-y-auto bg-gray-50">
        {shop ? (
          <>
            <DetailPhoto src={shop.photo.pc.l} alt={shop.name} />
            <div className="flex-1">
              <h2 className="m-5 text-3xl font-semibold text-gray-900">
                {shop.name}
              </h2>
              <div className="m-5">
                <div className="flex items-center">
                  <span className="mt-1 mr-2 text-xl text-rose-500">
                    ★★★★☆ {shop.tabelog || "4.0"}
                  </span>
                  <span className="text-xs text-gray-500">
                    （食べログ評価）
                  </span>
                </div>
                <div className="mt-1 flex text-sm text-gray-700">
                  <span className="mr-2">
                    {shop.station_name || "駅名駅名駅名"}
                  </span>
                  <span className="mr-2">/</span>
                  <span>{shop.genre?.name || "ジャンル"}</span>
                </div>
                <div className="mt-2 flex text-sm text-gray-700">
                  <span className="mr-2">
                    ☀️{shop.lunch_price || "0,000"}〜
                    {shop.lunch_price_max || "0,000"}円
                  </span>
                  <span>
                    🌙{shop.dinner_price || "0,000"}〜
                    {shop.dinner_price_max || "0,000"}円
                  </span>
                </div>
              </div>
              <h3 className="mt-5 mr-5 mb-3 ml-5 text-2xl font-semibold text-gray-900">
                お店の詳細見出しお店の詳細見出し
              </h3>
              <p className="mt-3 mr-5 mb-5 ml-5 text-base text-gray-900">
                {shop.description ||
                  "お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細"}
              </p>
            </div>
            <HorizontalLine />
            <h3 className="mt-5 mr-5 mb-3 ml-5 text-xl font-semibold text-gray-900">
              店舗情報
            </h3>
            <p className="mt-3 mr-5 mb-5 ml-5 text-base text-gray-900">
              住所：{shop.address || "東京都渋谷区1-2-3"}
              <br />
              電話番号：{shop.tel || "03-1234-5678"}
              <br />
              営業時間：{shop.open || "11:00〜23:00"}
              <br />
              定休日：{shop.close || "月曜日"}
              <br />
              アクセス：{shop.access || "渋谷駅から徒歩5分"}
              <br />
              駐車場：{shop.parking || "なし"}
              <br />
              席数：{shop.seats || "50席"}
              <br />
              禁煙・喫煙：{shop.smoking || "全席禁煙"}
              <br />
              クレジットカード：{shop.credit_card || "可"}
              <br />
              Wi-Fi：{shop.wifi || "あり"}
              <br />
              バリアフリー：{shop.barrier_free || "あり"}
              <br />
              お子様連れ：{shop.children || "歓迎"}
              <br />
              ペット：{shop.pet || "不可"}
              <br />
              予約：{shop.reservation || "可"}
              <br />
              貸切：{shop.charter || "不可"}
              <br />
              サービス料：{shop.service_charge || "10%"}
              <br />
              チャージ料：{shop.charge || "500円"}
              <br />
            </p>
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">読み込み中...</div>
        )}
      </main>
      {showGroupModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-72 rounded bg-white p-4">
            <h2 className="mb-2 text-center font-bold text-gray-700">
              どのグループにシェアしますか？
            </h2>
            <div className="space-y-2">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group.id)}
                  className="w-full rounded bg-orange-100 px-3 py-2 text-sm text-orange-600 hover:bg-orange-200"
                >
                  {group.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
