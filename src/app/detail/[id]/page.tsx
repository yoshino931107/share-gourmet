"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import { Dialog } from "@headlessui/react";
import { supabase } from "@/utils/supabase/supabase";
import type { Database } from "@/utils/supabase/database.types";
import Tab from "@/components/ui/Tab";
import { useParams } from "next/navigation";
import {
  BookmarkIcon,
  HeartIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

type PhotoType = {
  pc?: { l?: string; m?: string; s?: string };
  mobile?: { l?: string; s?: string };
};
type BudgetType = {
  code?: string;
  name?: string;
  average?: string;
};
// 型エラー対策: genre は string型または { name?: string } 型も許容する
type HotPepperShop = {
  user_id: string;
  hotpepper_id: string;
  group_id: string;
  name?: string;
  address?: string;
  // 修正ポイント: genreはstringまたは{name?: string}型も許容
  genre?: string | { name?: string };
  image_url?: string;
  shop_url?: string;
  latitude?: number | null;
  longitude?: number | null;
  // photo等は他の箇所で使われている場合があるので省略しない
  photo?: PhotoType;
  budget?: BudgetType;
};

type SharedShopInsert = Database["public"]["Tables"]["shared_shops"]["Insert"];

export default function DetailPage() {
  // ────────────────────────────────────────────────
  // 画像が取得できなかった場合に表示するフォールバック画像
  const fallbackImage = "https://placehold.jp/150x150.png";

  // 画像 URL を決定するヘルパー
  // l → m → s → logo_image → フォールバック の順に探して返す
  const pickImageUrl = (
    p: HotPepperShop["photo"] | undefined,
    logo: string | null,
    fallback: string,
  ) => {
    if (p?.pc?.l && p.pc.l !== "") return p.pc.l;
    if (p?.pc?.m && p.pc.m !== "") return p.pc.m;
    if (p?.pc?.s && p.pc.s !== "") return p.pc.s;
    if (logo && logo !== "") return logo;
    return fallback;
  };
  // ────────────────────────────────────────────────
  const [shops, setShops] = useState<HotPepperShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<{ id: string; label: string }[]>([]);
  const params = useParams();
  console.log("🔥 params:", params);
  const hotpepperId = params.id as string;
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase.from("groups").select("id,name");
      if (error) {
        console.error("❌ グループ取得失敗:", error);
        return;
      }
      if (data) {
        setGroups(data.map((g) => ({ id: g.id, label: g.name })));
      }
    };
    fetchGroups();
  }, []);

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

    const image_url =
      shop.photo && shop.photo.pc?.l
        ? shop.photo.pc.l
        : shop.image_url && shop.image_url !== ""
          ? shop.image_url
          : "https://placehold.jp/150x150.png";

    // upsert
    const upsertGenre =
      typeof shop.genre === "object"
        ? (shop.genre?.name ?? "ジャンル不明")
        : (shop.genre ?? "ジャンル不明");

    const normalizeBudget = (
      b: BudgetType | string | null | undefined,
    ): string | null => {
      if (b == null) return null; // undefined / null → null
      if (typeof b === "object") return b.name ?? null; // { name: "..."} → name だけ
      return b; // すでに string
    };

    const payload: SharedShopInsert = {
      user_id: user.id,
      hotpepper_id: shop.hotpepper_id,
      group_id: selectedGroupId,
      // 追加 ↓
      name: shop.name ?? "名称不明",
      address: shop.address ?? "",
      shop_url: shop.shop_url ?? "",
      latitude: shop.latitude ?? null,
      longitude: shop.longitude ?? null,
      image_url,
      genre: upsertGenre,
      budget: normalizeBudget(shop.budget),
    };

    const { error: upsertError } = await supabase
      .from("shared_shops")
      .upsert([payload], {
        onConflict: "hotpepper_id,group_id",
      });

    if (upsertError) {
      console.error("シェア保存失敗:", upsertError);
    } else {
      router.push(`/share?group=${selectedGroupId}`);
    }
  };

  useEffect(() => {
    const fetchShop = async () => {
      console.log("🛬 DetailPage param id:", hotpepperId);
      if (shops.length > 0 && shops[0].photo) {
        console.log("APIのphoto部分:", shops[0].photo);
      }

      // UUIDかどうかの簡易チェック（36文字でハイフンが含まれる）
      const isUUID = hotpepperId.length === 36 && hotpepperId.includes("-");

      const query = isUUID
        ? supabase.from("shared_shops").select("*").eq("id", hotpepperId)
        : supabase
            .from("shared_shops")
            .select("*")
            .eq("hotpepper_id", hotpepperId);

      const { data, error } = await query;

      if (error) {
        console.error("Supabaseエラー:", error.message, error);
      }

      if (data && data.length > 0) {
        setShops(data);
        setLoading(false);
        return;
      }

      // 🔍 呼び出し直前に id を確認
      console.log("🛫 id を持って API へ:", hotpepperId);

      // ────────────────────────────────
      // 現在ログイン中のユーザーを取得（shops に user_id を入れるため）
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // ────────────────────────────────

      const hp = await fetch("/api/hotpepper", {
        method: "POST",
        body: JSON.stringify({ id: hotpepperId }),
        headers: { "Content-Type": "application/json" },
      }).then((r) => r.json());

      // 🔍 レスポンス件数を確認
      console.log("🚩 API から戻り:", Array.isArray(hp) ? hp.length : 0);

      console.log("🚩 APIからの生のレスポンス:", hp);

      // hp が配列ではなく単一オブジェクトのケースもあるので安全に配列化
      const shopsArray = Array.isArray(hp) ? hp : hp ? [hp] : [];

      console.log("✨ shopsArray.length:", shopsArray.length, shopsArray);

      if (shopsArray.length > 0) {
        const s = shopsArray[0];

        const genreName = s.genre?.name ?? "ジャンル不明";
        const budgetName = s.budget?.name ?? "情報なし";
        // l が無い／空文字列の場合は m → s → logo_image → フォールバックの順で画像を決定
        const imageUrl = s.photo
          ? pickImageUrl(s.photo, s.logo_image ?? null, fallbackImage)
          : s.image_url && s.image_url !== ""
            ? s.image_url
            : fallbackImage;

        console.log("🔥 hp.results.shop:", shopsArray);
        console.log("✅ APIで見つかったお店情報:", s);

        setShops([
          {
            hotpepper_id: s.id,
            user_id: user?.id ?? "", // <= ★ ここで user?.id を安全に参照
            group_id: selectedGroupId ?? "",
            name: s.name,
            address: s.address,
            genre: genreName,
            budget: budgetName,
            image_url: imageUrl,
            latitude: s.latitude ?? null,
            longitude: s.longitude ?? null,
            shop_url: s.shop_url ?? "",
            photo: s.photo,
          },
        ]);

        console.log("shopsArray:", shopsArray, "length:", shopsArray.length);
      } else {
        console.log("⚠️ 判定elseに入った！", hp);
        console.warn("⚠️ APIでお店が見つかりませんでした！", hotpepperId);
      }
      setLoading(false);
    };

    fetchShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotpepperId]);

  const shop = shops[0];

  const displayGenre =
    typeof shop.genre === "object"
      ? (shop.genre?.name ?? "ジャンル不明")
      : (shop.genre ?? "ジャンル不明");

  console.log("🟢 shop詳細:", shops[0]);
  console.log("APIのshop:", shop); // shop.genreやshop.budgetを確認

  return (
    <>
      <Header />
      <div className="mx-auto max-w-md pt-[0px] pb-[110px]">
        {loading ? (
          <p className="align-items center flex">読み込み中...</p>
        ) : shops.length === 0 ? (
          <p className="align-items center flex">
            お店の情報が見つかりませんでした。
          </p>
        ) : (
          <div>
            {(() => {
              const displayUrl =
                shop.image_url && shop.image_url !== ""
                  ? shop.image_url
                  : pickImageUrl(shop.photo, null, fallbackImage);

              console.log("🖼️ 画像URL (displayUrl):", displayUrl);
              console.log("▶️ shop.image_url:", shop.image_url);
              console.log("▶️ shop.photo:", shop.photo);

              return (
                <Image
                  src={displayUrl}
                  alt={shops[0]?.name ?? "お店の画像"}
                  width={400}
                  height={400}
                  className="aspect-square w-full rounded object-cover"
                />
              );
            })()}
            <div className="mx-4">
              <h2 className="mt-4 text-xl font-semibold">{shops[0].name}</h2>
              <p className="mt-1">
                <span className="font-medium">ジャンル：</span>
                {displayGenre}
              </p>
              <p>
                <span className="font-medium">ディナー予算：</span>
                {(() => {
                  // BudgetType | string | undefined を ⇒ string に変換
                  if (shop.budget == null) return "情報なし";

                  // BudgetType オブジェクトだった場合は name を採用
                  if (typeof shop.budget === "object") {
                    return shop.budget.name ?? "情報なし";
                  }

                  // すでに string 型ならそのまま
                  return shop.budget;
                })()}
              </p>
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
            <button className="flex-1 rounded-lg border border-gray-500 bg-linear-to-b from-white to-gray-100 p-1 py-3 shadow-md">
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
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
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 rounded bg-rose-500 px-4 py-2 text-white shadow"
            >
              シェアする
            </button>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="ml-2 flex-1 rounded bg-gray-200 px-4 py-2 text-gray-700 shadow"
            >
              キャンセル
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
