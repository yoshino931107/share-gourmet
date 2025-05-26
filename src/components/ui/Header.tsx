"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type HeaderProps = React.HTMLAttributes<HTMLElement>;

export default function Header({ className, ...props }: HeaderProps) {
  return (
    <header
      {...props}
      className={cn(
        "top-0 z-20 w-full max-w-[420px] border-b bg-[url('/header_back.jpg')] bg-cover bg-center bg-no-repeat p-3 backdrop-blur",
        className,
      )}
    >
      {/* 半透明の白レイヤー */}
      <div className="pointer-events-none absolute inset-0 bg-white/78"></div>
      {/* flex: ロゴとリンクを左右に */}
      <div className="relative z-10 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/search">
          <Image
            src="/share_gourmet_logo.svg"
            alt="Logo"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>
        {/* ログイン・新規登録リンク */}
        <div className="mr-1 ml-4 flex gap-2 text-orange-950 opacity-60">
          <Link href="/auth/login" className="mt-1 text-sm font-semibold">
            ログイン
          </Link>
          <span className="">|</span>
          <Link href="/auth/signup" className="mt-1 text-sm font-semibold">
            新規登録
          </Link>
        </div>
      </div>
    </header>
  );
}
