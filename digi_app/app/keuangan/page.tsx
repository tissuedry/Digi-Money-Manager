"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Notebook,
  Check,
  Zap,
  SquareMinus,
  ChevronRight,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)} jt`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)} rb`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatRupiahFull(amount: number): string {
  return `Rp ${Number(amount).toLocaleString("id-ID")}`;
}

function getInitials(name: string) {
  if (!name) return "??";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_PENCAIRAN = [
  {
    id: "RB-2026-004",
    nominal: 150000,
    status: "APPROVED_BY_PM",
    user: { nama: "Alif Ihsan", divisi: "Gramedia Merdeka" },
    proyek: { nama: "Renovasi Kantor Cabang Bandung" },
  },
  {
    id: "RB-2026-003",
    nominal: 450000,
    status: "APPROVED_BY_PM",
    user: { nama: "Alif Ihsan", divisi: "SPBU Pertamina 34.121" },
    proyek: { nama: "Pembangunan Gudang Fase 2" },
  },
];

const DUMMY_JURNAL = [
  {
    jeId: "JE-2026-0892",
    tanggal: "13 Mei 2026",
    keterangan: "Pencairan reimbursement Alif Ihsan - Material Interior",
    debitKode: "5-5101",
    debitNama: "Beban Material Proyek",
    kreditKode: "1-1102",
    kreditNama: "Bank BCA - Operasional",
    nominal: 1875000,
  },
  {
    jeId: "JE-2026-0892",
    tanggal: "13 Mei 2026",
    keterangan: "Pencairan reimbursement Ghanif Hadiyana Akbar - Akomodasi training onsite",
    debitKode: "5-5202",
    debitNama: "Beban Konsumsi & Akomodasi",
    kreditKode: "1-1102",
    kreditNama: "Bank BCA - Operasional",
    nominal: 1240000,
  },
  {
    jeId: "JE-2026-0892",
    tanggal: "13 Mei 2026",
    keterangan: "Pencairan reimbursement Alif Ihsan - Gojek site visit",
    debitKode: "5-5201",
    debitNama: "Beban Transportasi Proyek",
    kreditKode: "1-1102",
    kreditNama: "Bank BCA - Operasional",
    nominal: 1875000,
  },
  {
    jeId: "JE-2026-0892",
    tanggal: "13 Mei 2026",
    keterangan: "Pencairan reimbursement Damar Muharram - Material Interior",
    debitKode: "5-5101",
    debitNama: "Beban Material Proyek",
    kreditKode: "1-1102",
    kreditNama: "Bank BCA - Operasional",
    nominal: 1875000,
  },
];

const DUMMY_METRICS = {
  pendingDisbursementsNominal: 600000,
  pendingDisbursementCount: 2,
  totalCashDisbursed: 0,
  totalRABAllocated: 1300000,
  jurnalCount: 4,
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function KeuanganDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [pencairanList, setPencairanList] = useState<any[]>(DUMMY_PENCAIRAN);
  const [jurnalList, setJurnalList] = useState<any[]>(DUMMY_JURNAL);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [dashRes, reimRes, lapRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/reimbursements"),
          fetch("/api/laporan?type=buku-besar"),
        ]);

        if (!dashRes.ok || !reimRes.ok) throw new Error("API not ready");

        const dashData = await dashRes.json();
        const reimData = await reimRes.json();
        const lapData = await lapRes.json();

        if (dashData.dashboard) setDashboardData(dashData.dashboard);

        if (reimData.reimbursements) {
          const pending = reimData.reimbursements.filter(
            (r: any) => r.status === "APPROVED_BY_PM"
          );
          if (pending.length > 0) setPencairanList(pending);
        }

        if (lapData.report) {
          const entries: any[] = [];
          lapData.report.forEach((acc: any) => {
            acc.transaksi?.forEach((t: any) => {
              entries.push({ ...t, akunNama: acc.nama, akunKode: acc.kode });
            });
          });
          if (entries.length > 0) setJurnalList(entries.slice(0, 8));
        }
      } catch {
        // Biarkan dummy data tetap tampil jika API belum siap
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  const metrics = DUMMY_METRICS;

  const statCards = [
    {
      label: "Menunggu Pencairan",
      value: formatRupiah(metrics.pendingDisbursementsNominal),
      sub: `${metrics.pendingDisbursementCount} antrian`,
      icon: <Wallet size={18} className="text-stone-500" />,
      iconBg: "bg-stone-100",
    },
    {
      label: "Dicairkan Hari ini",
      value: formatRupiah(metrics.totalCashDisbursed),
      sub: `${metrics.pendingDisbursementCount} pengajuan`,
      icon: <Check size={18} className="text-emerald-600" />,
      iconBg: "bg-emerald-50",
    },
    {
      label: "Jurnal Generated (Mei)",
      value: String(metrics.jurnalCount),
      sub: "otomatis dari sistem",
      icon: <Notebook size={18} className="text-blue-500" />,
      iconBg: "bg-blue-50",
    },
    {
      label: "Total Debit = Kredit",
      value: formatRupiah(metrics.totalRABAllocated),
      sub: "✓ Seimbang",
      icon: <Check size={18} className="text-emerald-600" />,
      iconBg: "bg-emerald-50",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#f4f2ec] text-stone-800 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole="Tim Keuangan"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f6f4f0]">
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          userRole="Tim Keuangan"
        />

        <main className="flex-1 overflow-y-auto px-8 py-6">

          {/* ── Page Header ── */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#14130F]">
                Beranda Keuangan
              </h1>
              <p className="text-[13px] text-stone-500 mt-1">
                Proses pencairan reimbursement yang telah divalidasi PM. Jurnal
                akuntansi ter-generate otomatis.
              </p>
            </div>

            {/* Tombol Antrian Pencairan — selalu tampil selama ada data */}
            {pencairanList.length > 0 && (
              <Link
                href="/keuangan/pencairan"
                className="flex items-center gap-2 bg-[#008f5d] hover:bg-[#00754c] transition text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl shadow-sm shrink-0"
              >
                <SquareMinus size={15} color="currentColor" />
                Antrian Pencairan ({pencairanList.length})
              </Link>
            )}
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-stone-500">
                    {card.label}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}
                  >
                    {card.icon}
                  </div>
                </div>
                <div>
                  {isLoading ? (
                    <span className="inline-block h-7 w-24 bg-stone-100 rounded animate-pulse" />
                  ) : (
                    <p className="text-[22px] font-bold text-stone-900 leading-tight">
                      {card.value}
                    </p>
                  )}
                  <p className="text-[11px] text-stone-400 mt-1 font-medium">
                    {card.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Two-column: Antrian + Jurnal ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Antrian Pencairan */}
            <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                <h2 className="text-[15px] font-bold text-stone-900">
                  Antrian Pencairan
                </h2>
                <Link
                  href="/keuangan/pencairan"
                  className="flex items-center gap-1 text-[12px] font-semibold text-stone-500 hover:text-stone-800 transition"
                >
                  Proses semua
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-stone-100">
                {pencairanList.map((item: any) => {
                  const initials = getInitials(item.user?.nama || "");
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-[#e2f1eb] text-[#117a5b] font-bold text-[12px] flex items-center justify-center shrink-0">
                        {initials}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-stone-900 truncate">
                          {item.user?.nama}
                          <span className="text-stone-400 font-normal ml-1 text-[11px]">
                            · {item.user?.divisi || item.proyek?.nama}
                          </span>
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                          {item.id} · {item.proyek?.nama}
                        </p>
                      </div>

                      {/* Nominal + Tombol Cairkan */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[13px] font-bold text-stone-800">
                          {formatRupiahFull(item.nominal)}
                        </span>
                        <Link
                          href="/keuangan/pencairan"
                          className="flex items-center gap-1.5 bg-[#008f5d] hover:bg-[#00754c] transition text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          <Zap size={12} fill="currentColor" />
                          Cairkan
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Jurnal Terbaru */}
            <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                <h2 className="text-[15px] font-bold text-stone-900">
                  Jurnal Terbaru
                </h2>
                <Link
                  href="/keuangan/jurnal"
                  className="flex items-center gap-1 text-[12px] font-semibold text-stone-500 hover:text-stone-800 transition"
                >
                  Buku Besar
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-stone-100 overflow-y-auto max-h-[480px]">
                {jurnalList.map((entry: any, idx: number) => {
                  // Support both dummy format (flat) and API format (nested)
                  const jeId = entry.jeId ?? `JE-2026-${String(idx + 892).padStart(4, "0")}`;
                  const tanggal = entry.tanggal ?? "13 Mei 2026";
                  const keterangan = entry.keterangan ?? `Pencairan · ${entry.akunNama ?? ""}`;
                  const debitNama = entry.debitNama ?? entry.akunNama ?? "Beban Material Proyek";
                  const debitKode = entry.debitKode ?? entry.akunKode ?? "5-5101";
                  const kreditNama = entry.kreditNama ?? "Bank BCA - Operasional";
                  const kreditKode = entry.kreditKode ?? "1-1102";
                  const nominal = entry.nominal
                    ? Number(entry.nominal)
                    : Math.abs(parseFloat(entry.debit || entry.kredit || "1875000"));

                  return (
                    <div key={idx} className="px-6 py-4 hover:bg-stone-50 transition">
                      {/* JE header row */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono text-stone-400">
                          {jeId}
                        </span>
                        <span className="text-[11px] text-stone-400">{tanggal}</span>
                      </div>

                      {/* Keterangan */}
                      <p className="text-[12px] font-semibold text-stone-800 mb-2 truncate">
                        {keterangan}
                      </p>

                      {/* Debit line */}
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-600">
                          <span className="text-emerald-700 font-bold">Dr</span>{" "}
                          {debitKode} {debitNama}
                        </span>
                        <span className="text-stone-700 font-semibold">
                          Rp {nominal.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Kredit line */}
                      <div className="flex justify-between items-center text-[11px] mt-1">
                        <span className="text-[#0277bd]">
                          <span className="font-medium">Cr</span>{" "}
                          {kreditKode} {kreditNama}
                        </span>
                        <span className="text-stone-700 font-semibold">
                          Rp {nominal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}