import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { Alat, KondisiAlat } from '../types';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  ShoppingBag, 
  QrCode, 
  Info, 
  Edit3, 
  Trash2, 
  Check, 
  Package,
  Layers,
  MapPin,
  Tag,
  X,
  Printer,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const KatalogAlat: React.FC = () => {
  const { 
    alatList, 
    kategoriList, 
    addToCart, 
    cart, 
    currentUser, 
    addAlat, 
    updateAlat, 
    deleteAlat,
    selectedAlatForDetail,
    setSelectedAlatForDetail,
    setActiveTab,
    peminjamanList
  } = useLab();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [selectedKondisi, setSelectedKondisi] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingAlat, setEditingAlat] = useState<Alat | null>(null);
  const [qrModalAlat, setQrModalAlat] = useState<Alat | null>(null);
  const [deleteConfirmAlat, setDeleteConfirmAlat] = useState<Alat | null>(null);

  // Form states for Add/Edit
  const [formNama, setFormNama] = useState('');
  const [formKode, setFormKode] = useState('');
  const [formKategoriId, setFormKategoriId] = useState('');
  const [formMerk, setFormMerk] = useState('');
  const [formSpesifikasi, setFormSpesifikasi] = useState('');
  const [formLokasiRak, setFormLokasiRak] = useState('');
  const [formKondisi, setFormKondisi] = useState<KondisiAlat>('BAIK');
  const [formTotalStok, setFormTotalStok] = useState(1);
  const [formHarga, setFormHarga] = useState(1000000);
  const [formAksesoris, setFormAksesoris] = useState('Kabel Power, Manual Book');

  const openAddModal = () => {
    setEditingAlat(null);
    setFormNama('');
    setFormKode(`ALT-${kategoriList[0]?.kodePrefix || 'GEN'}-${Math.floor(100 + Math.random() * 900)}`);
    setFormKategoriId(kategoriList[0]?.id || '');
    setFormMerk('');
    setFormSpesifikasi('');
    setFormLokasiRak('Lemari A / Rak 1');
    setFormKondisi('BAIK');
    setFormTotalStok(2);
    setFormHarga(5000000);
    setFormAksesoris('Kabel Power, Box Kontainer');
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (alat: Alat) => {
    setEditingAlat(alat);
    setFormNama(alat.nama);
    setFormKode(alat.kode);
    setFormKategoriId(alat.kategoriId);
    setFormMerk(alat.merkModel);
    setFormSpesifikasi(alat.spesifikasi);
    setFormLokasiRak(alat.lokasiRak);
    setFormKondisi(alat.kondisi);
    setFormTotalStok(alat.totalStok);
    setFormHarga(alat.hargaPerkiraan);
    setFormAksesoris(alat.aksesoris.join(', '));
    setIsAddEditModalOpen(true);
  };

  const handleSaveAlat = (e: React.FormEvent) => {
    e.preventDefault();
    const aksesorisArray = formAksesoris.split(',').map(s => s.trim()).filter(Boolean);

    if (editingAlat) {
      // Calculate adjusted available stock
      const stockDiff = formTotalStok - editingAlat.totalStok;
      const newAvailable = Math.max(0, editingAlat.stokTersedia + stockDiff);

      updateAlat(editingAlat.id, {
        nama: formNama,
        kode: formKode,
        kategoriId: formKategoriId,
        merkModel: formMerk,
        spesifikasi: formSpesifikasi,
        lokasiRak: formLokasiRak,
        kondisi: formKondisi,
        totalStok: formTotalStok,
        stokTersedia: newAvailable,
        hargaPerkiraan: Number(formHarga),
        aksesoris: aksesorisArray,
      });
    } else {
      addAlat({
        kode: formKode,
        nama: formNama,
        kategoriId: formKategoriId,
        merkModel: formMerk,
        spesifikasi: formSpesifikasi,
        lokasiRak: formLokasiRak,
        kondisi: formKondisi,
        totalStok: Number(formTotalStok),
        stokTersedia: Number(formTotalStok),
        fotoUrl: '',
        tanggalPengadaan: new Date().toISOString().split('T')[0],
        hargaPerkiraan: Number(formHarga),
        aksesoris: aksesorisArray,
      });
    }

    setIsAddEditModalOpen(false);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Filtered List
  const filteredAlat = alatList.filter((item) => {
    const matchesSearch = 
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.merkModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasiRak.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesKat = selectedKategori === 'ALL' || item.kategoriId === selectedKategori;
    const matchesKondisi = selectedKondisi === 'ALL' || item.kondisi === selectedKondisi;

    return matchesSearch && matchesKat && matchesKondisi;
  });

  const getKategoriName = (id: string) => {
    return kategoriList.find(k => k.id === id)?.nama || 'Laboratorium Umum';
  };

  const isItemInCart = (id: string) => cart.some(c => c.alat.id === id);

  return (
    <div className="space-y-6">
      
      {/* Header & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Katalog Inventaris Alat Laboratorium
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar lengkap instrumen, ketersediaan unit real-time, lokasi penyimpanan, dan barcode identifikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(currentUser.role === 'ADMIN_LAB' || currentUser.role === 'ASISTEN_LAB') && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Alat Baru</span>
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Tampilan Kartu Grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Tampilan Tabel Rinci"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama alat, kode (ALT-...), merk, atau rak..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              aria-label="Filter Laboratorium / Kategori"
              className="px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">Semua Laboratorium</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.nama}
                </option>
              ))}
            </select>

            <select
              value={selectedKondisi}
              onChange={(e) => setSelectedKondisi(e.target.value)}
              aria-label="Filter Kondisi Alat"
              className="px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">Semua Kondisi</option>
              <option value="BAIK">Kondisi Baik</option>
              <option value="DALAM_PERAWATAN">Dalam Perawatan</option>
              <option value="RUSAK_RINGAN">Rusak Ringan</option>
              <option value="RUSAK_BERAT">Rusak Berat</option>
            </select>
          </div>

        </div>

        {/* Category Fast Filter Tabs (Button-based segmented control) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedKategori('ALL')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
              selectedKategori === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({alatList.length})
          </button>
          {kategoriList.map((kat) => {
            const count = alatList.filter(a => a.kategoriId === kat.id).length;
            const isSelected = selectedKategori === kat.id;
            return (
              <button
                key={kat.id}
                type="button"
                onClick={() => setSelectedKategori(kat.id)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {kat.nama.replace('Lab ', '')} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment Display (Grid or Table) */}
      {filteredAlat.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">Tidak ada alat yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan pilihan filter kategori dan kondisi.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedKategori('ALL');
              setSelectedKondisi('ALL');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAlat.map((alat) => {
            const inCart = isItemInCart(alat.id);
            const isAvailable = alat.stokTersedia > 0 && alat.kondisi !== 'DALAM_PERAWATAN';

            return (
              <div 
                key={alat.id} 
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col group"
              >
                {/* Photo or Styled Resilient Fallback */}
                <div className="relative aspect-4/3 bg-slate-100 border-b border-slate-100 overflow-hidden">
                  {alat.fotoUrl ? (
                    <img 
                      src={alat.fotoUrl} 
                      alt={alat.nama} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-radial from-slate-100 to-slate-200 text-slate-400">
                      <Package className="w-10 h-10 mb-1 stroke-1" />
                      <span className="text-[11px] font-mono text-slate-500">{alat.kode}</span>
                    </div>
                  )}

                  {/* Stock pill-free text overlay or badge */}
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded font-medium shadow-xs">
                    Stok: <span className="text-teal-300 font-bold">{alat.stokTersedia}</span>/{alat.totalStok}
                  </div>

                  {/* Condition indicator if maintenance */}
                  {alat.kondisi === 'DALAM_PERAWATAN' && (
                    <div className="absolute top-2.5 left-2.5 bg-amber-600/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-medium shadow-xs">
                      Dalam Kalibrasi
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>{alat.kode}</span>
                      <span className="truncate max-w-[120px]">{getKategoriName(alat.kategoriId)}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {alat.nama}
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {alat.merkModel}
                    </p>

                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{alat.lokasiRak}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedAlatForDetail(alat)}
                        title="Lihat Rincian & Riwayat"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrModalAlat(alat)}
                        title="Lihat & Cetak QR Code Alat"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      {(currentUser.role === 'ADMIN_LAB' || currentUser.role === 'ASISTEN_LAB') && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditModal(alat)}
                            title="Edit Alat"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmAlat(alat)}
                            title="Hapus Alat"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => addToCart(alat, 1)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        !isAvailable
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : inCart
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-teal-600" />
                          <span>Ditambahkan</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isAvailable ? '+ Pinjam' : 'Habis'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* High Density Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Kode & Alat</th>
                  <th className="py-3 px-4">Laboratorium</th>
                  <th className="py-3 px-4">Merk & Model</th>
                  <th className="py-3 px-4">Lokasi Rak</th>
                  <th className="py-3 px-4">Kondisi</th>
                  <th className="py-3 px-4 font-mono text-center">Tersedia / Total</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlat.map((alat) => {
                  const inCart = isItemInCart(alat.id);
                  const isAvailable = alat.stokTersedia > 0 && alat.kondisi !== 'DALAM_PERAWATAN';

                  return (
                    <tr key={alat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{alat.nama}</div>
                        <div className="text-[11px] font-mono text-slate-500">{alat.kode}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {getKategoriName(alat.kategoriId)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {alat.merkModel}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {alat.lokasiRak}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-mono ${
                          alat.kondisi === 'BAIK' 
                            ? 'text-teal-700 font-semibold' 
                            : alat.kondisi === 'DALAM_PERAWATAN'
                            ? 'text-amber-700 font-semibold'
                            : 'text-rose-700 font-semibold'
                        }`}>
                          {alat.kondisi === 'BAIK' ? 'Baik / Siap' : alat.kondisi === 'DALAM_PERAWATAN' ? 'Kalibrasi' : alat.kondisi}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">
                        <span className="font-bold text-slate-900">{alat.stokTersedia}</span>
                        <span className="text-slate-400"> / {alat.totalStok}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAlatForDetail(alat)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                            title="Detail"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrModalAlat(alat)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                            title="QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => addToCart(alat, 1)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded ${
                              !isAvailable
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : inCart
                                ? 'bg-teal-50 text-teal-800'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {inCart ? 'Dipilih' : '+ Pinjam'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Detail Modal */}
      {selectedAlatForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-slate-400">{selectedAlatForDetail.kode}</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedAlatForDetail.nama}
                </h3>
                <p className="text-xs text-slate-500">{selectedAlatForDetail.merkModel}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlatForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAlatForDetail.fotoUrl && (
              <div className="aspect-16/9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img 
                  src={selectedAlatForDetail.fotoUrl} 
                  alt={selectedAlatForDetail.nama} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Laboratorium</span>
                <span className="text-slate-900 font-semibold mt-0.5 block">{getKategoriName(selectedAlatForDetail.kategoriId)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Lokasi Rak Penyimpanan</span>
                <span className="text-slate-900 font-semibold font-mono mt-0.5 block">{selectedAlatForDetail.lokasiRak}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Ketersediaan Stok</span>
                <span className="text-slate-900 font-semibold font-mono mt-0.5 block">
                  {selectedAlatForDetail.stokTersedia} unit tersedia (Total {selectedAlatForDetail.totalStok})
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Nilai Inventaris Perkiraan</span>
                <span className="text-slate-900 font-semibold font-mono mt-0.5 block">{formatRupiah(selectedAlatForDetail.hargaPerkiraan)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Spesifikasi Teknis
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-mono">
                {selectedAlatForDetail.spesifikasi}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Daftar Aksesoris & Kelengkapan Standar
              </h4>
              <ul className="text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedAlatForDetail.aksesoris.map((aks, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded border border-slate-200">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{aks}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent loan usage for this equipment */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Riwayat Peminjaman Terakhir Alat Ini
              </h4>
              {peminjamanList.filter(p => p.items.some(i => i.alatId === selectedAlatForDetail.id)).length === 0 ? (
                <p className="text-xs text-slate-500 italic">Belum ada riwayat peminjaman.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {peminjamanList
                    .filter(p => p.items.some(i => i.alatId === selectedAlatForDetail.id))
                    .slice(0, 3)
                    .map(p => (
                      <div key={p.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-900">{p.namaPeminjam}</span>
                          <span className="text-slate-500 font-mono text-[11px] block">{p.kodeTiket} · {p.tanggalPinjam}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-600">{p.status}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setQrModalAlat(selectedAlatForDetail);
                  setSelectedAlatForDetail(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                <QrCode className="w-4 h-4" />
                <span>Lihat Barcode Label</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(selectedAlatForDetail, 1);
                  setSelectedAlatForDetail(null);
                }}
                disabled={selectedAlatForDetail.stokTersedia <= 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg"
              >
                + Tambah ke Keranjang Pinjam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Barcode Modal */}
      {qrModalAlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Label Barcode Aset Lab</h3>
              <button
                type="button"
                onClick={() => setQrModalAlat(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block mx-auto">
              {/* Simulated crisp SVG QR code matrix */}
              <div className="w-44 h-44 bg-white p-3 border border-slate-300 rounded flex flex-col items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="28" height="28" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" />

                  <rect x="67" y="5" width="28" height="28" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" />

                  <rect x="5" y="67" width="28" height="28" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" />

                  {/* QR Data Dots */}
                  <rect x="40" y="8" width="6" height="6" />
                  <rect x="50" y="12" width="6" height="6" />
                  <rect x="42" y="24" width="6" height="6" />
                  <rect x="52" y="28" width="6" height="6" />
                  
                  <rect x="8" y="42" width="6" height="6" />
                  <rect x="20" y="48" width="6" height="6" />
                  <rect x="36" y="40" width="8" height="8" />
                  <rect x="48" y="44" width="6" height="6" />
                  <rect x="60" y="40" width="8" height="8" />
                  <rect x="74" y="44" width="6" height="6" />
                  <rect x="86" y="40" width="6" height="6" />

                  <rect x="40" y="60" width="6" height="6" />
                  <rect x="54" y="62" width="8" height="8" />
                  <rect x="68" y="58" width="6" height="6" />
                  <rect x="80" y="66" width="6" height="6" />

                  <rect x="42" y="76" width="8" height="8" />
                  <rect x="56" y="80" width="6" height="6" />
                  <rect x="70" y="76" width="8" height="8" />
                  <rect x="84" y="82" width="6" height="6" />
                </svg>
              </div>
              <div className="mt-2 font-mono font-bold text-xs text-slate-900 tracking-wider">
                {qrModalAlat.kode}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-900">{qrModalAlat.nama}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{qrModalAlat.lokasiRak}</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Label Stiker</span>
              </button>
              <button
                type="button"
                onClick={() => setQrModalAlat(null)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Equipment Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingAlat ? 'Edit Data Alat Laboratorium' : 'Pendaftaran Aset Alat Laboratorium Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlat} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kode Inventaris Alat</label>
                  <input
                    type="text"
                    required
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900"
                    placeholder="ALT-ELK-001"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Laboratorium / Kategori</label>
                  <select
                    value={formKategoriId}
                    onChange={(e) => setFormKategoriId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                  >
                    {kategoriList.map(kat => (
                      <option key={kat.id} value={kat.id}>{kat.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Alat</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                  placeholder="Contoh: Digital Storage Oscilloscope 4-Channel"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Merk & Tipe/Model</label>
                  <input
                    type="text"
                    required
                    value={formMerk}
                    onChange={(e) => setFormMerk(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                    placeholder="Contoh: Siglent SDS2304X Plus"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lokasi Rak / Lemari</label>
                  <input
                    type="text"
                    required
                    value={formLokasiRak}
                    onChange={(e) => setFormLokasiRak(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900"
                    placeholder="Contoh: Lemari E-02 / Rak 1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Spesifikasi Teknis Singkat</label>
                <textarea
                  rows={2}
                  required
                  value={formSpesifikasi}
                  onChange={(e) => setFormSpesifikasi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                  placeholder="Bandwidth, range tegangan, resolusi..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kelengkapan Aksesoris (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={formAksesoris}
                  onChange={(e) => setFormAksesoris(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                  placeholder="Probe x2, Kabel Power, Adapter, Hardcase"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jumlah Stok Unit</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formTotalStok}
                    onChange={(e) => setFormTotalStok(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kondisi Alat</label>
                  <select
                    value={formKondisi}
                    onChange={(e) => setFormKondisi(e.target.value as KondisiAlat)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="BAIK">Baik</option>
                    <option value="RUSAK_RINGAN">Rusak Ringan</option>
                    <option value="DALAM_PERAWATAN">Dalam Perawatan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Harga Perkiraan (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={formHarga}
                    onChange={(e) => setFormHarga(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold"
                >
                  {editingAlat ? 'Simpan Perubahan' : 'Daftarkan Alat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmAlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Hapus Alat Laboratorium?</h3>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus <strong className="text-slate-900">{deleteConfirmAlat.nama}</strong> ({deleteConfirmAlat.kode})? Data yang dihapus tidak dapat dipulihkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAlat(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAlat(deleteConfirmAlat.id);
                  setDeleteConfirmAlat(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
