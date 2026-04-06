"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Magic link lands here: /portal/verify?token=xxx
 * Redirects to /login which handles verification via useAuth hook.
 */
export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      router.replace(`/login?token=${token}`);
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#86868b]">Verifying your link…</p>
      </div>
    </div>
  );
}
