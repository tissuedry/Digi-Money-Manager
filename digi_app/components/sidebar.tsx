import React from "react";
import Link from "next/link"; // 1. Import Link dari Next.js
import { LayoutDashboard, Wallet, BookOpen, BarChart3, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-50 border-r border-zinc-200 flex flex-col justify-between py-6 px-4 shrink-0 h-full">
      <div>
        {/* Logo Brand */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 border-2 border-zinc-400 rotate-45 flex items-center justify-center font-bold text-xs text-zinc-500">
            X
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight">Digi Money Manager</span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {/* 2. Ganti seluruh tag <a> menjadi <Link> dan arahkan href ke rute yang benar */}
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-zinc-200/60 transition">
            <LayoutDashboard size={18} />
            <span>Beranda Keuangan</span>
          </Link>
          
          <Link href="/pencairan" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700">
            <div className="flex items-center gap-3">
              <Wallet size={18} />
              <span>Pencairan</span>
            </div>
            <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">2</span>
          </Link>
          
          <Link href="/jurnal" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-zinc-200/60 transition">
            <BookOpen size={18} />
            <span>Jurnal Akuntansi</span>
          </Link>
          
          <Link href="/coa" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-zinc-200/60 transition">
            <Settings size={18} />
            <span>Chart of Accounts</span>
          </Link>
          
          <Link href="/laporan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-zinc-200/60 transition">
            <BarChart3 size={18} />
            <span>Laporan Keuangan</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}