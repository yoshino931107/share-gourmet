"use client";
import "./globals.css";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase/supabase";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* 外側グレー */}
      <body className={cn("min-h-screen bg-gray-100 font-sans antialiased")}>
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
