"use client";
import { supabase } from "@/utils/supabase/supabase";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab";

export default function MyPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login"); // ログイン画面やトップページなどへ
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto mt-5 max-w-xs rounded-lg border bg-white p-6 shadow">
          <h2 className="mt-3 mb-5 text-center text-2xl font-bold">
            マイページ
          </h2>

          <div className="flex flex-col gap-8">
            <button className="mt-3 rounded-lg border border-gray-200 bg-white py-4 text-lg font-semibold shadow">
              設定
            </button>
            <button className="rounded-lg border border-gray-200 bg-white py-4 text-lg font-semibold shadow">
              個人ページ（保存したお店）
            </button>
            <button
              className="rounded-lg border border-gray-200 bg-white py-4 text-lg font-semibold shadow"
              onClick={() => router.push("/group_setting")}
            >
              グループ管理
            </button>
            <button
              onClick={handleLogout}
              className="mb-4 rounded-lg border border-gray-200 bg-white py-4 text-lg font-semibold shadow"
            >
              ログアウト
            </button>
          </div>
        </div>
      </main>

      {/* フッタータブ */}
      <div className="fixed inset-x-0 bottom-0 z-10">
        <Tab />
      </div>
    </div>
  );
}
