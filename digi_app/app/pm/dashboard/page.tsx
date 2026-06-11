"use client";

import { useState } from "react";
import SidebarPM, { NavItem } from "@/components/sidebar-pm";
import HeaderPM from "@/components/header-pm";

// ─── Icons ────────────────────────────────────────────────────────────────────

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// ─── Types & Data ─────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  code: string;
  vendor: string;
  status: "Aktif";
  totalRAB: number;
  pengeluaran: number;
  pengeluaranPct: number;
  reimbursement: number;
  reimbursementPct: number;
  sisa: number;
  sisaPct: number;
  progressPct: number;
}

const projects: Project[] = [
  {
    id: "1",
    name: "Renovasi Kantor Cabang Bandung",
    code: "PRI-2026-001",
    vendor: "PT Sinar Logistik Nusantara",
    status: "Aktif",
    totalRAB: 4800000000,
    pengeluaran: 3100000000,
    pengeluaranPct: 65,
    reimbursement: 412000000,
    reimbursementPct: 13,
    sisa: 1700000000,
    sisaPct: 35,
    progressPct: 65,
  },
  {
    id: "2",
    name: "Pembangunan Gudang Fase 2",
    code: "PRI-2026-002",
    vendor: "PT Bumi Karya Utama",
    status: "Aktif",
    totalRAB: 1600000000,
    pengeluaran: 1050000000,
    pengeluaranPct: 65,
    reimbursement: 187500000,
    reimbursementPct: 12,
    sisa: 165000000,
    sisaPct: 10,
    progressPct: 90,
  },
  {
    id: "3",
    name: "Data Center Bandung Tier-3",
    code: "PRI-2026-003",
    vendor: "Pelnopol",
    status: "Aktif",
    totalRAB: 4600000000,
    pengeluaran: 1890000000,
    pengeluaranPct: 41,
    reimbursement: 60500000,
    reimbursementPct: 3,
    sisa: 2710000000,
    sisaPct: 59,
    progressPct: 41,
  },
];

