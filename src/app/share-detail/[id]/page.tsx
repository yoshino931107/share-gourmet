"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab";
import Image from "next/image";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";

/**
 * HotPepperやデータベースから取得する店舗情報の構造を表すインターフェース
 */
interface HotPepperShop {
  id: string;
  hotpepper_id: string;
  name: string;
  address: string;
  genre?: string;
  budget?: string;
  station?: string;
  image_url?: string;
  content?: string;
  created_at?: string;
  photo?: {
    pc?: { l?: string; m?: string; s?: string };
    mobile?: { l?: string; s?: string };
  };
}

/**
 * ShareDetailPageコンポーネントは特定の店舗の詳細情報を表示します。
 * 店舗の画像、ジャンル、予算、最寄駅、住所のほか、
 * その店舗に関連するメモの閲覧、追加、削除が可能です。
 * URLパラメータとクエリのtypeに応じて共有店舗または個人店舗のデータを取得します。
 *
 * @returns JSX.Element - 店舗の詳細画面をレンダリングします。
 */
export default function ShareDetailPage() {
  const params = useParams();
  const id = params?.id;
  const supabase = createBrowserSupabaseClient();

  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const tableName = type === "private" ? "private_shops" : "shared_shops";

  const [shop, setShop] = useState<HotPepperShop | null>(null);
  const [memoInput, setMemoInput] = useState("");
  const [memos, setMemos] = useState<HotPepperShop[]>([]);
  const [loadingMemos] = useState(true);

  /**
   * このuseEffectはコンポーネントのマウント時およびidやtableNameが変わった時に
   * 店舗の詳細情報を取得します。
   * まずshared_shopsテーブルから検索し、見つからなければprivate_shopsテーブルを検索します。
   */
  useEffect(() => {
    if (!id) return;

    /**
     * Supabaseデータベースから店舗データを取得する非同期関数です。
     * IDがUUIDかhotpepper_idかを判定し、それに応じてクエリを実行します。
     * まずshared_shopsテーブルを検索し、見つからなければprivate_shopsテーブルを検索します。
     * 取得後、店舗データをstateにセットします。
     */
    const fetchShop = async () => {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          String(id),
        );
      let shopData = null;

      // ① shared_shopsから検索
      let query = supabase
        .from("shared_shops")
        .select("*")
        .eq(isUUID ? "id" : "hotpepper_id", id);
      let res;
      if (isUUID) {
        res = await query.single();
        shopData = res.data;
      } else {
        res = await query.limit(1);
        shopData = res.data?.[0] ?? null;
      }

      // ② 見つからなければprivate_shopsを検索
      if (!shopData) {
        query = supabase
          .from("private_shops")
          .select("*")
          .eq(isUUID ? "id" : "hotpepper_id", id);
        if (isUUID) {
          res = await query.single();
          shopData = res.data;
        } else {
          res = await query.limit(1);
          shopData = res.data?.[0] ?? null;
        }
      }

      // 最終セット
      if (shopData) {
        setShop(shopData);
        // ここでメモ取得もセットするなら追加
      } else {
        setShop(null);
        // ここで「見つかりません」的な処理もOK
      }
    };

    fetchShop();
  }, [id, supabase, tableName]);

  /**
   * メモを削除する処理です。
   * 削除前にユーザーに確認を取り、削除成功後はメモ一覧を再取得して更新します。
   *
   * @param memoId - 削除対象のメモID
   */
  async function handleDeleteMemo(memoId: string) {
    if (!window.confirm("本当にこのメモを削除しますか？")) return;
    const { error } = await supabase.from("memos").delete().eq("id", memoId);
    if (error) {
      alert("削除に失敗しました🥲");
      return;
    }
    // 削除後の一覧再取得
    if (shop?.id) {
      const { data: memosData } = await supabase
        .from("memos")
        .select("*")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false });
      setMemos(memosData || []);
    }
  }

  return (
    <>
      <Header />
      <div className="p-4">
        <h1 className="text-xl font-bold">お店の詳細ページ</h1>
        {shop ? (
          <div className="mt-4 space-y-2">
            <Image
              src={shop.image_url ?? "/noimage.png"}
              alt={shop.name}
              width={400}
              height={400}
              className="aspect-square w-full rounded object-cover"
              unoptimized
              priority
            />
            <h2 className="text-lg font-semibold">{shop.name}</h2>
            <p className="text-sm text-gray-500">
              ジャンル：{shop.genre ?? "ジャンル不明"}
            </p>
            <p className="text-sm text-gray-500">
              ディナー予算：{shop.budget ?? "情報なし"}
            </p>
            <p className="text-sm text-gray-500">
              最寄駅：{shop.station ?? "情報なし"}
            </p>
            <p className="text-sm text-gray-600">{shop.address}</p>
            <div className="mt-6">
              <h3 className="text-md mb-2 font-semibold">MEMO📝</h3>
              {loadingMemos ? (
                <p className="mb-2 text-sm text-gray-400">読み込み中...</p>
              ) : (
                <ul className="mb-2 space-y-2">
                  {memos.map((memo) => (
                    <li
                      key={memo.id}
                      className="relative rounded bg-gray-100 px-3 py-2 text-sm text-gray-800"
                    >
                      {memo.content}
                      <span className="mt-1 block text-xs text-gray-400">
                        {memo.created_at
                          ? new Date(memo.created_at).toLocaleString("ja-JP")
                          : ""}
                      </span>
                      <button
                        className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteMemo(memo.id)}
                        aria-label="削除"
                      >
                        削除
                      </button>
                    </li>
                  ))}
                  {memos.length === 0 && (
                    <li className="text-sm text-gray-400">
                      メモはまだありません
                    </li>
                  )}
                </ul>
              )}
              <textarea
                placeholder="気になるメニュー、優先度etc..."
                className="w-full resize-none rounded border border-gray-300 p-2 text-sm"
                rows={4}
                value={memoInput}
                onChange={(e) => setMemoInput(e.target.value)}
              />
              <button
                className="mt-2 mb-10 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={handleSaveMemo}
                disabled={!memoInput.trim() || !shop}
              >
                保存
              </button>
              <div className="mx-auto mb-25 flex w-full max-w-lg justify-center">
                {shop?.hotpepper_id ? (
                  <a
                    href={`https://www.hotpepper.jp/str${shop.hotpepper_id}/yoyaku/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full max-w-[360px] flex-row items-center justify-center gap-2 rounded-lg border border-gray-500 bg-gradient-to-b from-white to-gray-100 py-3 shadow-md transition hover:bg-sky-50"
                    style={{ minWidth: 240 }}
                  >
                    <CalendarDaysIcon className="h-6 w-6 text-sky-600" />
                    <span className="text-lg font-semibold text-gray-800">
                      予約する（HOT PEPPER予約）
                    </span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex w-full max-w-[360px] flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 py-3 text-lg font-semibold text-gray-400 opacity-50"
                    style={{ minWidth: 240 }}
                  >
                    <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                    予約する
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>読み込み中...</p>
        )}
      </div>

      <Tab />
    </>
  );

  /**
   * 現在の店舗に新しいメモを保存する処理です。
   * データベースに挿入後、メモ一覧を再取得して更新します。
   */
  async function handleSaveMemo() {
    if (!memoInput.trim() || !shop?.id) return;
    const { error } = await supabase
      .from("memos")
      .insert([{ shop_id: shop.id, content: memoInput }]);
    if (error) {
      alert("メモの保存に失敗しました🥲");
      return;
    }
    setMemoInput("");
    // 追加したメモをすぐ反映
    const { data: memosData } = await supabase
      .from("memos")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });
    setMemos(memosData || []);
  }
}
