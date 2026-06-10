"use client";

import React from "react";
import { Plus, History, X, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isSidebarOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isSidebarOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition ${
      isActive 
        ? "bg-white text-stone-900 font-bold shadow-sm" 
        : "text-stone-600 hover:bg-[#EAE8E0] hover:text-stone-900 font-medium"
    }`;
  };

  return (
    <>
      {/* OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-200" 
          onClick={onClose} 
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#f5f4ef] border-r border-stone-200 flex flex-col shrink-0 h-screen transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex lg:flex-col
      `}>
        {/* Logo and close button */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-stone-200/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-stone-800 rounded flex items-center justify-center bg-white shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M3 3l18 18M21 3L3 21"></path>
              </svg>
            </div>
            <span className="font-bold text-stone-800 text-[14px]">Digi Money Manager</span>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-stone-200/50 rounded-lg text-stone-500 hover:text-stone-800 transition cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav className="px-4 py-4 space-y-1 flex-1 overflow-y-auto">
          <Link href="/karyawan" onClick={onClose} className={getLinkClass("/karyawan")}>
            <LayoutDashboard size={18} /> Beranda
          </Link>
          <Link href="/karyawan/reimbursement" onClick={onClose} className={getLinkClass("/karyawan/reimbursement")}>
            <Plus size={18} /> Ajukan Reimbursement
          </Link>
          <Link href="/karyawan/riwayat-pengajuan" onClick={onClose} className={getLinkClass("/karyawan/riwayat-pengajuan")}>
            <History size={18} /> Riwayat Pengajuan
          </Link>
        </nav>
      </aside>
    </>
  );
}