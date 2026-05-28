// app/layout.tsx
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import "./globals.css"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-full bg-zinc-100 text-zinc-800 antialiased overflow-hidden">
          
          {/* Sidebar Kiri Tetap */}
          <Sidebar />

          {/* Sisi Kanan: Header + Konten Halaman Aktif */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            
            {/* Tempat Masuknya isi dari page.tsx */}
            <div className="flex-1 flex overflow-hidden">
              {children}
            </div>
          </div>

        </div>
      </body>
    </html>
  );
}