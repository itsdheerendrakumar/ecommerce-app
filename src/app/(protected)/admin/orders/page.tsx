import { Suspense } from "react";
import AdminOrdersClient from "./AdminOrdersClient";

export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersClient />
    </Suspense>
  );
}
