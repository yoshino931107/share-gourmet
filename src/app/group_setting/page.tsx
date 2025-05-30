"use client";
import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab";

import type { Database } from "@/utils/supabase/database.types";
type GroupRow = Pick<
  Database["public"]["Tables"]["groups"]["Row"],
  "id" | "name"
>;
import { supabase } from "@/utils/supabase/supabase";

/** グループ設定ページコンポーネント */
export default function GroupSettingPage() {
  /** 状態管理フック: 新規グループ作成ダイアログの開閉状態 */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  /** 状態管理フック: 新規グループ名 */
  const [groupName, setGroupName] = useState("");
  /** 状態管理フック: 招待ダイアログの開閉状態 */
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  /** 状態管理フック: グループ一覧 */
  const [groups, setGroups] = useState<GroupRow[]>([]);
  /** 状態管理フック: 選択されたグループID */
  const [selectedGroupId, setSelectedGroupId] = useState("");
  /** 状態管理フック: 生成された招待URL */
  const [inviteUrl, setInviteUrl] = useState("");

  /** 新規グループ作成処理 */
  async function handleCreateGroup() {
    if (!groupName) return;
    // ログインユーザー情報の取得
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインユーザー情報が取得できませんでした");
      return;
    }
    // SupabaseにグループをINSERT
    const { error } = await supabase.from("groups").insert([
      {
        name: groupName,
        created_by: user.id, // カラム名がcreated_byの場合
        user_id: user.id, // user_idにも同じ値を入れる
      },
    ]);
    if (error) {
      alert("グループ作成に失敗しました: " + error.message);
      return;
    }
    setGroupName("");
    setIsDialogOpen(false);
    alert("グループを作成しました！");
  }

  /** グループ一覧を取得する副作用 */
  useEffect(() => {
    async function fetchGroups() {
      if (!isInviteDialogOpen) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("groups")
        .select("id, name")
        .eq("created_by", user.id);
      if (!error && data) setGroups(data);
    }
    fetchGroups();
  }, [isInviteDialogOpen]);

  /** グループ招待URL発行処理 */
  function handleInviteUrl() {
    if (!selectedGroupId) return;
    const url = `https://${window.location.host}/join?group_id=${selectedGroupId}`;
    setInviteUrl(url);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto mt-5 max-w-xs rounded-lg border bg-white p-6 shadow">
          <h2 className="mt-3 mb-5 text-center text-2xl font-bold">
            グループ管理ページ
          </h2>
          <div className="flex flex-col gap-8">
            {/* UI: 新規グループ作成ボタン */}
            <button
              className="mt-3 rounded-lg border border-gray-200 bg-white py-4 text-lg font-semibold shadow"
              onClick={() => setIsDialogOpen(true)}
            >
              新規グループ作成
            </button>
            {/* UI: 既存グループ招待ボタン */}
            <button
              className="mb-4 rounded-lg border border-gray-200 bg-white py-4 text-lg font-semibold shadow"
              onClick={() => setIsInviteDialogOpen(true)}
            >
              既存グループ招待
            </button>
          </div>
        </div>
      </main>

      {/* UI: 新規グループ作成ダイアログ */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-center text-lg font-bold">
              新規グループ作成
            </h3>
            <input
              type="text"
              placeholder="グループ名を入力"
              className="mb-4 w-full rounded border px-3 py-2"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                className="w-1/2 rounded bg-emerald-500 px-4 py-2 font-bold text-white"
                disabled={!groupName}
              >
                グループ作成
              </button>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="w-1/2 rounded bg-gray-200 px-4 py-2 text-gray-700"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
      {/* UI: 招待ダイアログ */}
      {isInviteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-center text-lg font-bold">
              グループ招待URL発行
            </h3>
            <select
              className="mb-4 w-full rounded border px-3 py-2"
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                setInviteUrl(""); // 選択変更時はURLクリア
              }}
            >
              <option value="">グループを選択</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <div className="mb-4 flex gap-2">
              <button
                onClick={handleInviteUrl}
                className="w-1/2 rounded bg-emerald-500 px-4 py-2 font-bold text-white"
                disabled={!selectedGroupId}
              >
                招待URL発行
              </button>
              <button
                onClick={() => setIsInviteDialogOpen(false)}
                className="w-1/2 rounded bg-gray-200 px-4 py-2 text-gray-700"
              >
                キャンセル
              </button>
            </div>
            {inviteUrl && (
              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  readOnly
                  className="w-full rounded border px-3 py-2 text-xs"
                  value={inviteUrl}
                />
                <button
                  className="rounded bg-pink-500 px-4 py-2 text-sm font-bold text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                    alert("コピーしました！");
                  }}
                >
                  コピー
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UI: フッタータブ */}
      <div className="fixed inset-x-0 bottom-0 z-10">
        <Tab />
      </div>
    </div>
  );
}
