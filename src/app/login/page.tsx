import Link from "next/link"
import { ClientPortal } from "@/components/ClientPortal"

export const metadata = {
  title: "Client Portal — Label Origin",
  description: "Sign in to your Label Origin client portal.",
}

export default function LoginPage() {
  return (
    <>
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/50">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
          <Link href="/" aria-label="Label Origin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Label Origin" className="h-7 w-auto" />
          </Link>
          <Link href="/" className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">
            ← Back to site
          </Link>
        </div>
      </nav>

      <main className="min-h-screen bg-[#f5f5f7] pt-12">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-16">
          <ClientPortal />
        </div>
      </main>
    </>
  )
}
