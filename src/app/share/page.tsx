import { Suspense } from "react";
import ShareClient from "@/components/ui/ShareClient";

export default function SharePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareClient />
    </Suspense>
  );
}
