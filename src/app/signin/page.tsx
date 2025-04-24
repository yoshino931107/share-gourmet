import type { NextPage } from "next";

import { cn } from "@/lib/utils";

const Page: NextPage = () => {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center",
        "bg-gradient-to-t from-neutral-300 via-neutral-200 to-neutral-100"
      )}
    >
      ログインフォーム
    </div>
  );
};

export default Page;
