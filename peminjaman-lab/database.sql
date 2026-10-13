-- ==========================================================
-- Database Schema: peminjaman_lab (SIMPEL-LAB Modern Upgrade)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `peminjaman_lab` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `peminjaman_lab`;

-- 1. Tabel Kategori / Laboratorium
CREATE TABLE IF NOT EXISTS `kategori` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_prefix` VARCHAR(10) NOT NULL UNIQUE,
  `nama_kategori` VARCHAR(100) NOT NULL,
  `penanggung_jawab` VARCHAR(100) NOT NULL,
  `ruangan` VARCHAR(100) NOT NULL,
  `deskripsi` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Pengguna (Multi-Role: admin, asisten, mahasiswa, dosen)
CREATE TABLE IF NOT EXISTS `pengguna` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `nim_nip` VARCHAR(50) NOT NULL,
  `role` ENUM('admin', 'asisten', 'mahasiswa', 'dosen') NOT NULL DEFAULT 'mahasiswa',
  `email` VARCHAR(100) NOT NULL,
  `no_hp` VARCHAR(20) NOT NULL,
  `prodi` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel Alat Laboratorium
CREATE TABLE IF NOT EXISTS `alat` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_alat` VARCHAR(50) NOT NULL UNIQUE,
  `kategori_id` INT NOT NULL,
  `nama_alat` VARCHAR(150) NOT NULL,
  `merk_model` VARCHAR(100) NOT NULL,
  `spesifikasi` TEXT NOT NULL,
  `lokasi_rak` VARCHAR(100) NOT NULL,
  `kondisi` ENUM('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'DALAM_PERAWATAN') NOT NULL DEFAULT 'BAIK',
  `total_stok` INT NOT NULL DEFAULT 1,
  `stok_tersedia` INT NOT NULL DEFAULT 1,
  `harga_perkiraan` DECIMAL(15,2) DEFAULT 0,
  `aksesoris` TEXT,
  `foto` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`kategori_id`) REFERENCES `kategori`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabel Peminjaman Tiket
