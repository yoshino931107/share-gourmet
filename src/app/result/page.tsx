import { Suspense } from "react";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab";
import ResultClient from "@/components/ui/ResultClient";

export default function ResultPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gray-50">
      <Header />
      <Suspense
        fallback={
          <div className="p-4 text-center text-gray-400">読み込み中...</div>
        }
      >
        <ResultClient className="flex-1" />
      </Suspense>
      <Tab />
    </div>
  );
}
