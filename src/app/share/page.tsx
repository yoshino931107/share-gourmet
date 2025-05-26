import { Suspense } from "react";
import ShareClient from "@/components/ui/ShareClient";

export default function SharePage() {
  return (
    <Suspense fallback={<div className="mt-70">Loading...✍️</div>}>
      <ShareClient />
    </Suspense>
  );
}