CREATE TABLE IF NOT EXISTS `peminjaman` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_tiket` VARCHAR(50) NOT NULL UNIQUE,
  `pengguna_id` INT DEFAULT NULL,
  `nama_peminjam` VARCHAR(100) NOT NULL,
  `nim_nip` VARCHAR(50) NOT NULL,
  `peran` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `no_hp` VARCHAR(20) NOT NULL,
  `prodi_departemen` VARCHAR(100) NOT NULL,
  `keperluan` ENUM('PRAKTIKUM', 'TUGAS_AKHIR', 'PENELITIAN', 'LOMBA_PROYEK', 'LAINNYA') NOT NULL,
  `judul_kegiatan` VARCHAR(255) NOT NULL,
  `dosen_pembimbing` VARCHAR(100) NOT NULL,
  `tanggal_pinjam` DATE NOT NULL,
  `tanggal_rencana_kembali` DATE NOT NULL,
  `tanggal_aktual_kembali` DATETIME DEFAULT NULL,
  `status` ENUM('MENUNGGU_VERIFIKASI', 'DISETUJUI', 'DITOLAK', 'SEDANG_DIPINJAM', 'SELESAI', 'TERLAMBAT') NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
  `catatan_verifikasi` TEXT DEFAULT NULL,
  `alasan_penolakan` TEXT DEFAULT NULL,
  `disetujui_oleh` VARCHAR(100) DEFAULT NULL,
  `serah_terima_oleh` VARCHAR(100) DEFAULT NULL,
  `diterima_kembali_oleh` VARCHAR(100) DEFAULT NULL,
  `denda_keterlambatan` DECIMAL(12,2) DEFAULT 0,
  `denda_kerusakan` DECIMAL(12,2) DEFAULT 0,
  `total_denda` DECIMAL(12,2) DEFAULT 0,
  `status_pembayaran_denda` ENUM('LUNAS', 'BELUM_LUNAS', 'TIDAK_ADA') DEFAULT 'TIDAK_ADA',
  `kondisi_pengembalian` VARCHAR(50) DEFAULT NULL,
  `catatan_pengembalian` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Tabel Detail Item Peminjaman (Mendukung Multi-Item per Tiket)
CREATE TABLE IF NOT EXISTS `peminjaman_item` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `peminjaman_id` INT NOT NULL,
  `alat_id` INT NOT NULL,
  `jumlah` INT NOT NULL DEFAULT 1,
  `kondisi_awal` VARCHAR(100) DEFAULT 'Baik',
  `aksesoris_disertakan` TEXT DEFAULT NULL,
  FOREIGN KEY (`peminjaman_id`) REFERENCES `peminjaman`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`alat_id`) REFERENCES `alat`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabel Perawatan & Kalibrasi Alat
CREATE TABLE IF NOT EXISTS `perawatan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_perawatan` VARCHAR(50) NOT NULL UNIQUE,
  `alat_id` INT NOT NULL,
  `jenis_perawatan` ENUM('RUTIN_KALIBRASI', 'PERBAIKAN_KERUSAKAN', 'PENGGANTIAN_SPAREPART', 'INSPEKSI_KEAMANAN') NOT NULL,
  `tanggal_mulai` DATE NOT NULL,
  `estimasi_selesai` DATE NOT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `teknisi_vendor` VARCHAR(150) NOT NULL,
  `biaya` DECIMAL(12,2) DEFAULT 0,
  `status` ENUM('DIJADWALKAN', 'DALAM_PROSES', 'SELESAI') NOT NULL DEFAULT 'DALAM_PROSES',
  `catatan` TEXT,
  `hasil_pemeriksaan` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`alat_id`) REFERENCES `alat`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SEED DATA AWAL (Contoh)
INSERT INTO `kategori` (`kode_prefix`, `nama_kategori`, `penanggung_jawab`, `ruangan`, `deskripsi`) VALUES
('BIO', 'Lab Biologi Terpadu & Bioteknologi', 'Dr. apt. Rina Kusuma, M.Si.', 'Gedung Sains Lt. 2 (R. 204)', 'Peralatan mikroskopi, kultur sel, mikropipetasi, dan analisis molekuler.'),
('ELK', 'Lab Elektronika & Instrumentasi', 'Ir. Hendra Wijaya, M.T.', 'Gedung Elektro Lt. 1 (R. 102)', 'Peralatan osiloskop, catu daya presisi, multimeter, dan generator sinyal.'),
('KIM', 'Lab Kimia Analisis & Spektroskopi', 'Prof. Dr. Irwan Santoso, M.Sc.', 'Gedung Kimia Lt. 3 (R. 308)', 'Spektrofotometer, pH meter presisi, sentrifus, dan neraca analitik.'),
('ROB', 'Lab Mekatronika & Fabrikasi', 'Bagus Prasetyo, S.T., M.Eng.', 'Gedung Workshop Lt. 1 (R. 110)', '3D printer, stasiun solder digital, sensor kit, mikrokontroler.');

-- Pengguna Default (password: admin123 / mahasiswa123 di-hash dengan password_hash())
INSERT INTO `pengguna` (`username`, `password`, `nama_lengkap`, `nim_nip`, `role`, `email`, `no_hp`, `prodi`) VALUES
('admin', '$2y$10$wE4iLdQvG3j68rN8Zp4g9u001Kq.G5EfZv3xG6Z4u9Z7T3Fk6u2C2', 'Bagus Prasetyo, S.T., M.Eng.', '198804152014041002', 'admin', 'bagus.prasetyo@univ.ac.id', '081223344556', 'Laboratorium Terpadu'),
('asisten', '$2y$10$wE4iLdQvG3j68rN8Zp4g9u001Kq.G5EfZv3xG6Z4u9Z7T3Fk6u2C2', 'Rizal Fahmi Pratama, S.Si.', '199510122022031005', 'asisten', 'rizal.fahmi@lab.univ.ac.id', '081377889900', 'Laboran Pengelola Alat'),
('mahasiswa', '$2y$10$wE4iLdQvG3j68rN8Zp4g9u001Kq.G5EfZv3xG6Z4u9Z7T3Fk6u2C2', 'Muhammad Fauzan Alamsyah', '22/498213/TK/54120', 'mahasiswa', 'm.fauzan.a@mail.ugm.ac.id', '081234567890', 'Teknik Elektro');

INSERT INTO `alat` (`kode_alat`, `kategori_id`, `nama_alat`, `merk_model`, `spesifikasi`, `lokasi_rak`, `kondisi`, `total_stok`, `stok_tersedia`, `harga_perkiraan`, `aksesoris`) VALUES
('ALT-BIO-001', 1, 'Mikroskop Binokuler Digital Zeiss Axio Lab.A1', 'Zeiss Axio Lab.A1', 'Perbesaran 40x-1000x, Kamera 5MP USB 3.0, LED Putih', 'Lemari Optik B-01 / Rak 2', 'BAIK', 6, 4, 45000000.00, 'Kabel Power, Dust Cover, Kabel USB 3.0, Immersion Oil'),
('ALT-ELK-001', 2, 'Digital Storage Oscilloscope Siglent SDS2304X Plus', 'Siglent SDS2304X Plus', '350 MHz, 4 Channel, 2 GSa/s, Memory Depth 200 Mpts', 'Lemari E-03 / Rak 1', 'BAIK', 5, 2, 32000000.00, 'Passive Probe 350MHz x4, Kabel Power, BNC Cable, Hard Case'),
('ALT-KIM-001', 3, 'Spektrofotometer UV-Vis Agilent Cary 60', 'Agilent Cary 60 UV-Vis', '190-1100 nm, Xenon Flash Lamp, Scan speed 24,000 nm/min', 'Meja Granite KIM-01', 'BAIK', 2, 1, 120000000.00, 'Kuvet Quartz x2, Kabel Sensor, Dongle Software'),
('ALT-ROB-001', 4, '3D Printer Presisi Creality Ender-3 S1 Pro', 'Creality Ender-3 S1 Pro', '220x220x270mm, Nozzle 300°C, Direct Drive Sprite Extruder', 'Meja Fabrikasi FAB-01', 'BAIK', 4, 2, 8200000.00, 'Plat Spring Steel PEI, SD Card 16GB, Kunci L, Spatula');
