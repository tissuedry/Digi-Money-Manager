"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Menu, LogOut, Check, Loader2 } from "lucide-react";

interface HeaderKeuanganProps {
  onOpenSidebar?: () => void;
}

type UserProfile = {
  nama: string;
  email: string;
  role: string;
  divisi?: string | null;
};

function getInitials(name: string) {
  if (!name) return "MZ";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function HeaderKeuangan({ onOpenSidebar }: HeaderKeuanganProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // Default placeholder
  
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch profile details
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch profile");
      })
      .then((data) => {
        if (data.user) setProfile(data.user);
      })
      .catch((err) => console.error("Error fetching profile:", err));

    // Fetch unread notifications count
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          const count = data.notifications.filter((n: any) => !n.dibaca).length;
          setUnreadCount(count);
        }
      })
      .catch((err) => console.error("Error fetching notification count:", err));
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Logout function
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <header className="h-16 border-b border-[#dfd9cc] bg-[#eeeae1] flex items-center justify-between px-8 gap-6 shrink-0 w-full sticky top-0 z-30">
      {/* Tombol menu hamburger di kiri untuk mobile */}
      <div className="flex items-center">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden text-stone-600 p-1.5 hover:bg-stone-200/50 rounded-xl transition cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Tombol Notifikasi Bell */}
        <button className="relative p-1 text-stone-600 hover:text-stone-900 transition cursor-pointer">
          <Bell size={20} className="stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#8c2e2e] text-white text-[9px] flex items-center justify-center rounded-full font-bold shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Blok Panel Identitas Profil Pengguna & Dropdown Container */}
        <div ref={profileRef} className="relative flex items-center gap-3 border-l pl-6 border-[#dfd9cc]">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer select-none py-1 hover:opacity-95 transition"
          >
            {/* Avatar Inisial */}
            <div className="w-8 h-8 rounded-full bg-[#005c3e] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {getInitials(profile?.nama || "Muhammad Zaini")}
            </div>

            {/* Label Teks Nama dan Role Jabatan */}
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-stone-900 leading-none">
                {profile?.nama || "Muhammad Zaini"}
              </span>
              <span className="text-[11px] text-stone-600 mt-1 font-medium">
                {profile?.role || "Tim Keuangan"}
              </span>
            </div>
          </div>

          {/* Profile Dropdown Popover */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-36 w-48 bg-white border border-[#dfd9cc] rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-stone-100 flex flex-col mb-1 select-none">
                <span className="text-[11px] font-bold text-stone-800 truncate">
                  {profile?.nama || "Muhammad Zaini"}
                </span>
                <span className="text-[9px] text-stone-400 truncate mt-0.5">
                  {profile?.email || ""}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
              >
                <LogOut size={14} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}