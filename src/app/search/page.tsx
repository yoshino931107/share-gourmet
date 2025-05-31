import { Suspense } from "react";
import SearchClient from "@/components/ui/SearchClient";

/**
 * /search ページ (サーバーコンポーネント)
 * SearchClient は `"use client"` で useSearchParams() を利用するので
 * Suspense でラップしてプリレンダー時のエラーを防ぐ。
 */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
