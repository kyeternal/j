import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { ItemPeminjaman, PeranPeminjam, KeperluanPeminjaman, Peminjaman } from '../types';
import { 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Plus, 
  ArrowRight,
  ShieldAlert,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FormPeminjamanProps {
  onSuccessViewTicket?: (ticket: Peminjaman) => void;
}

export const FormPeminjaman: React.FC<FormPeminjamanProps> = ({ onSuccessViewTicket }) => {
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    submitPeminjaman, 
    currentUser, 
    alatList, 
    setActiveTab,
    setPrintData,
    setIsPrintModalOpen
  } = useLab();

  // Form State
  const [namaPeminjam, setNamaPeminjam] = useState(currentUser.name);
  const [nimNip, setNimNip] = useState(currentUser.nimNip);
  const [peran, setPeran] = useState<PeranPeminjam>(currentUser.role === 'DOSEN' ? 'DOSEN' : 'MAHASISWA');
  const [email, setEmail] = useState(currentUser.email);
  const [noHp, setNoHp] = useState(currentUser.noHp);
  const [prodiDepartemen, setProdiDepartemen] = useState(currentUser.prodi);
  const [keperluan, setKeperluan] = useState<KeperluanPeminjaman>('TUGAS_AKHIR');
  const [judulKegiatan, setJudulKegiatan] = useState('');
  const [dosenPembimbing, setDosenPembimbing] = useState('Ir. Hendra Wijaya, M.T.');

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [tanggalPinjam, setTanggalPinjam] = useState(todayStr);
  const [tanggalRencanaKembali, setTanggalRencanaKembali] = useState(nextWeekStr);
  const [agreeRules, setAgreeRules] = useState(true);

  // Success ticket created state
  const [createdTicket, setCreatedTicket] = useState<Peminjaman | null>(null);

  // Calculate day difference
  const calcDays = () => {
    try {
      const start = new Date(tanggalPinjam).getTime();
      const end = new Date(tanggalRencanaKembali).getTime();
      const diff = Math.round((end - start) / (1000 * 3600 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const daysCount = calcDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Pilih setidaknya 1 alat laboratorium untuk dipinjam.');
      return;
    }

    if (daysCount <= 0) {
      alert('Tanggal pengembalian harus setelah tanggal peminjaman.');
      return;
    }

    const items: ItemPeminjaman[] = cart.map(item => ({
      alatId: item.alat.id,
      kodeAlat: item.alat.kode,
      namaAlat: item.alat.nama,
      jumlah: item.jumlah,
      kondisiAwal: `Baik (${item.alat.kondisi}), lengkap aksesoris`,
      aksesoris: item.alat.aksesoris,
    }));

    const result = submitPeminjaman({
      namaPeminjam,
      nimNip,
      peran,
      email,
      noHp,
      prodiDepartemen,
      keperluan,
      judulKegiatan: judulKegiatan.trim() || 'Praktikum & Analisis Laboratorium',
      dosenPembimbing,
      items,
      tanggalPinjam,
      tanggalRencanaKembali,
    });

    setCreatedTicket(result);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  if (createdTicket) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto border border-teal-200">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-teal-800 tracking-wider">
            PERMOHONAN BERHASIL DIAJUKAN
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Nomor Tiket: <span className="font-mono">{createdTicket.kodeTiket}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Permohonan peminjaman Anda telah tercatat dan masuk ke antrean verifikasi petugas laboratorium.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Peminjam:</span>
            <span className="text-slate-900 font-semibold">{createdTicket.namaPeminjam} ({createdTicket.nimNip})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jadwal Pinjam:</span>
            <span className="text-slate-900 font-semibold">{createdTicket.tanggalPinjam} s/d {createdTicket.tanggalRencanaKembali}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jumlah Instrumen:</span>
            <span className="text-slate-900 font-semibold">{createdTicket.items.length} jenis alat</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status Awal:</span>
            <span className="text-amber-700 font-semibold">Menunggu Verifikasi Asisten/Admin Lab</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              setPrintData(createdTicket);
              setIsPrintModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Bukti Peminjaman (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreatedTicket(null);
              setActiveTab('verifikasi');
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span>Buka Halaman Verifikasi &rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Formulir Permohonan Peminjaman Alat
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lengkapi identitas penanggung jawab, jadwal peminjaman, dan verifikasi ketersediaan unit laboratorium.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Selected Items Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                1. Daftar Instrumen yang Akan Dipinjam ({cart.length})
              </h2>
              <p className="text-xs text-slate-500">
                Alat yang dipilih dari katalog inventaris laboratorium.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setActiveTab('katalog')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah dari Katalog</span>
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p className="text-xs text-slate-500">
                Keranjang peminjaman masih kosong. Silakan buka katalog untuk memilih instrumen yang dibutuhkan.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('katalog')}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Pilih Alat di Katalog &rarr;
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.alat.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      {item.alat.fotoUrl ? (
                        <img 
                          src={item.alat.fotoUrl} 
                          alt={item.alat.nama} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-400">
                          LAB
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.alat.nama}</h4>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                        <span>{item.alat.kode}</span>
                        <span>·</span>
                        <span>{item.alat.lokasiRak}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Aksesoris: {item.alat.aksesoris.slice(0, 2).join(', ')}...
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.alat.id, -1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-l"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-mono font-bold text-slate-900">
                        {item.jumlah}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.alat.id, 1)}
                        disabled={item.jumlah >= item.alat.stokTersedia}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-r disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.alat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Hapus dari daftar pinjam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Identitas Peminjam */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              2. Data Identitas Peminjam & Penanggung Jawab
            </h2>
            <p className="text-xs text-slate-500">
              Informasi kontak resmi untuk verifikasi dan konfirmasi pengembalian.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Peminjam *</label>
              <input
                type="text"
                required
                value={namaPeminjam}
                onChange={(e) => setNamaPeminjam(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                placeholder="Nama mahasiswa / dosen"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">NIM / NIP / NIDN *</label>
              <input
                type="text"
                required
                value={nimNip}
                onChange={(e) => setNimNip(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                placeholder="Contoh: 21/476901/BI/22819"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Peran Civitas Akademika *</label>
              <select
                value={peran}
                onChange={(e) => setPeran(e.target.value as PeranPeminjam)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              >
                <option value="MAHASISWA">Mahasiswa Sarjana / Pascasarjana</option>
                <option value="DOSEN">Dosen / Tenaga Pendidik</option>
                <option value="ASISTEN_PENELITI">Asisten Riset / Laboran</option>
                <option value="UMUM">Peneliti Eksternal / Kerjasama</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Program Studi / Departemen *</label>
              <input
                type="text"
                required
                value={prodiDepartemen}
                onChange={(e) => setProdiDepartemen(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                placeholder="Contoh: Teknik Elektro / Kimia Murni"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Alamat Email Institusi *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                placeholder="nama@mail.univ.ac.id"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nomor WhatsApp Aktif *</label>
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                placeholder="081234567890"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Keperluan & Jadwal Pinjam */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              3. Jadwal & Keperluan Peminjaman
            </h2>
            <p className="text-xs text-slate-500">
              Durasi standar peminjaman maksimal 14 hari kalender.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Keperluan Penggunaan *</label>
              <select
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value as KeperluanPeminjaman)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              >
                <option value="PRAKTIKUM">Praktikum Mata Kuliah Reguler</option>
                <option value="TUGAS_AKHIR">Tugas Akhir / Skripsi / Tesis</option>
                <option value="PENELITIAN">Penelitian Hibah & Publikasi</option>
                <option value="LOMBA_PROYEK">Kompetisi Ilmiah / Lomba Robotika</option>
                <option value="LAINNYA">Keperluan Khusus Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Dosen Pembimbing / Penanggung Jawab *</label>
              <input
                type="text"
                required
                value={dosenPembimbing}
                onChange={(e) => setDosenPembimbing(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                placeholder="Nama dosen pembimbing"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Judul Riset / Topik Praktikum *</label>
              <input
                type="text"
                required
                value={judulKegiatan}
                onChange={(e) => setJudulKegiatan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                placeholder="Contoh: Pengujian Karakteristik Sensor Ultrasonik pada Robot Bawah Air"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tanggal Mulai Pinjam *</label>
              <input
                type="date"
                required
                value={tanggalPinjam}
                onChange={(e) => setTanggalPinjam(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tanggal Rencana Kembali *</label>
              <input
                type="date"
                required
                value={tanggalRencanaKembali}
                onChange={(e) => setTanggalRencanaKembali(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Duration Indicator */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">Total Durasi Peminjaman:</span>
            <span className={`font-mono font-bold ${daysCount > 14 ? 'text-amber-700' : 'text-slate-900'}`}>
              {daysCount} Hari Kalender {daysCount > 14 && '(Memerlukan persetujuan khusus Kepala Lab)'}
            </span>
          </div>
        </div>

        {/* Step 4: Rules agreement */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreeRules}
              onChange={(e) => setAgreeRules(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="text-slate-700 leading-relaxed">
              Saya menyatakan data di atas benar, menyetujui seluruh tata tertib laboratorium, menjaga keutuhan alat dan aksesoris, serta bersedia membayar denda keterlambatan sebesar <strong>Rp 10.000 / hari</strong> apabila melewati batas waktu pengembalian.
            </span>
          </label>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('katalog')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={cart.length === 0 || !agreeRules}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Kirim Permohonan Peminjaman</span>
          </button>
        </div>

      </form>
    </div>
  );
};
