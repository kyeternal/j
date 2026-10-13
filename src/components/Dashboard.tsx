import React from 'react';
import { useLab } from '../context/LabContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Package, 
  ArrowRight, 
  Plus, 
  QrCode,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    stats, 
    peminjamanList, 
    alatList, 
    setActiveTab, 
    setSelectedTicketForReturn,
    setSelectedAlatForDetail,
    setIsQRScannerOpen,
    currentUser
  } = useLab();

  const pendingLoans = peminjamanList.filter(p => p.status === 'MENUNGGU_VERIFIKASI');
  const overdueLoans = peminjamanList.filter(p => p.status === 'TERLAMBAT');
  const activeLoans = peminjamanList.filter(p => p.status === 'SEDANG_DIPINJAM');
  const recentLoans = peminjamanList.slice(0, 5);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Editorial Header & Status Intro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dasbor Pusat Kendali Laboratorium
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengelolaan aset terpadu, sirkulasi peminjaman mahasiswa & riset dosen, kalibrasi instrumen berkala.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('peminjaman')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Peminjaman</span>
          </button>
          <button
            type="button"
            onClick={() => setIsQRScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span>Pindai QR Cepat</span>
          </button>
        </div>
      </div>

      {/* Action Alerts if Pending Approvals or Overdue */}
      {pendingLoans.length > 0 && (currentUser.role === 'ADMIN_LAB' || currentUser.role === 'ASISTEN_LAB') && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Ada {pendingLoans.length} Permohonan Peminjaman Menunggu Verifikasi
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Pengajuan terbaru oleh {pendingLoans[0]?.namaPeminjam} ({pendingLoans[0]?.items.length} alat) memerlukan persetujuan jadwal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('verifikasi')}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
          >
            Tinjau di Verifikasi &rarr;
          </button>
        </div>
      )}

      {overdueLoans.length > 0 && (
        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">
                Peringatan: {overdueLoans.length} Transaksi Melewati Batas Waktu Pengembalian
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Tiket {overdueLoans[0]?.kodeTiket} atas nama {overdueLoans[0]?.namaPeminjam} terkena denda keterlambatan {formatRupiah(overdueLoans[0]?.dendaKeterlambatan)}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedTicketForReturn(overdueLoans[0].kodeTiket);
              setActiveTab('pengembalian');
            }}
            className="px-3 py-1.5 text-xs font-semibold text-rose-900 bg-rose-200/80 hover:bg-rose-300 rounded-lg transition-colors whitespace-nowrap"
          >
            Proses Pengembalian Segera &rarr;
          </button>
        </div>
      )}

      {/* KPI Metric Strip (Anti-slop, clean single-elevation, tabular numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Alat Lab</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {stats.totalAlat}
            </span>
            <span className="text-xs text-slate-500">
              ({stats.totalUnit} total unit)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1">
            <span>5 kategori laboratorium aktif</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Unit Tersedia</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-teal-700 tabular-nums">
              {stats.unitTersedia}
            </span>
            <span className="text-xs text-slate-500">
              dari {stats.totalUnit} unit
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1">
            <span>Siap dipinjam praktikum & riset</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sedang Dipinjam</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-indigo-700 tabular-nums">
              {stats.sedangDipinjam}
            </span>
            <span className="text-xs text-slate-500">
              transaksi aktif
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1">
            <span>{activeLoans.length} mahasiswa & periset</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dalam Perawatan</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-amber-700 tabular-nums">
              {stats.dalamPerawatan}
            </span>
            <span className="text-xs text-slate-500">
              unit kalibrasi
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1">
            <span>Standar ISO/IEC 17025 terjadwal</span>
          </div>
        </div>

      </div>

      {/* Main Content Split: Featured Equipment Showcase & Recent Loans Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Transaksi & Sirkulasi Terkini */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Aktivitas Peminjaman & Sirkulasi Terkini
              </h2>
              <p className="text-xs text-slate-500">
                Pelacakan alur tiket mulai dari permohonan hingga serah terima dan pengembalian.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('laporan')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Lihat Rekapitulasi &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Kode Tiket</th>
                  <th className="py-2.5 px-3">Peminjam</th>
                  <th className="py-2.5 px-3">Alat & Jumlah</th>
                  <th className="py-2.5 px-3">Batas Kembali</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLoans.map((loan) => {
                  let statusBadge = (
                    <span className="text-slate-600 font-medium">Draft</span>
                  );
                  if (loan.status === 'MENUNGGU_VERIFIKASI') {
                    statusBadge = <span className="text-amber-700 font-medium font-mono text-[11px]">Menunggu Verifikasi</span>;
                  } else if (loan.status === 'DISETUJUI') {
                    statusBadge = <span className="text-blue-700 font-medium font-mono text-[11px]">Disetujui Lab</span>;
                  } else if (loan.status === 'SEDANG_DIPINJAM') {
                    statusBadge = <span className="text-emerald-700 font-medium font-mono text-[11px]">Sedang Dipinjam</span>;
                  } else if (loan.status === 'TERLAMBAT') {
                    statusBadge = <span className="text-rose-700 font-semibold font-mono text-[11px]">Terlambat</span>;
                  } else if (loan.status === 'SELESAI') {
                    statusBadge = <span className="text-slate-500 font-medium font-mono text-[11px]">Selesai</span>;
                  } else if (loan.status === 'DITOLAK') {
                    statusBadge = <span className="text-rose-600 font-medium font-mono text-[11px]">Ditolak</span>;
                  }

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {loan.kodeTiket}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{loan.namaPeminjam}</div>
                        <div className="text-[11px] text-slate-600 font-mono">{loan.nimNip}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 line-clamp-1">
                          {loan.items[0]?.namaAlat}
                        </div>
                        {loan.items.length > 1 && (
                          <div className="text-[10px] text-slate-600">
                            +{loan.items.length - 1} item lainnya
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {formatDate(loan.tanggalRencanaKembali)}
                      </td>
                      <td className="py-3 px-3">
                        {statusBadge}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {loan.status === 'SEDANG_DIPINJAM' || loan.status === 'TERLAMBAT' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicketForReturn(loan.kodeTiket);
                              setActiveTab('pengembalian');
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-teal-700 hover:bg-teal-50 rounded transition-colors"
                          >
                            Kembalikan
                          </button>
                        ) : loan.status === 'MENUNGGU_VERIFIKASI' ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab('verifikasi')}
                            className="px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 rounded transition-colors"
                          >
                            Verifikasi
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('laporan');
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 rounded transition-colors"
                          >
                            Rincian
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Alat Unggulan & Quick Guides */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Instrumen Laboratorium Utama
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('katalog')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Semua ({alatList.length}) &rarr;
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {alatList.slice(0, 4).map((alat) => (
                <div 
                  key={alat.id} 
                  className="py-3 flex items-center justify-between gap-3 group cursor-pointer"
                  onClick={() => {
                    setSelectedAlatForDetail(alat);
                    setActiveTab('katalog');
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {alat.fotoUrl ? (
                        <img 
                          src={alat.fotoUrl} 
                          alt={alat.nama} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                        {alat.nama}
                      </p>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <span>{alat.kode}</span>
                        <span>·</span>
                        <span>{alat.lokasiRak}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-900">
                      {alat.stokTersedia}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">/{alat.totalStok}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Flow Guide */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold tracking-wide uppercase text-slate-300">
                Standar Operasional Laboratorium
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Peminjaman instrumen lab harus diverifikasi oleh Dosen Pembimbing & Petugas Laboran sebelum serah terima fisik. Keterlambatan dikenakan denda Rp 10.000 / hari.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Jam Operasional Lab:</span>
              <span className="font-mono text-slate-200">08:00 - 16:30 WIB</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
