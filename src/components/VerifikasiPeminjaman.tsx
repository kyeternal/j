import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { Peminjaman, StatusPeminjaman } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  FileCheck, 
  Printer, 
  Check, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Package,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VerifikasiPeminjaman: React.FC = () => {
  const { 
    peminjamanList, 
    approvePeminjaman, 
    rejectPeminjaman, 
    handoverPeminjaman,
    currentUser,
    setPrintData,
    setIsPrintModalOpen,
    setActiveTab,
    setSelectedTicketForReturn
  } = useLab();

  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('MENUNGGU_VERIFIKASI');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedLoanForReview, setSelectedLoanForReview] = useState<Peminjaman | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');

  // Handover modal
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverOfficer, setHandoverOfficer] = useState(currentUser.name);
  const [checklistAccessories, setChecklistAccessories] = useState<Record<string, boolean>>({});

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

  // Filter list
  const filteredList = peminjamanList.filter((loan) => {
    const matchesSearch = 
      loan.kodeTiket.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.namaPeminjam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.nimNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.judulKegiatan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      selectedStatusTab === 'ALL' || loan.status === selectedStatusTab;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = (loan: Peminjaman) => {
    approvePeminjaman(loan.id, approvalNote || 'Permohonan disetujui, silakan ambil alat di ruang laboratorium terkait.');
    setSelectedLoanForReview(null);
    setApprovalNote('');
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  const handleOpenReject = (loan: Peminjaman) => {
    setSelectedLoanForReview(loan);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedLoanForReview) return;
    if (!rejectReason.trim()) {
      alert('Mohon cantumkan alasan penolakan permohonan.');
      return;
    }
    rejectPeminjaman(selectedLoanForReview.id, rejectReason);
    setIsRejectModalOpen(false);
    setSelectedLoanForReview(null);
    setRejectReason('');
  };

  const handleOpenHandover = (loan: Peminjaman) => {
    setSelectedLoanForReview(loan);
    setHandoverOfficer(currentUser.name);
    // Initialize checklist
    const initialCheck: Record<string, boolean> = {};
    loan.items.forEach((item) => {
      item.aksesoris.forEach((acc, i) => {
        initialCheck[`${item.alatId}-${i}`] = true;
      });
    });
    setChecklistAccessories(initialCheck);
    setIsHandoverModalOpen(true);
  };

  const handleConfirmHandover = () => {
    if (!selectedLoanForReview) return;
    handoverPeminjaman(selectedLoanForReview.id, handoverOfficer);
    setIsHandoverModalOpen(false);
    setSelectedLoanForReview(null);
  };

  const counts = {
    menunggu: peminjamanList.filter(p => p.status === 'MENUNGGU_VERIFIKASI').length,
    disetujui: peminjamanList.filter(p => p.status === 'DISETUJUI').length,
    dipinjam: peminjamanList.filter(p => p.status === 'SEDANG_DIPINJAM').length,
    terlambat: peminjamanList.filter(p => p.status === 'TERLAMBAT').length,
    selesai: peminjamanList.filter(p => p.status === 'SELESAI').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Verifikasi & Persetujuan Peminjaman
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validasi ketersediaan unit, pemeriksaan kelengkapan aksesoris, persetujuan dan serah terima instrumen lab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (selectedLoanForReview) {
                setPrintData(selectedLoanForReview);
                setIsPrintModalOpen(true);
              } else if (peminjamanList[0]) {
                setPrintData(peminjamanList[0]);
                setIsPrintModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Slip / Form Fisik</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => setSelectedStatusTab('MENUNGGU_VERIFIKASI')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedStatusTab === 'MENUNGGU_VERIFIKASI'
              ? 'bg-slate-900 text-white font-bold'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Menunggu Persetujuan</span>
          {counts.menunggu > 0 && (
            <span className="font-mono text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
              {counts.menunggu}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('DISETUJUI')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedStatusTab === 'DISETUJUI'
              ? 'bg-slate-900 text-white font-bold'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Disetujui (Siap Diambil)</span>
          {counts.disetujui > 0 && (
            <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
              {counts.disetujui}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('SEDANG_DIPINJAM')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedStatusTab === 'SEDANG_DIPINJAM'
              ? 'bg-slate-900 text-white font-bold'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Sedang Dipinjam ({counts.dipinjam})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('TERLAMBAT')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedStatusTab === 'TERLAMBAT'
              ? 'bg-rose-700 text-white font-bold'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <span>Terlambat Jatuh Tempo</span>
          {counts.terlambat > 0 && (
            <span className="font-mono text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded-full font-bold">
              {counts.terlambat}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('SELESAI')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedStatusTab === 'SELESAI'
              ? 'bg-slate-900 text-white font-bold'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Selesai Dikembalikan ({counts.selesai})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedStatusTab === 'ALL'
              ? 'bg-slate-900 text-white font-bold'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Tiket ({peminjamanList.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nomor tiket, nama peminjam, atau judul riset..."
          className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
        />
      </div>

      {/* Tickets List */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">Tidak ada tiket di kategori ini</h3>
          <p className="text-xs text-slate-500 mt-1">
            Semua permohonan pada status ini telah diproses atau belum ada pengajuan baru.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((loan) => {
            const isPending = loan.status === 'MENUNGGU_VERIFIKASI';
            const isApproved = loan.status === 'DISETUJUI';
            const isActive = loan.status === 'SEDANG_DIPINJAM';
            const isOverdue = loan.status === 'TERLAMBAT';

            return (
              <div 
                key={loan.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                      {loan.kodeTiket}
                    </span>
                    <span className="text-xs text-slate-500">
                      Diajukan: {formatDate(loan.tanggalPengajuan)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      isPending ? 'bg-amber-100 text-amber-800' :
                      isApproved ? 'bg-blue-100 text-blue-800' :
                      isActive ? 'bg-emerald-100 text-emerald-800' :
                      isOverdue ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Peminjam</span>
                    <span className="font-semibold text-slate-900 block mt-0.5">{loan.namaPeminjam}</span>
                    <span className="text-slate-500 font-mono text-[11px] block">{loan.nimNip} · {loan.prodiDepartemen}</span>
                    <span className="text-slate-500 text-[11px] block">WA: {loan.noHp}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Keperluan & Pembimbing</span>
                    <span className="font-semibold text-slate-900 block mt-0.5">{loan.keperluan}</span>
                    <span className="text-slate-600 text-[11px] block line-clamp-1 italic">"{loan.judulKegiatan}"</span>
                    <span className="text-slate-500 text-[11px] block">Dosen: {loan.dosenPembimbing}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Jadwal Durasi Peminjaman</span>
                    <span className="font-mono font-semibold text-slate-900 block mt-0.5">
                      {loan.tanggalPinjam} &rarr; {loan.tanggalRencanaKembali}
                    </span>
                    {loan.totalDenda > 0 && (
                      <span className="text-rose-600 font-mono font-bold block mt-1">
                        Denda: {formatRupiah(loan.totalDenda)} ({loan.statusPembayaranDenda})
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Box */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Instrumen yang Dipinjam ({loan.items.length} item):
                  </span>
                  <div className="space-y-1">
                    {loan.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-800 font-medium">
                          • {item.namaAlat} <span className="font-mono text-slate-500">({item.kodeAlat})</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900">{item.jumlah} unit</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification notes if present */}
                {loan.catatanVerifikasi && (
                  <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded border border-amber-200">
                    <strong className="text-amber-900">Catatan Petugas:</strong> {loan.catatanVerifikasi}
                    {loan.disetujuiOleh && <span className="block text-[11px] text-slate-500 mt-0.5 font-mono">Diverifikasi oleh: {loan.disetujuiOleh}</span>}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintData(loan);
                      setIsPrintModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Cetak Lembar Tiket</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(loan)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(loan)}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs transition-colors"
                        >
                          Setujui Permohonan
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        onClick={() => handleOpenHandover(loan)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-2xs transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Serah Terima Fisik (Check-Out)</span>
                      </button>
                    )}

                    {(isActive || isOverdue) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicketForReturn(loan.kodeTiket);
                          setActiveTab('pengembalian');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                      >
                        <span>Proses Pengembalian &rarr;</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedLoanForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Tolak Permohonan Peminjaman
            </h3>
            <p className="text-xs text-slate-600">
              Tiket <strong className="font-mono">{selectedLoanForReview.kodeTiket}</strong> atas nama {selectedLoanForReview.namaPeminjam}.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Penolakan *
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Alat sedang diprioritaskan untuk akreditasi, atau jadwal bentrok dengan praktikum reguler..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover (Check-Out) Checklist Modal */}
      {isHandoverModalOpen && selectedLoanForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Berita Acara Serah Terima Fisik (Check-Out)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Tiket: {selectedLoanForReview.kodeTiket}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHandoverModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <p><strong>Peminjam:</strong> {selectedLoanForReview.namaPeminjam} ({selectedLoanForReview.nimNip})</p>
              <p><strong>Batas Kembali:</strong> {selectedLoanForReview.tanggalRencanaKembali}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Checklist Fisik & Kelengkapan Aksesoris:
              </h4>

              {selectedLoanForReview.items.map((item) => (
                <div key={item.alatId} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="font-semibold text-xs text-slate-900 flex justify-between">
                    <span>{item.namaAlat}</span>
                    <span className="font-mono text-teal-700">{item.jumlah} unit</span>
                  </div>

                  <div className="space-y-1 pl-2">
                    {item.aksesoris.map((acc, i) => {
                      const key = `${item.alatId}-${i}`;
                      return (
                        <label key={i} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!checklistAccessories[key]}
                            onChange={(e) => setChecklistAccessories(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="rounded border-slate-300 text-slate-900"
                          />
                          <span>{acc}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Petugas Laboran yang Menyerahkan
              </label>
              <input
                type="text"
                value={handoverOfficer}
                onChange={(e) => setHandoverOfficer(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsHandoverModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmHandover}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm"
              >
                Konfirmasi Serah Terima Barang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
