import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center",
        "bg-gradient-to-t from-neutral-300 via-neutral-200 to-neutral-100"
      )}
    >
      <p>こんにちは！</p>
      <Button>ボタン</Button>
    </main>
  );
}
