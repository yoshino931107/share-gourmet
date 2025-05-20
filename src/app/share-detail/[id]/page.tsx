"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import Tab from "@/components/ui/tab";

export default function ShareDetailPage() {
  const params = useParams();
  const id = params?.id;
  const supabase = createBrowserSupabaseClient();

  console.log("params.id", id);

  const [shop, setShop] = useState<any>(null);
  const [memoInput, setMemoInput] = useState("");
  const [memos, setMemos] = useState<any[]>([]);
  const [loadingMemos, setLoadingMemos] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchShop = async () => {
      // id が UUID 形式かどうかで比較カラムを切り替える
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          String(id),
        );

      // UUID なら必ず 1 件、Hotpepper ID は複数行の可能性があるので先頭 1 件だけ取得
      const query = supabase
        .from("shared_shops")
        .select("*")
        .eq(isUUID ? "id" : "hotpepper_id", id);

      const { data, error } = isUUID
        ? await query.single() // 1 件限定
        : await query.limit(1).single(); // 複数ヒット時は先頭 1 件

      if (error) {
        console.error("エラー:", error);
      } else {
        setShop(data);

        // --- Fetch memos for this shop ---
        if (data?.id) {
          setLoadingMemos(true);
          const { data: memosData, error: memosError } = await supabase
            .from("memos")
            .select("*")
            .eq("shop_id", data.id)
            .order("created_at", { ascending: false });
          if (memosError) {
            console.error("メモ取得エラー:", memosError);
          } else {
            setMemos(memosData || []);
          }
          setLoadingMemos(false);
        }
      }
    };

    fetchShop();
  }, [id, supabase]);

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
      <div className="p-4">
        <h1 className="text-xl font-bold">お店の詳細ページ</h1>
        {shop ? (
          <div className="mt-4 space-y-2">
            <img
              src={shop.image_url}
              alt={shop.name}
              className="aspect-square w-full rounded object-cover"
            />
            <h2 className="text-lg font-semibold">{shop.name}</h2>
            <p className="text-sm text-gray-500">
              {shop.genre ?? "ジャンル不明"}
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
                className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={handleSaveMemo}
                disabled={!memoInput.trim() || !shop}
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <p>読み込み中...</p>
        )}
      </div>
      <Tab />
    </>
  );

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
