import AdminPage from "@/components/AdminPage";
import { Suspense } from "react";

export default function AdminRoute() {
  return (
    <Suspense fallback={null}>
      <AdminPage />
    </Suspense>
  );
}
