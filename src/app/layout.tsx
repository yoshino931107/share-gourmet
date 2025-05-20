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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Header className="fixed top-0 right-0 left-0 z-20" />
      <html lang="ja" className={rounded.variable}>
        <body className={cn("min-h-screen bg-white font-sans antialiased")}>
          {children}
        </body>
      </html>
    </SessionContextProvider>
  );
}
