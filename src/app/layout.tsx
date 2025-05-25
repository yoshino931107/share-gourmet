"use client";
import "./globals.css";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase/supabase";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJp = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-rounded",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJp.variable}>
      {/* 外側グレー */}
      <body
        className={cn(
          "min-h-screen bg-gray-100 antialiased",
          notoSansJp.variable,
        )}
      >
        <SessionContextProvider supabaseClient={supabase}>
          {/* 真ん中だけ白く＆スマホ幅に制限 */}
          <div className="relative mx-auto min-h-screen max-w-[420px] bg-white shadow-lg">
            {children}
          </div>
        </SessionContextProvider>
      </body>
    </html>
  );
}
