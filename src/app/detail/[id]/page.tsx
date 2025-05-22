"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";
import { supabase } from "@/utils/supabase/supabase";
import Tab from "@/components/ui/tab";
import { useParams } from "next/navigation";
import {
  BookmarkIcon,
  HeartIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

export default function DetailPage() {
  // ────────────────────────────────────────────────
  // 画像が取得できなかった場合に表示するフォールバック画像
  const fallbackImage = "https://placehold.jp/150x150.png";
  // ────────────────────────────────────────────────
  // 共有グループ（id は Supabase の groups テーブルの UUID）
  const groups = [
    { id: "e05b304e-503d-48a5-9dd9-a1fb4533b621", label: "ラーメン部" },
    { id: "552bcd0a-90ce-4366-af18-0028f4d45921", label: "カフェ会" },
  ] as const;
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  console.log("🔥 params:", params);
  const hotpepperId = params.id as string;
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleShare = async () => {
    if (!selectedGroupId || shops.length === 0) return;
    const shop = shops[0];

    // ① ログインユーザー取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log("user:", user, "authError:", authError);

    if (!user) {
      alert("ログインしてください");
      return;
    }

    const genre =
      typeof shop.genre === "object" && shop.genre?.name
        ? shop.genre.name
        : (shop.genre ?? "ジャンル不明");

    const image_url =
      shop.photo && shop.photo.pc?.l
        ? shop.photo.pc.l
        : shop.image_url && shop.image_url !== ""
          ? shop.image_url
          : "https://placehold.jp/150x150.png";

    // upsert
    const { error: upsertError } = await supabase.from("shared_shops").upsert(
      {
        user_id: user.id,
        hotpepper_id: shop.hotpepper_id,
        group_id: selectedGroupId,
        name: shop.name,
        address: shop.address,
        genre: shop.genre?.name ?? "ジャンル不明",
        image_url: image_url,
      },
      { onConflict: ["hotpepper_id", "group_id"] },
    );

    if (upsertError) {
      console.error("シェア保存失敗:", upsertError);
    } else {
      router.push(`/share?group=${selectedGroupId}`);
    }
  };

  useEffect(() => {
    const fetchShop = async () => {
      if (shops.length > 0 && shops[0].photo) {
        console.log("APIのphoto部分:", shops[0].photo);
      }

      const { data, error } = await supabase
        .from("shared_shops")
        .select("*")
        .or(`hotpepper_id.eq.${hotpepperId},id.eq.${hotpepperId}`);

      if (error) console.error(error);

      if (data && data.length > 0) {
        setShops(data);
        setLoading(false);
        return;
      }

      const hp = await fetch(`/api/hotpepper`, {
        method: "POST",
        body: JSON.stringify({
          keyword: "",
          genre: "",
          small_area: "",
          id: hotpepperId,
        }),
      }).then((r) => r.json());

      if (hp.results_available > 0) {
        const shop = hp.results.shop[0];
        setShops([
          {
            hotpepper_id: shop.id,
            name: shop.name,
            address: shop.address,
            genre: shop.genre.name,
            image_url: shop.photo?.pc?.l ?? null,
            photo: shop.photo,
          },
        ]);
      }
      setLoading(false);
    };

    fetchShop();
  }, [hotpepperId]);

  const shop = shops[0];

  console.log("🟢 shop詳細:", shops[0]);
  console.log("APIのshop:", shop); // shop.genreやshop.budgetを確認

  return (
    <>
      <div className="mx-auto max-w-md pt-[0px] pb-[110px]">
        {loading ? (
          <p className="align-items center flex">読み込み中...</p>
        ) : shops.length === 0 ? (
          <p className="align-items center flex">
            お店の情報が見つかりませんでした。
          </p>
        ) : (
          <div>
            <img
              src={shops[0].image_url ?? fallbackImage}
              alt={shops[0].name}
              className="aspect-square w-full rounded object-cover"
            />
            <div className="mx-4">
              <h2 className="mt-4 text-xl font-semibold">{shops[0].name}</h2>
              <p>ジャンル: {shop.genre ?? "ジャンル不明"}</p>
              <p>ディナー予算: {shop.budget ?? "情報なし"}</p>
              <p className="mb-30 text-sm text-gray-600">{shops[0].address}</p>
              <div className="mt-6"></div>
            </div>
          </div>
        )}
        <div className="fixed bottom-28 left-1/2 z-10 w-full max-w-[390px] -translate-x-1/2 px-3">
          <div className="flex w-full justify-between gap-3">
            <button className="flex-1 rounded-lg border border-gray-500 bg-linear-to-b from-white to-gray-100 p-1 py-2 shadow-md">
              <div className="flex flex-row items-center justify-center">
                <BookmarkIcon className="h-6 w-6 text-emerald-600" />
                <span className="text-lg font-semibold text-gray-800">
                  保存する
                </span>
              </div>
            </button>
            <button
              key={`share_button_0`}
              onClick={() => setIsDialogOpen(true)}
              className="flex-1 rounded-lg border border-gray-500 bg-linear-to-b from-white to-rose-50 p-1 py-2 shadow-md"
            >
              <div className="flex flex-row items-center justify-center">
                <HeartIcon className="h-6 w-6 text-rose-500" />
                <span className="text-lg font-extrabold text-rose-500">
                  シェア！
                </span>
              </div>
            </button>
            <button
              key={`reserve_button_0`}
              className="flex-1 rounded-lg border border-gray-500 bg-linear-to-b from-white to-gray-100 p-1 py-3 shadow-md"
            >
              <div className="flex flex-row items-center justify-center">
                <CalendarDaysIcon className="h-6 w-6 text-sky-600" />
                <span className="text-lg font-semibold text-gray-800">
                  予約する
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="fixed right-0 bottom-0 left-0 z-10 bg-white">
        <Tab />
      </div>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black"
      >
        <Dialog.Panel className="w-full max-w-xs rounded-lg bg-white p-6">
          <Dialog.Title className="mb-4 text-lg font-bold">
            どのグループにシェアしますか？
          </Dialog.Title>
          <select
            onChange={(e) =>
              setSelectedGroupId(e.target.value !== "" ? e.target.value : null)
            }
            className="mb-4 w-full rounded border px-2 py-1"
            defaultValue=""
          >
            <option value="" disabled>
              グループを選択
            </option>
            {groups.map((g, index) => (
              <option key={`${g.id}_${index}`} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleShare}
            className="w-full rounded bg-rose-500 px-4 py-2 text-white shadow"
          >
            シェアする
          </button>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
