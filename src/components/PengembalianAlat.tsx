import React, { useState, useEffect } from 'react';
import { useLab } from '../context/LabContext';
import { Peminjaman } from '../types';
import { 
  RotateCcw, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  QrCode, 
  Printer, 
  Calculator,
  ShieldCheck,
  FileCheck,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PengembalianAlat: React.FC = () => {
  const { 
    peminjamanList, 
    processPengembalian, 
    currentUser, 
    selectedTicketForReturn, 
    setSelectedTicketForReturn,
    setIsQRScannerOpen,
    setPrintData,
    setIsPrintModalOpen,
    setActiveTab
  } = useLab();

  const [searchTicket, setSearchTicket] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Peminjaman | null>(null);

  // Return inspection form state
  const [kondisi, setKondisi] = useState<'LENGKAP_BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'KOMPONEN_HILANG'>('LENGKAP_BAIK');
  const [dendaKerusakan, setDendaKerusakan] = useState<number>(0);
  const [catatanPemeriksaan, setCatatanPemeriksaan] = useState('');
  const [petugasPemeriksa, setPetugasPemeriksa] = useState(currentUser.name);

  // Success summary state
  const [completedLoan, setCompletedLoan] = useState<Peminjaman | null>(null);

  // Loans that can be returned
  const returnableLoans = peminjamanList.filter(
    (p) => p.status === 'SEDANG_DIPINJAM' || p.status === 'TERLAMBAT'
  );

  // Sync if pre-selected from Dashboard or QR scanner
  useEffect(() => {
    if (selectedTicketForReturn) {
      const match = peminjamanList.find(p => p.kodeTiket === selectedTicketForReturn);
      if (match) {
        setSelectedLoan(match);
        setSearchTicket(match.kodeTiket);
      }
      setSelectedTicketForReturn(null);
    }
  }, [selectedTicketForReturn, peminjamanList]);

  // Adjust suggested damage fine when condition changes
  useEffect(() => {
    if (kondisi === 'LENGKAP_BAIK') setDendaKerusakan(0);
    else if (kondisi === 'RUSAK_RINGAN') setDendaKerusakan(75000);
    else if (kondisi === 'KOMPONEN_HILANG') setDendaKerusakan(150000);
    else if (kondisi === 'RUSAK_BERAT') setDendaKerusakan(350000);
  }, [kondisi]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Calculate late days & fine
  const calcLateInfo = (loan: Peminjaman) => {
    const today = new Date().toISOString().split('T')[0];
    const plan = new Date(loan.tanggalRencanaKembali).getTime();
    const now = new Date(today).getTime();
    const diffDays = Math.max(0, Math.round((now - plan) / (1000 * 3600 * 24)));
    const dendaTelat = diffDays * 10000;
    return { diffDays, dendaTelat };
  };

  const handleSelectLoan = (loan: Peminjaman) => {
    setSelectedLoan(loan);
    setSearchTicket(loan.kodeTiket);
    setKondisi('LENGKAP_BAIK');
    setDendaKerusakan(0);
    setCatatanPemeriksaan('Semua unit telah diperiksa fisik & kelistrikan, bersih dan berfungsi normal.');
    setPetugasPemeriksa(currentUser.name);
  };

  const handleExecuteReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    processPengembalian(selectedLoan.id, {
      kondisiPengembalian: kondisi,
      dendaKerusakan: Number(dendaKerusakan),
      catatanPengembalian: catatanPemeriksaan,
      diterimaKembaliOleh: petugasPemeriksa,
    });

    const updated = {
      ...selectedLoan,
      status: 'SELESAI' as const,
      kondisiPengembalian: kondisi,
      dendaKerusakan: Number(dendaKerusakan),
      catatanPengembalian: catatanPemeriksaan,
      diterimaKembaliOleh: petugasPemeriksa,
      totalDenda: (calcLateInfo(selectedLoan).dendaTelat) + Number(dendaKerusakan),
    };

    setCompletedLoan(updated);
    setSelectedLoan(null);
    setSearchTicket('');

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pusat Pengembalian & Kalkulator Denda
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pemeriksaan kondisi fisik alat, verifikasi kelengkapan komponen, perhitungan otomatis denda keterlambatan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsQRScannerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
        >
          <QrCode className="w-3.5 h-3.5 text-slate-600" />
          <span>Pindai QR Tiket Peminjam</span>
        </button>
      </div>

      {/* Success Receipt View */}
      {completedLoan && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-md text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto border border-teal-200">
            <CheckCircle className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-teal-800">PENGEMBALIAN BERHASIL DISELESAIKAN</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Tiket: <span className="font-mono">{completedLoan.kodeTiket}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Stok unit laboratorium telah dikembalikan dan status transaksi telah ditutup.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-left space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Peminjam:</span>
              <span className="text-slate-900 font-semibold">{completedLoan.namaPeminjam}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kondisi Alat:</span>
              <span className="text-slate-900 font-semibold">{completedLoan.kondisiPengembalian}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Denda Keterlambatan:</span>
              <span className="text-slate-900 font-semibold">{formatRupiah(completedLoan.dendaKeterlambatan)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Denda Kerusakan:</span>
              <span className="text-slate-900 font-semibold">{formatRupiah(completedLoan.dendaKerusakan)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
              <span>Total Denda:</span>
              <span className="text-teal-700">{formatRupiah(completedLoan.totalDenda)}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                setPrintData(completedLoan);
                setIsPrintModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Berita Acara Pengembalian</span>
            </button>
            <button
              type="button"
              onClick={() => setCompletedLoan(null)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Proses Transaksi Lain
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of Active/Overdue Loans */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Peminjaman Aktif ({returnableLoans.length})
            </h2>
            <p className="text-xs text-slate-500">
              Pilih peminjaman yang akan dikembalikan atau cari nomor tiket.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTicket}
              onChange={(e) => setSearchTicket(e.target.value)}
              placeholder="Cari kode tiket, nama, NIM..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {returnableLoans.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Semua alat telah dikembalikan</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Tidak ada peminjaman aktif saat ini.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {returnableLoans
                .filter(p => 
                  p.kodeTiket.toLowerCase().includes(searchTicket.toLowerCase()) ||
                  p.namaPeminjam.toLowerCase().includes(searchTicket.toLowerCase()) ||
                  p.nimNip.toLowerCase().includes(searchTicket.toLowerCase())
                )
                .map((loan) => {
                  const { diffDays, dendaTelat } = calcLateInfo(loan);
                  const isSelected = selectedLoan?.id === loan.id;

                  return (
                    <div
                      key={loan.id}
                      onClick={() => handleSelectLoan(loan)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100/30">
                        <span className="font-mono font-bold tracking-tight">
                          {loan.kodeTiket}
                        </span>
                        {diffDays > 0 ? (
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'}`}>
                            Terlambat {diffDays} Hari
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-slate-800 text-teal-300' : 'bg-emerald-50 text-emerald-800'}`}>
                            Tepat Waktu
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <div className="font-semibold">{loan.namaPeminjam}</div>
                        <div className={`text-[11px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {loan.items.length} jenis alat · Batas: {loan.tanggalRencanaKembali}
                        </div>
                        {dendaTelat > 0 && (
                          <div className={`text-[11px] font-mono font-bold ${isSelected ? 'text-rose-300' : 'text-rose-600'}`}>
                            Estimasi Denda: {formatRupiah(dendaTelat)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Right Column: Return Inspection & Fine Processing Form */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
          {!selectedLoan ? (
            <div className="p-12 text-center text-slate-400">
              <RotateCcw className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-semibold text-slate-700">Pilih Tiket Peminjaman</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Klik salah satu peminjaman aktif di sebelah kiri atau gunakan pemindai QR untuk memulai pemeriksaan pengembalian.
              </p>
            </div>
          ) : (
            <form onSubmit={handleExecuteReturn} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">Pemeriksaan Tiket</span>
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    {selectedLoan.kodeTiket}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Peminjam:</span>
                  <span className="text-xs font-semibold text-slate-900 block font-mono">{selectedLoan.namaPeminjam} ({selectedLoan.nimNip})</span>
                </div>
              </div>

              {/* Items in this loan */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  Daftar Alat yang Dikembalikan:
                </span>
                <div className="divide-y divide-slate-200/60">
                  {selectedLoan.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{item.namaAlat}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">Kode: {item.kodeAlat}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{item.jumlah} Unit</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspection Condition Selector */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-slate-700 font-semibold">
                  Hasil Pemeriksaan Fisik & Fungsi Alat *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKondisi('LENGKAP_BAIK')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      kondisi === 'LENGKAP_BAIK'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold">Lengkap & Normal</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Tidak ada denda kerusakan</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKondisi('RUSAK_RINGAN')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      kondisi === 'RUSAK_RINGAN'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold">Rusak Ringan</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Goresan/konektor kendur (+Rp 75.000)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKondisi('KOMPONEN_HILANG')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      kondisi === 'KOMPONEN_HILANG'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold">Komponen Hilang</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Probe / adapter / baut (+Rp 150.000)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setKondisi('RUSAK_BERAT')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      kondisi === 'RUSAK_BERAT'
                        ? 'border-rose-700 bg-rose-100 text-rose-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold">Rusak Berat</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Komponen mati (+Rp 350.000)</div>
                  </button>
                </div>
              </div>

              {/* Fines Summary Card */}
              {(() => {
                const { diffDays, dendaTelat } = calcLateInfo(selectedLoan);
                const total = dendaTelat + Number(dendaKerusakan);

                return (
                  <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <Calculator className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Kalkulasi Denda Laboratorium
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Keterlambatan</span>
                        <span className="text-white font-bold">{diffDays} Hari ({formatRupiah(dendaTelat)})</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Denda Kerusakan</span>
                        <input
                          type="number"
                          min={0}
                          value={dendaKerusakan}
                          onChange={(e) => setDendaKerusakan(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-teal-300 font-bold text-xs"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block text-[11px]">Total Tagihan</span>
                        <span className="text-teal-400 font-bold text-sm">{formatRupiah(total)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Verification Notes & Officer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Petugas Penerima Laboratorium *
                  </label>
                  <input
                    type="text"
                    required
                    value={petugasPemeriksa}
                    onChange={(e) => setPetugasPemeriksa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Catatan Pemeriksaan Pengembalian
                  </label>
                  <input
                    type="text"
                    value={catatanPemeriksaan}
                    onChange={(e) => setCatatanPemeriksaan(e.target.value)}
                    placeholder="Kondisi bersih, fungsi normal..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLoan(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Konfirmasi Pengembalian Selesai
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
