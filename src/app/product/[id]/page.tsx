import { Suspense } from "react";
import ProductDetails from "@/app/components/ProductDetails";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProductDetails />
    </Suspense>
  );
}
