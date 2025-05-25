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
      <Link href="/search">
        <Image
          src="/share_gourmet_logo.svg"
          alt="Logo"
          width={120}
          height={32}
          className="relative z-10 h-8 w-auto"
          priority
        />
      </Link>
      {/* ナビゲーション入れる？ */}
    </header>
  );
}
