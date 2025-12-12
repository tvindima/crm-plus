'use client';

import Image from "next/image";
import { BackofficeLayout } from "../../../../backoffice/components/BackofficeLayout";
import { ToastProvider } from "../../../../backoffice/components/ToastProvider";

export default function ForbiddenPage() {
  return (
    <ToastProvider>
      <BackofficeLayout title="403">
        <Image src="/renders/38.png" alt="Acesso negado render" width={1920} height={1080} className="w-full rounded-2xl" />
      </BackofficeLayout>
    </ToastProvider>
  );
}
