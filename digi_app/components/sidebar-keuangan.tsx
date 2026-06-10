"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, BookOpen, BarChart3, Settings, X } from "lucide-react";

interface SidebarKeuanganProps {
  isSidebarOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarKeuangan({ isSidebarOpen, onClose }: SidebarKeuanganProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Pencairan",
      href: "/keuangan/pencairan",
      icon: Wallet,
      hasBadge: false,
    },
    {
      name: "Jurnal Akuntansi",
      href: "/keuangan/jurnal",
      icon: BookOpen,
      hasBadge: false,
    },
    {
      name: "Chart of Accounts",
      href: "/keuangan/chart-of-account",
      icon: Settings,
      hasBadge: false,
    },
  ];

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
        fixed inset-y-0 left-0 z-50 w-64 bg-[#f4f1eb] border-r border-stone-200 flex flex-col justify-between py-6 px-4 shrink-0 h-screen transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex lg:flex-col
      `}>
        <div>
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-stone-400 relative flex items-center justify-center shrink-0 bg-white/20">
                <div className="absolute w-full h-px bg-stone-400 rotate-45"></div>
                <div className="absolute w-full h-px bg-stone-400 -rotate-45"></div>
              </div>
              <span className="font-semibold text-stone-900 text-base tracking-tight">
                Digi Money Manager
              </span>
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

          <div className="border-b border-stone-200/60 mx-2 mb-6"></div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 rounded-xl text-sm transition cursor-pointer ${
                    isActive
                      ? "py-3 font-semibold bg-white text-stone-900 shadow-sm border border-stone-200/30"
                      : "py-2.5 font-medium text-stone-800 hover:bg-stone-200/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon 
                      size={20} 
                      className={isActive ? "text-[#005c3e] stroke-[2.25]" : "text-stone-700 stroke-[1.75]"} 
                    />
                    <span>{item.name}</span>
                  </div>
                  
                  {item.hasBadge && (
                    <span className="bg-[#005c3e] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      3
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
