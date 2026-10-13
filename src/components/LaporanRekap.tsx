import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  Search, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  DollarSign
} from 'lucide-react';

export const LaporanRekap: React.FC = () => {
  const { peminjamanList, alatList, stats, currentUser } = useLab();

  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOfficialPrintMode, setIsOfficialPrintMode] = useState(false);

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

  // Filtered dataset
  const filteredList = peminjamanList.filter((loan) => {
    const loanDate = loan.tanggalPinjam || loan.tanggalPengajuan.split('T')[0];
    const inRange = (!startDate || loanDate >= startDate) && (!endDate || loanDate <= endDate);
    const inStatus = filterStatus === 'ALL' || loan.status === filterStatus;
    const inSearch = 
      loan.kodeTiket.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.namaPeminjam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.nimNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.prodiDepartemen.toLowerCase().includes(searchQuery.toLowerCase());

    return inRange && inStatus && inSearch;
  });

  // Calculate totals
  const totalDendaTelat = filteredList.reduce((acc, curr) => acc + (curr.dendaKeterlambatan || 0), 0);
  const totalDendaRusak = filteredList.reduce((acc, curr) => acc + (curr.dendaKerusakan || 0), 0);
  const grandTotalDenda = totalDendaTelat + totalDendaRusak;

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Kode Tiket',
      'Nama Peminjam',
      'NIM/NIP',
      'Peran',
      'Departemen',
      'Keperluan',
      'Judul Riset',
      'Dosen Pembimbing',
      'Tgl Pinjam',
      'Batas Kembali',
      'Tgl Kembali Aktual',
      'Status',
      'Daftar Alat (Unit)',
      'Denda Telat (Rp)',
      'Denda Rusak (Rp)',
      'Total Denda (Rp)',
      'Status Bayar',
    ];

    const rows = filteredList.map((loan, idx) => [
      idx + 1,
      loan.kodeTiket,
      `"${loan.namaPeminjam}"`,
      `"${loan.nimNip}"`,
      loan.peran,
      `"${loan.prodiDepartemen}"`,
      loan.keperluan,
      `"${loan.judulKegiatan.replace(/"/g, '""')}"`,
      `"${loan.dosenPembimbing}"`,
      loan.tanggalPinjam,
      loan.tanggalRencanaKembali,
      loan.tanggalAktualKembali || '-',
      loan.status,
      `"${loan.items.map(i => `${i.namaAlat} (${i.jumlah})`).join('; ')}"`,
      loan.dendaKeterlambatan || 0,
      loan.dendaKerusakan || 0,
      loan.totalDenda || 0,
      loan.statusPembayaranDenda || 'TIDAK_ADA',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_peminjaman_lab_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Laporan & Rekapitulasi Sirkulasi Laboratorium
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ekspor rekam jejak peminjaman untuk arsip akreditasi, audit peralatan, dan pembukuan penerimaan denda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Berkas Resmi</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Status Transaksi</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">Semua Status ({peminjamanList.length})</option>
              <option value="SEDANG_DIPINJAM">Sedang Dipinjam</option>
              <option value="TERLAMBAT">Terlambat Jatuh Tempo</option>
              <option value="SELESAI">Selesai Dikembalikan</option>
              <option value="DISETUJUI">Disetujui Lab</option>
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Pencarian Kata Kunci</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tiket, nama, NIM..."
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Transaksi Terfilter</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {filteredList.length}
            </span>
            <span className="text-xs text-slate-500">berkas peminjaman</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Denda Keterlambatan</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">
              {formatRupiah(totalDendaTelat)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Grand Total Tagihan Denda</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-teal-700 tabular-nums">
              {formatRupiah(grandTotalDenda)}
            </span>
          </div>
        </div>
      </div>

      {/* Official KOP Header (Visible on print and preview) */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs print:border-none print:shadow-none print:p-0">
        
        {/* Academic Letterhead KOP */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between gap-4">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
            SL
          </div>
          <div className="text-center flex-1">
            <h2 className="text-base font-extrabold tracking-wider uppercase text-slate-900">
              KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
            </h2>
            <h3 className="text-sm font-bold uppercase text-slate-800">
              UNIT LABORATORIUM RISET & PRAKTIKUM TERPADU (SIMPEL-LAB)
            </h3>
            <p className="text-[11px] text-slate-600 font-mono mt-0.5">
              Gedung Laboratorium Pusat, Sayap Barat Lt. 1-3 · Email: lab-terpadu@univ.ac.id · Telp: (0274) 512345
            </p>
          </div>
          <div className="w-14 h-14 border border-slate-300 rounded flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono shrink-0">
            QR CODE
          </div>
        </div>

        <div className="text-center mb-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
            REKAPITULASI RESMI SIRKULASI PEMINJAMAN ALAT LABORATORIUM
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Periode: {formatDate(startDate)} s/d {formatDate(endDate)} · Dicetak oleh: {currentUser.name}
          </p>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                <th className="py-2.5 px-2 text-center w-8">No</th>
                <th className="py-2.5 px-3">Kode Tiket</th>
                <th className="py-2.5 px-3">Peminjam & NIM</th>
                <th className="py-2.5 px-3">Keperluan / Riset</th>
                <th className="py-2.5 px-3">Instrumen & Unit</th>
                <th className="py-2.5 px-2 font-mono">Tgl Pinjam</th>
                <th className="py-2.5 px-2 font-mono">Batas Kembali</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right font-mono">Denda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.map((loan, idx) => (
                <tr key={loan.id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 font-mono font-semibold text-slate-900">{loan.kodeTiket}</td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{loan.namaPeminjam}</div>
                    <div className="text-[10px] font-mono text-slate-500">{loan.nimNip}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-slate-800 line-clamp-1">{loan.judulKegiatan}</div>
                    <div className="text-[10px] text-slate-500">{loan.keperluan}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="line-clamp-1 text-slate-800">
                      {loan.items.map(i => `${i.namaAlat} (${i.jumlah})`).join(', ')}
                    </div>
                  </td>
                  <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{loan.tanggalPinjam}</td>
                  <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{loan.tanggalRencanaKembali}</td>
                  <td className="py-2 px-3">
                    <span className="font-mono text-[11px] font-semibold">
                      {loan.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    {loan.totalDenda > 0 ? formatRupiah(loan.totalDenda) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-xs">
                <td colSpan={8} className="py-2.5 px-3 text-right">Total Akumulasi Denda:</td>
                <td className="py-2.5 px-3 text-right font-mono text-teal-800">{formatRupiah(grandTotalDenda)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signature Box (Crucial for Indonesian Official Accreditation Documents) */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-xs text-center">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-semibold text-slate-900">Kepala Bagian Tata Usaha Laboratorium</p>
            <div className="h-20" />
            <p className="font-bold text-slate-900 underline underline-offset-2">Dr. Ir. Hendra Wijaya, M.T.</p>
            <p className="font-mono text-[11px] text-slate-500">NIP. 197508212003121001</p>
          </div>

          <div>
            <p className="text-slate-600">Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold text-slate-900">Petugas / Pranata Laboratorium Pendidikan</p>
            <div className="h-20" />
            <p className="font-bold text-slate-900 underline underline-offset-2">{currentUser.name}</p>
            <p className="font-mono text-[11px] text-slate-500">NIP/ID. {currentUser.nimNip}</p>
          </div>
        </div>

      </div>

    </div>
  );
};
