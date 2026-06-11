"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, Loader2, Check, X, Search, ChevronDown, Users } from "lucide-react";

type Proyek = { id: number; nama: string; status: string };
type Member = {
  id: number;
  nama: string;
  email: string;
  role: string;
  divisi: string | null;
  proyek: { id: number; nama: string; status: string; roleInProyek: string }[];
};

const ROLES = ["Karyawan", "Project Manager", "Tim Keuangan", "Direktur / Manajemen"];

const ROLE_BADGE: Record<string, string> = {
  "Karyawan": "bg-stone-100 text-stone-600",
  "Project Manager": "bg-blue-50 text-blue-700",
  "Tim Keuangan": "bg-emerald-50 text-emerald-700",
  "Direktur / Manajemen": "bg-purple-50 text-purple-700",
};

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
];

export default function AnggotaPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [proyekList, setProyekList] = useState<Proyek[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");

  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    userRole: "Karyawan",
    divisi: "",
    proyekId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, proyekRes] = await Promise.all([
        fetch("/api/manager/members"),
        fetch("/api/manager/proyek"),
      ]);
      const [membersData, proyekData] = await Promise.all([membersRes.json(), proyekRes.json()]);
      setMembers(membersData.members ?? []);
      setProyekList(proyekData.proyek ?? []);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/manager/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          proyekId: form.proyekId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Gagal mendaftarkan anggota");
        return;
      }

      setSuccess(`Anggota "${form.nama}" berhasil didaftarkan!`);
      setForm({ nama: "", email: "", password: "", userRole: "Karyawan", divisi: "", proyekId: "" });
      setShowForm(false);
      fetchData();
    } catch {
      setFormError("Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "Semua" || m.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1400px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 leading-tight">Registrasi Anggota</h1>
          <p className="text-sm text-stone-500 mt-1">
            Kelola akun tim. Daftarkan karyawan, Project Manager, dan Tim Keuangan ke sistem.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(""); setSuccess(""); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] hover:bg-[#1e5038] text-white text-[13px] font-bold rounded-xl shadow-sm transition cursor-pointer whitespace-nowrap"
        >
          <UserPlus size={16} />
          Tambah Anggota
        </button>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <Check size={16} />
          {success}
        </div>
      )}

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-[15px] text-stone-900">Daftarkan Anggota Baru</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nama */}
              <div>
                <label className="block text-[12px] font-bold text-stone-600 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Budi Santoso"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-[13px] text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[12px] font-bold text-stone-600 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="budi@perusahaan.com"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-[13px] text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[12px] font-bold text-stone-600 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 karakter"
                  minLength={8}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-[13px] text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[12px] font-bold text-stone-600 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.userRole}
                    onChange={(e) => setForm({ ...form, userRole: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-[13px] text-stone-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition bg-white pr-10"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Divisi */}
              <div>
                <label className="block text-[12px] font-bold text-stone-600 mb-1.5">Divisi / Jabatan</label>
                <input
                  type="text"
                  value={form.divisi}
                  onChange={(e) => setForm({ ...form, divisi: e.target.value })}
                  placeholder="Contoh: Operasional Lapangan"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-[13px] text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition"
                />
              </div>

              {/* Proyek */}
              <div>
                <label className="block text-[12px] font-bold text-stone-600 mb-1.5">Assign ke Proyek (opsional)</label>
                <div className="relative">
                  <select
                    value={form.proyekId}
                    onChange={(e) => setForm({ ...form, proyekId: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-[13px] text-stone-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition bg-white pr-10"
                  >
                    <option value="">— Tidak assign ke proyek —</option>
                    {proyekList.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama} ({p.status})</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {formError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-[12px] font-medium flex items-center gap-2">
                <X size={14} />
                {formError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-stone-200 rounded-xl text-[13px] font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1e5038] disabled:opacity-60 text-white text-[13px] font-bold rounded-xl transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    Daftarkan Anggota
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 py-2 flex-1">
            <Search size={14} className="text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[13px] text-stone-700 placeholder-stone-400 focus:outline-none w-full"
            />
          </div>

          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-stone-200 rounded-xl px-3 py-2 text-[12px] font-semibold text-stone-600 appearance-none pr-7 focus:outline-none bg-white cursor-pointer"
            >
              <option>Semua</option>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-stone-400">
            <Users size={14} />
            <span>{filteredMembers.length} anggota</span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-stone-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat data anggota...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-sm">
            {searchQuery || filterRole !== "Semua"
              ? "Tidak ada anggota yang sesuai filter."
              : "Belum ada anggota terdaftar."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-stone-400 font-semibold uppercase tracking-wide border-b border-stone-100">
                  <th className="text-left px-5 py-3">Anggota</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Divisi</th>
                  <th className="text-left px-4 py-3">Proyek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredMembers.map((m, i) => (
                  <tr key={m.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                          {getInitials(m.nama)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-stone-900 leading-tight">{m.nama}</p>
                          <p className="text-[11px] text-stone-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg ${ROLE_BADGE[m.role] || "bg-stone-100 text-stone-600"}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-stone-500">{m.divisi || "—"}</td>
                    <td className="px-4 py-3.5">
                      {m.proyek.length === 0 ? (
                        <span className="text-[12px] text-stone-300">Tidak ada proyek</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {m.proyek.map((p) => (
                            <span
                              key={p.id}
                              className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
                            >
                              {p.nama}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
