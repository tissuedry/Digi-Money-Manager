// components/Header.tsx
import React from "react";
import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-end px-8 gap-6 shrink-0">
      <button className="relative p-1 text-zinc-500 hover:text-zinc-800 transition">
        <Bell size={20} />
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">3</span>
      </button>
      
      <div className="flex items-center gap-3 border-l pl-6 border-zinc-200">
        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
          MZ
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium text-zinc-900 leading-none">Muhammad Zaini</span>
          <span className="text-xs text-zinc-500 mt-1">Tim Keuangan</span>
        </div>
      </div>
    </header>
  );
}