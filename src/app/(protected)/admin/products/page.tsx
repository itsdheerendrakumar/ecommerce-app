import { Suspense } from "react";
import AdminProductsClient from "./AdminProductsClient";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminProductsClient />
    </Suspense>
  );
}
