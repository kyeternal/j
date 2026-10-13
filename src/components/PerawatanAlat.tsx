import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { Perawatan, JenisPerawatan, StatusPerawatan } from '../types';
import { 
  Wrench, 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  Search, 
  AlertCircle,
  FileCheck2,
  DollarSign,
  Shield,
  X
} from 'lucide-react';

export const PerawatanAlat: React.FC = () => {
  const { 
    perawatanList, 
    alatList, 
    addPerawatan, 
    updatePerawatanStatus, 
    currentUser 
  } = useLab();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMaintForComplete, setSelectedMaintForComplete] = useState<Perawatan | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Form states
  const [formAlatId, setFormAlatId] = useState(alatList[0]?.id || '');
  const [formJenis, setFormJenis] = useState<JenisPerawatan>('RUTIN_KALIBRASI');
  const [formTanggalMulai, setFormTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [formEstimasiSelesai, setFormEstimasiSelesai] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formTeknisi, setFormTeknisi] = useState('PT. Kalibrasi Lab Mandiri');
  const [formBiaya, setFormBiaya] = useState(500000);
  const [formStatus, setFormStatus] = useState<StatusPerawatan>('DALAM_PROSES');
  const [formCatatan, setFormCatatan] = useState('Kalibrasi akurasi tahunan sesuai standar ISO/IEC 17025.');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleOpenAddModal = () => {
    setFormAlatId(alatList[0]?.id || '');
    setFormJenis('RUTIN_KALIBRASI');
    setFormTanggalMulai(new Date().toISOString().split('T')[0]);
    setFormEstimasiSelesai(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormTeknisi('Balai Standardisasi dan Kalibrasi (BSN/KAN)');
    setFormBiaya(750000);
    setFormStatus('DALAM_PROSES');
    setFormCatatan('Kalibrasi berkala dan inspeksi kelistrikan alat.');
    setIsAddModalOpen(true);
  };

  const handleSavePerawatan = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAlat = alatList.find(a => a.id === formAlatId);
    if (!targetAlat) return;

    addPerawatan({
      alatId: targetAlat.id,
      kodeAlat: targetAlat.kode,
      namaAlat: targetAlat.nama,
      jenisPerawatan: formJenis,
      tanggalMulai: formTanggalMulai,
      estimasiSelesai: formEstimasiSelesai,
      teknisiVendor: formTeknisi,
      biaya: Number(formBiaya),
      status: formStatus,
      catatan: formCatatan,
    });

    setIsAddModalOpen(false);
  };

  const handleConfirmComplete = () => {
    if (!selectedMaintForComplete) return;
    updatePerawatanStatus(
      selectedMaintForComplete.id,
      'SELESAI',
      completionNotes || 'Pemeriksaan tuntas, sertifikat kalibrasi diterbitkan, instrumen siap digunakan.'
    );
    setSelectedMaintForComplete(null);
    setCompletionNotes('');
  };

  // Filter list
  const filteredList = perawatanList.filter(item => {
    const matchesSearch = 
      item.namaAlat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kodeAlat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teknisiVendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.catatan.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Jadwal Perawatan, Kalibrasi & Servis Alat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pemeliharaan preventif, kalibrasi berkala ISO/IEC 17025, perbaikan instrumen rusak, dan log biaya laboratorium.
          </p>
        </div>

        {(currentUser.role === 'ADMIN_LAB' || currentUser.role === 'ASISTEN_LAB') && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Jadwalkan Perawatan Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari alat, vendor teknisi, atau catatan servis..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({perawatanList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('DALAM_PROSES')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              statusFilter === 'DALAM_PROSES'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dalam Proses ({perawatanList.filter(p => p.status === 'DALAM_PROSES').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('DIJADWALKAN')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              statusFilter === 'DIJADWALKAN'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dijadwalkan ({perawatanList.filter(p => p.status === 'DIJADWALKAN').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SELESAI')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              statusFilter === 'SELESAI'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Selesai ({perawatanList.filter(p => p.status === 'SELESAI').length})
          </button>
        </div>
      </div>

      {/* Maintenance Cards */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">Tidak ada jadwal perawatan</h3>
          <p className="text-xs text-slate-500 mt-1">Semua instrumen laboratorium dalam kondisi optimal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((maint) => {
            const isOngoing = maint.status === 'DALAM_PROSES';
            const isFinished = maint.status === 'SELESAI';
            const isScheduled = maint.status === 'DIJADWALKAN';

            return (
              <div 
                key={maint.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-mono text-slate-400">
                      {maint.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isOngoing ? 'bg-amber-100 text-amber-800' :
                      isFinished ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      {maint.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                    {maint.namaAlat}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 block">
                    {maint.kodeAlat}
                  </span>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jenis Layanan:</span>
                      <span className="font-semibold text-slate-700">{maint.jenisPerawatan}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Jadwal:</span>
                      <span className="text-slate-700">{maint.tanggalMulai} &rarr; {maint.estimasiSelesai}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Teknisi/Vendor:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[160px]">{maint.teknisiVendor}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-400">Biaya Layanan:</span>
                      <span className="font-bold text-slate-900">{formatRupiah(maint.biaya)}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <p className="line-clamp-2 italic font-mono text-[11px]">"{maint.catatan}"</p>
                    {maint.hasilPemeriksaan && (
                      <p className="text-teal-700 font-semibold mt-1 text-[11px] pt-1 border-t border-slate-200">
                        Hasil: {maint.hasilPemeriksaan}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status action button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isOngoing && (currentUser.role === 'ADMIN_LAB' || currentUser.role === 'ASISTEN_LAB') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMaintForComplete(maint);
                        setCompletionNotes('');
                      }}
                      className="w-full py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                      <span>Selesaikan Servis & Pulihkan Stok</span>
                    </button>
                  )}

                  {isScheduled && (currentUser.role === 'ADMIN_LAB' || currentUser.role === 'ASISTEN_LAB') && (
                    <button
                      type="button"
                      onClick={() => updatePerawatanStatus(maint.id, 'DALAM_PROSES')}
                      className="w-full py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                      Mulai Proses Servis Sekarang
                    </button>
                  )}

                  {isFinished && (
                    <span className="w-full text-center text-xs text-slate-400 font-mono py-1">
                      Servis Tuntas ({maint.tanggalSelesai || 'Selesai'})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule New Maintenance Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Jadwalkan Perawatan / Kalibrasi Alat
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerawatan} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Pilih Alat Laboratorium *
                </label>
                <select
                  value={formAlatId}
                  onChange={(e) => setFormAlatId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                >
                  {alatList.map((alat) => (
                    <option key={alat.id} value={alat.id}>
                      {alat.kode} - {alat.nama} (Stok: {alat.stokTersedia})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Jenis Tindakan *
                  </label>
                  <select
                    value={formJenis}
                    onChange={(e) => setFormJenis(e.target.value as JenisPerawatan)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="RUTIN_KALIBRASI">Kalibrasi Rutin ISO 17025</option>
                    <option value="PERBAIKAN_KERUSAKAN">Perbaikan Kerusakan</option>
                    <option value="PENGGANTIAN_SPAREPART">Penggantian Komponen</option>
                    <option value="INSPEKSI_KEAMANAN">Inspeksi Keselamatan Kerja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Status Awal *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StatusPerawatan)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="DALAM_PROSES">Sedang Dalam Proses (Kunci Stok)</option>
                    <option value="DIJADWALKAN">Dijadwalkan Masa Mendatang</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggalMulai}
                    onChange={(e) => setFormTanggalMulai(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Estimasi Selesai *
                  </label>
                  <input
                    type="date"
                    required
                    value={formEstimasiSelesai}
                    onChange={(e) => setFormEstimasiSelesai(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Teknisi / Laboratorium Vendor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTeknisi}
                    onChange={(e) => setFormTeknisi(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Estimasi Biaya Servis (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formBiaya}
                    onChange={(e) => setFormBiaya(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Catatan Pekerjaan / Lingkup Kalibrasi
                </label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold shadow-sm"
                >
                  Simpan Jadwal Perawatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Maintenance Modal */}
      {selectedMaintForComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Selesaikan Servis & Pulihkan Ketersediaan Alat
            </h3>
            <p className="text-xs text-slate-600">
              Instrumen: <strong className="text-slate-900">{selectedMaintForComplete.namaAlat}</strong> ({selectedMaintForComplete.kodeAlat}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hasil Pemeriksaan / No. Sertifikat Kalibrasi
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Contoh: Telah lulus uji akurasi ISO 17025 No. Sertifikat: CERT-2026-9812. Lensa bersih, siap pakai."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMaintForComplete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
              >
                Konfirmasi Selesai & Aktifkan Unit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