const approvals = [
  {
    id: "a1",
    initials: "AI",
    name: "Alif Ihsan · Gian media Merdeka",
    project: "RB-2026-006 · Renovasi Kantor Cabang Bandung",
    amount: 150000,
  },
  {
    id: "a2",
    initials: "AI",
    name: "Alif Ihsan · SPBU Pertamina 34 121",
    project: "RB-2026-005 · Pembangunan Gudang Fase 2",
    amount: 450000,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatShort(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  if (amount >= 1_000_000) return `Rp ${Math.round(amount / 1_000_000)} jt`;
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectManagerDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>("beranda");

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#F5F4F0",
      color: "#1A1A1A",
      fontSize: "13px",
    }}>
      {/* ── Sidebar (extracted component) ── */}
      <SidebarPM activeNav={activeNav} onNavChange={setActiveNav} />

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* ── Header (extracted component) ── */}
        <HeaderPM
          name="Muhammad Alvin Ababil"
          role="Project Manager"
          initials="MA"
          avatarColor="#C8102E"
          notificationCount={1}
        />

        {/* ── Page Content ── */}
        <div style={{ padding: "28px 32px", flex: 1 }}>

          {/* Page Title */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}>
            <div>
              <h1 style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: "4px",
                letterSpacing: "-0.4px",
              }}>
                Beranda Project Manager
              </h1>
              <p style={{ color: "#6B6B6B", fontSize: "13px" }}>
                Pantau realisasi anggaran proyek di bawah supervisimu dan validasi pengajuan<br />
                reimbursement yang masuk.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                border: "1px solid #D4D0C8",
                borderRadius: "8px",
                background: "white",
                color: "#3D3D3D",
                fontWeight: "500",
                fontSize: "13px",
                cursor: "pointer",
              }}>
                <DownloadIcon />
                Laporan Bulanan
              </button>
              <button style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                border: "none",
                borderRadius: "8px",
                background: "#2D6A4F",
                color: "white",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
              }}>
                <MailIcon />
                2 Pengajuan Menunggu
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}>
            {[
              { label: "Proyek Aktif", value: "2", sub: "di bawah supervisi", icon: <CalendarIcon />, iconColor: "#E8A838" },
              { label: "Total RAB", value: "Rp 9.8 M", sub: null, icon: <ChartIcon />, iconColor: "#4A9EDE" },
              { label: "Realisasi", value: "Rp 7.5 M", sub: "63% tercapai", icon: <TrendUpIcon />, iconColor: "#48BB78" },
              { label: "Antrian Approval", value: "Rp 150 rb", sub: "2 antrian", icon: <MailIcon />, iconColor: "#E8A838" },
            ].map((card, i) => (
              <div key={i} style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px 20px",
                border: "1px solid #E8E6E0",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}>
                  <span style={{ fontSize: "12px", color: "#8B8B8B", fontWeight: "500" }}>{card.label}</span>
                  <span style={{ color: card.iconColor }}>{card.icon}</span>
                </div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#1A1A1A", letterSpacing: "-0.5px" }}>
                  {card.value}
                </div>
                {card.sub && (
                  <div style={{ fontSize: "11px", color: "#9B9B9B", marginTop: "4px" }}>{card.sub}</div>
                )}
              </div>
            ))}
          </div>

          {/* Realisasi Anggaran */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #E8E6E0",
            padding: "20px 24px",
            marginBottom: "24px",
          }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#1A1A1A", marginBottom: "16px" }}>
              Realisasi Anggaran per Proyek
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {projects.map((p, idx) => (
                <div key={p.id} style={{
                  paddingBottom: idx < projects.length - 1 ? "20px" : "0",
                  borderBottom: idx < projects.length - 1 ? "1px solid #F0EEE8" : "none",
                }}>
                  {/* Project Header */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                        <span style={{ fontWeight: "600", fontSize: "13px", color: "#1A1A1A" }}>{p.name}</span>
                        <span style={{
                          padding: "1px 8px",
                          background: "#E8F5EE",
                          color: "#2D6A4F",
                          borderRadius: "20px",
                          fontSize: "10px",
                          fontWeight: "600",
                          letterSpacing: "0.2px",
                        }}>
                          Aktif
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#9B9B9B" }}>{p.code} · {p.vendor}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "10px", color: "#9B9B9B", marginBottom: "2px" }}>TOTAL RAB</div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "#1A1A1A" }}>{formatShort(p.totalRAB)}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    height: "8px",
                    background: "#F0EEE8",
                    borderRadius: "4px",
                    marginBottom: "12px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${p.progressPct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2D6A4F, #40916C)",
                      borderRadius: "4px",
                      transition: "width 0.6s ease",
                    }} />
                  </div>

                  {/* Stats Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    {[
                      {
                        label: "PENGELUARAN (termasuk reimbursement)",
                        value: formatShort(p.pengeluaran),
                        sub: `${p.pengeluaranPct}% dari RAB`,
                        dotColor: "#2D6A4F",
                        isCheckbox: false,
                      },
                      {
                        label: "REIMBURSEMENT",
                        value: formatShort(p.reimbursement),
                        sub: `${p.reimbursementPct}% dari pengeluaran`,
                        dotColor: "#48BB78",
                        isCheckbox: false,
                      },
                      {
                        label: "SISA",
                        value: formatShort(p.sisa),
                        sub: `${p.sisaPct}% dari RAB`,
                        dotColor: undefined,
                        isCheckbox: true,
                      },
                    ].map((stat, si) => (
                      <div key={si}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                          {stat.isCheckbox ? (
                            <span style={{
                              width: "11px",
                              height: "11px",
                              border: "1.5px solid #C8C4BC",
                              borderRadius: "3px",
                              display: "inline-block",
                            }} />
                          ) : (
                            <span style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "2px",
                              background: stat.dotColor,
                              display: "inline-block",
                            }} />
                          )}
                          <span style={{ fontSize: "10px", color: "#9B9B9B", fontWeight: "500" }}>{stat.label}</span>
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#1A1A1A" }}>{stat.value}</div>
                        <div style={{ fontSize: "10px", color: "#9B9B9B" }}>{stat.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Antrian Approval */}
            <div style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #E8E6E0",
              padding: "20px 24px",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#1A1A1A" }}>
                  Antrian Approval Hari ini
                </h2>
                <button style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "none",
                  border: "none",
                  color: "#2D6A4F",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}>
                  Lihat semua <ChevronRightIcon />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {approvals.map((a) => (
                  <div key={a.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "#FAFAF8",
                    border: "1px solid #F0EEE8",
                  }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "#2D6A4F",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {a.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: "600",
                        fontSize: "12px",
                        color: "#1A1A1A",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {a.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9B9B9B" }}>{a.project}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "#1A1A1A" }}>
                        Rp {a.amount.toLocaleString("id-ID")}
                      </div>
                      <button style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        background: "none",
                        border: "none",
                        color: "#2D6A4F",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginTop: "2px",
                        marginLeft: "auto",
                      }}>
                        Review <ChevronRightIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Placeholder */}
            <div style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #E8E6E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "200px",
            }}>
              <div style={{
                position: "relative",
                width: "120px",
                height: "120px",
                border: "2px solid #D4D0C8",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <line x1="0" y1="0" x2="120" y2="120" stroke="#D4D0C8" strokeWidth="1.5" />
                  <line x1="120" y1="0" x2="0" y2="120" stroke="#D4D0C8" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
