export type KondisiAlat = 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'DALAM_PERAWATAN';

export interface Alat {
  id: string;
  kode: string;
  nama: string;
  kategoriId: string;
  merkModel: string;
  spesifikasi: string;
  lokasiRak: string;
  kondisi: KondisiAlat;
  totalStok: number;
  stokTersedia: number;
  fotoUrl: string;
  tanggalPengadaan: string;
  hargaPerkiraan: number;
  aksesoris: string[];
}

export interface Kategori {
  id: string;
  nama: string;
  deskripsi: string;
  penanggungJawab: string;
  ruangan: string;
  kodePrefix: string;
}

export type PeranPeminjam = 'MAHASISWA' | 'DOSEN' | 'ASISTEN_PENELITI' | 'UMUM';

export type KeperluanPeminjaman = 'PRAKTIKUM' | 'TUGAS_AKHIR' | 'PENELITIAN' | 'LOMBA_PROYEK' | 'LAINNYA';

export type StatusPeminjaman = 
  | 'MENUNGGU_VERIFIKASI'
  | 'DISETUJUI'
  | 'DITOLAK'
  | 'SEDANG_DIPINJAM'
  | 'SELESAI'
  | 'TERLAMBAT';

export interface ItemPeminjaman {
  alatId: string;
  kodeAlat: string;
  namaAlat: string;
  jumlah: number;
  kondisiAwal: string;
  aksesoris: string[];
}

export interface Peminjaman {
  id: string;
  kodeTiket: string;
  namaPeminjam: string;
  nimNip: string;
  peran: PeranPeminjam;
  email: string;
  noHp: string;
  prodiDepartemen: string;
  keperluan: KeperluanPeminjaman;
  judulKegiatan: string;
  dosenPembimbing: string;
  items: ItemPeminjaman[];
  tanggalPengajuan: string;
  tanggalPinjam: string;
  tanggalRencanaKembali: string;
  tanggalAktualKembali?: string;
  status: StatusPeminjaman;
  catatanVerifikasi?: string;
  alasanPenolakan?: string;
  disetujuiOleh?: string;
  serahTerimaOleh?: string;
  diterimaKembaliOleh?: string;
  dendaKeterlambatan: number;
  dendaKerusakan: number;
  totalDenda: number;
  statusPembayaranDenda?: 'LUNAS' | 'BELUM_LUNAS' | 'TIDAK_ADA';
  kondisiPengembalian?: 'LENGKAP_BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'KOMPONEN_HILANG';
  catatanPengembalian?: string;
}

export type JenisPerawatan = 
  | 'RUTIN_KALIBRASI' 
  | 'PERBAIKAN_KERUSAKAN' 
  | 'PENGGANTIAN_SPAREPART' 
  | 'INSPEKSI_KEAMANAN';

export type StatusPerawatan = 'DIJADWALKAN' | 'DALAM_PROSES' | 'SELESAI';

export interface Perawatan {
  id: string;
  alatId: string;
  kodeAlat: string;
  namaAlat: string;
  jenisPerawatan: JenisPerawatan;
  tanggalMulai: string;
  estimasiSelesai: string;
  tanggalSelesai?: string;
  teknisiVendor: string;
  biaya: number;
  status: StatusPerawatan;
  catatan: string;
  hasilPemeriksaan?: string;
}

export type UserRole = 'ADMIN_LAB' | 'ASISTEN_LAB' | 'MAHASISWA' | 'DOSEN';

export interface UserSession {
  role: UserRole;
  name: string;
  nimNip: string;
  email: string;
  prodi: string;
  noHp: string;
}

export interface CartItem {
  alat: Alat;
  jumlah: number;
}
