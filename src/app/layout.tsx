import "./globals.css";

import SessionProvider from "@/components/SessionProvider";
import { Noto_Sans_JP } from "next/font/google";
import { cn } from "@/lib/utils";

const notoSansJp = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-rounded",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJp.variable}>
      <body
        className={cn(
          "min-h-screen bg-gray-100 antialiased",
          notoSansJp.variable,
        )}
      >
        <SessionProvider>
          <div className="relative mx-auto min-h-screen max-w-[420px] bg-white shadow-lg">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
