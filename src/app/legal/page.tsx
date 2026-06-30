"use client";

import { LegalPage } from "@/components/legal/legal-page";
import { useRouter } from "next/navigation";

export default function LegalRoute() {
  const router = useRouter();
  return <LegalPage onBack={() => router.push("/")} />;
}
