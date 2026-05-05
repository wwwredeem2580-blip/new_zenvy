import { Suspense } from 'react';
import ApplicationForm from "@/components/ApplicationForm";

export default function ApplyRoute() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ApplicationForm />
    </Suspense>
  );
}
