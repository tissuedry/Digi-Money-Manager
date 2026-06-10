"use client";

import React, { useState, useEffect } from "react";
import { Plus, History, ArrowRight, Clock, Wallet, CheckCircle2, AlertTriangle, Sparkles, FileText, XCircle, Info } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/sidebar-karyawan";
import Header from "@/components/header-karyawan";

type Submission = {
  dbId: string;
  id: string;
  merchant: string;
  project: string;
  pos: string;
  date: string;
  amount: number;
  status: "SUBMITTED" | "APPROVED_BY_PM" | "APPROVED" | "REJECTED";
};

function formatTanggal(iso: string) {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length < 3) return iso;
  const [y, m, d] = parts;
  const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const mIdx = parseInt(m) - 1;
  return `${parseInt(d)} ${bulan[mIdx] || m} ${y}`;
}

const getStatusLabel = (status: Submission["status"]) => {
  switch (status) {
    case "SUBMITTED":
      return "Menunggu PM";
    case "APPROVED_BY_PM":
      return "Verifikasi Keuangan";
    case "APPROVED":
      return "Dicairkan";
    case "REJECTED":
      return "Ditolak";
    default:
      return status;
  }
};

const getStatusBadgeClass = (status: Submission["status"]) => {
  switch (status) {
    case "SUBMITTED":
      return "bg-[#fdf3e6] text-[#b46b2b] border border-orange-200/50"; // Beige/Orange
    case "APPROVED_BY_PM":
      return "bg-[#e1f5fe] text-[#0277bd] border border-blue-200/50"; // Blue
    case "APPROVED":
      return "bg-[#e2f1eb] text-[#117a5b] border border-emerald-200/50"; // Green
    case "REJECTED":
      return "bg-[#fee2e2] text-[#be123c] border border-red-200/50"; // Red
    default:
      return "bg-stone-100 text-stone-600";
  }
};

