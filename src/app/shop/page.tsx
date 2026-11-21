import { Suspense } from "react";
import Shop from "@/app/components/Shop";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Shop />
    </Suspense>
  );
}
