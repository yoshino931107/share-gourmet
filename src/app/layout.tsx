import type { Metadata } from "next";
import "./globals.css";

import { M_PLUS_Rounded_1c } from "next/font/google";
import { cn } from "@/lib/utils";

const rounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-rounded",
});

export const metadata: Metadata = {
  title: "シェアグル",
  description: "気になるグルメ、シェア＆ストック！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={rounded.variable}>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          "flex flex-col items-center justify-center",
          "bg-gradient-to-t from-neutral-300 via-neutral-200 to-neutral-100",
        )}
      >
        {children}
      </body>
    </html>
  );
}