export default function KaryawanDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Statistics
  const [stats, setStats] = useState({
    activeCount: 0,
    pendingNominal: 0,
    pendingCount: 0,
    approvedNominal: 0,
    approvedCount: 0,
  });

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/reimbursements")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch reimbursements");
      })
      .then((data) => {
        if (data.reimbursements) {
          const list = data.reimbursements;

          // Map raw data to Submission format
          const mapped: Submission[] = list.map((r: any) => ({
            dbId: r.id,
            id: r.id.substring(0, 8).toUpperCase(),
            merchant: r.ocrData?.merchant || "N/A",
            project: r.proyek?.nama || "N/A",
            pos: r.posAnggaran?.deskripsi || "N/A",
            date: r.ocrData?.tanggal ? formatTanggal(r.ocrData.tanggal) : "N/A",
            amount: Number(r.nominal),
            status: r.status,
          }));

          setSubmissions(mapped);

          // Calculate statistics
          const activeSubmissions = list.filter(
            (r: any) => r.status === "SUBMITTED" || r.status === "APPROVED_BY_PM"
          );
          const approvedSubmissions = list.filter(
            (r: any) => r.status === "APPROVED"
          );

          const pendingSum = activeSubmissions.reduce(
            (sum: number, r: any) => sum + Number(r.nominal),
            0
          );
          const approvedSum = approvedSubmissions.reduce(
            (sum: number, r: any) => sum + Number(r.nominal),
            0
          );

          setStats({
            activeCount: activeSubmissions.length,
            pendingNominal: pendingSum,
            pendingCount: activeSubmissions.length,
            approvedNominal: approvedSum,
            approvedCount: approvedSubmissions.length,
          });
        }
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-[#f9f8f4] font-sans text-stone-800">
      <Sidebar isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Header Banner Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm">
            <div>
              <h1 className="text-[24px] font-extrabold text-stone-900 leading-tight">
                Beranda Karyawan
              </h1>
              <p className="text-[13px] sm:text-[14px] text-stone-500 mt-1.5 leading-relaxed font-medium">
                Pantau status pengajuan reimbursement-mu dan ajukan klaim baru dalam hitungan detik.
              </p>
            </div>
            <Link
              href="/karyawan/reimbursement"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#008f5d] hover:bg-[#007a4f] text-white text-[13px] font-bold rounded-xl transition shadow-sm hover:shadow shrink-0"
            >
              <Plus size={16} strokeWidth={2.5} /> Ajukan Reimbursement
            </Link>
          </div>

          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Card 1: Pengajuan Aktif */}
            <div className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex items-start justify-between relative overflow-hidden">
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Pengajuan Aktif
                </p>
                <h3 className="text-3xl font-extrabold text-stone-900 leading-none">
                  {isLoading ? "..." : stats.activeCount}
                </h3>
                <p className="text-[12px] text-stone-500 font-medium">
                  menunggu approval
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                <Clock size={20} />
              </div>
            </div>

            {/* Stat Card 2: Total Menunggu Cair */}
            <div className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex items-start justify-between relative overflow-hidden">
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Total Menunggu Cair
                </p>
                <h3 className="text-3xl font-extrabold text-stone-900 leading-none">
                  {isLoading ? "..." : `Rp ${stats.pendingNominal.toLocaleString("id-ID")}`}
                </h3>
                <p className="text-[12px] text-stone-500 font-medium">
                  {isLoading ? "..." : `${stats.pendingCount} pengajuan`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                <Wallet size={20} />
              </div>
            </div>

            {/* Stat Card 3: Total Dicairkan */}
            <div className="bg-white border border-stone-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex items-start justify-between relative overflow-hidden">
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Total Dicairkan ({currentYear})
                </p>
                <h3 className="text-3xl font-extrabold text-stone-900 leading-none">
                  {isLoading ? "..." : `Rp ${stats.approvedNominal.toLocaleString("id-ID")}`}
                </h3>
                <p className="text-[12px] text-stone-500 font-medium">
                  {isLoading ? "..." : `${stats.approvedCount} pengajuan`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {/* Bottom Columns Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3 width on desktop): Pengajuan Terakhir */}
            <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[16px] font-extrabold text-stone-900">
                    Pengajuan Terakhir
                  </h3>
                  <Link
                    href="/karyawan/riwayat-pengajuan"
                    className="inline-flex items-center gap-1 text-[12px] font-bold text-stone-500 hover:text-stone-850 transition"
                  >
                    Lihat semua <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-12 text-[13px] text-stone-450 font-medium">
                      Memuat pengajuan terakhir...
                    </div>
                  ) : submissions.length > 0 ? (
                    submissions.slice(0, 5).map((item) => (
                      <div
                        key={item.dbId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-stone-150/60 rounded-xl hover:bg-stone-50/55 transition gap-4"
                      >
                        {/* Merchant, ID, Proyek */}
                        <div className="flex gap-3 items-start min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 shrink-0 border border-stone-200/60">
                            <FileText size={16} />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-[13px] font-bold text-stone-800 truncate">
                              {item.merchant}
                            </h4>
                            <p className="text-[11px] text-stone-400 font-medium truncate">
                              RB-{item.id} · {item.project} · {item.date}
                            </p>
                          </div>
                        </div>

                        {/* Amount & Status Badge */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <span className="text-[13px] font-bold text-stone-800">
                            Rp {item.amount.toLocaleString("id-ID")}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center shrink-0 ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[13px] text-stone-450 font-medium">
                      Belum ada riwayat pengajuan reimbursement.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (1/3 width on desktop): Tips Scan/Graphic Element */}
            <div className="bg-[#003d29] text-white border border-transparent rounded-2xl shadow-sm p-6 flex flex-col justify-between relative overflow-hidden shrink-0">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl" />

              <div className="z-10 space-y-6">
                {/* Header Widget */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-emerald-50">Tips Upload Struk AI</h4>
                    <p className="text-[10px] text-emerald-300 font-medium">Scan Cepat & Akurat</p>
                  </div>
                </div>

                {/* Subtitle/Headline */}
                <p className="text-[12px] text-emerald-100/80 leading-relaxed font-medium">
                  Pastikan foto bukti struk pembelian Anda memenuhi panduan agar AI OCR dapat memproses nominal dan merchant secara otomatis:
                </p>

                {/* Tips List */}
                <ul className="space-y-3.5 text-[11px] font-semibold text-emerald-100/90">
                  <li className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>Ambil foto dalam kondisi terang dan fokus (tidak buram).</span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>Posisikan kamera tegak lurus dengan struk pembelian.</span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>Pastikan nominal, nama toko, dan tanggal transaksi tidak terpotong.</span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>Hindari struk terlipat atau kusut yang menutupi teks penting.</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div className="z-10 mt-8 pt-4 border-t border-white/10">
                <Link
                  href="/karyawan/reimbursement"
                  className="w-full py-3 bg-[#008f5d] hover:bg-[#007a4f] text-white text-[12px] font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                >
                  Ajukan Klaim Sekarang
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
