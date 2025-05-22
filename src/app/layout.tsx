"use client";
import "./globals.css";
import Header from "@/components/ui/header";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/utils/supabase/supabase";

import { M_PLUS_Rounded_1c } from "next/font/google";
import { cn } from "@/lib/utils";

const rounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-rounded",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={rounded.variable}>
      {/* 外側グレー */}
      <body className={cn("min-h-screen bg-gray-100 font-sans antialiased")}>
        <SessionContextProvider supabaseClient={supabase}>
          {/* 真ん中だけ白く＆スマホ幅に制限 */}
          <div className="relative mx-auto min-h-screen max-w-[420px] bg-white shadow-lg">
            <Header className="fixed top-0 left-1/2 z-20 w-full max-w-[420px] -translate-x-1/2" />
            {children}
          </div>
        </SessionContextProvider>
      </body>
    </html>
  );
}
