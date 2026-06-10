"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, LogOut } from "lucide-react";

interface HeaderPMProps {
  onOpenSidebar: () => void;
}

type UserProfile = {
  nama: string;
  email: string;
  role: string;
  divisi?: string | null;
};

function getInitials(name: string) {
  if (!name) return "MAA";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function HeaderPM({ onOpenSidebar }: HeaderPMProps) {
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
    <header className="bg-background backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer" onClick={onOpenSidebar}>
          <Menu size={22} />
        </button>
        <div className="w-7 h-7 border border-slate-300 rounded flex items-center justify-center text-slate-400 text-xs font-mono select-none">✕</div>
      </div>

      <div className="flex items-center gap-3">
        {/* Tombol Notifikasi Bell */}
        <button className="relative p-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition text-slate-700 cursor-pointer">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-700 text-white font-extrabold text-[10px] min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border border-white select-none">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profil User & Dropdown Container */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 bg-white border border-slate-300 rounded-lg px-3.5 py-1.5 cursor-pointer hover:bg-slate-50 transition select-none"
          >
            {/* Avatar Inisial */}
            <div className="w-8 h-8 bg-red-50 border border-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-[11px] tracking-wider shrink-0 shadow-inner">
              {getInitials(profile?.nama || "Muhammad Alvin Ababil")}
            </div>
            
            {/* Label Teks Nama dan Role Jabatan */}
            <div className="text-left hidden sm:block max-w-[150px]">
              <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">
                {profile?.nama || "Muhammad Alvin Ababil"}
              </h4>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                {profile?.role || "Project Manager"}
              </p>
            </div>
          </div>

          {/* Profile Dropdown Popover */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex flex-col mb-1 select-none">
                <span className="text-[11px] font-bold text-slate-800 truncate">
                  {profile?.nama || "Muhammad Alvin Ababil"}
                </span>
                <span className="text-[9px] text-slate-400 truncate mt-0.5">
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
