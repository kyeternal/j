import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, Folder, Terminal, Server, Database } from 'lucide-react';

interface PhpFile {
  name: string;
  path: string;
  description: string;
  code: string;
}

export const PhpCodeViewer: React.FC = () => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const phpFiles: PhpFile[] = [
    {
      name: 'config.php',
      path: 'peminjaman-lab/config.php',
      description: 'Koneksi PDO MySQL, manajemen sesi, fungsi rupiah(), dan konfigurasi aplikasi.',
      code: `<?php
/**
 * SIMPEL-LAB - Sistem Informasi Manajemen & Peminjaman Alat Laboratorium
 * Konfigurasi Database PDO & Pengaturan Sesi
 */

session_start();

define('DB_HOST', 'localhost');
define('DB_NAME', 'peminjaman_lab');
define('DB_USER', 'root');
define('DB_PASS', '');
define('APP_NAME', 'SIMPEL-LAB');
define('APP_URL', 'http://localhost/peminjaman-lab');
define('DENDA_PER_HARI', 10000); // Rp 10.000 / hari keterlambatan

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    $db_error = $e->getMessage();
}

function check_auth($allowed_roles = []) {
    if (!isset($_SESSION['user'])) {
        header('Location: login.php');
        exit;
    }
    if (!empty($allowed_roles) && !in_array($_SESSION['user']['role'], $allowed_roles)) {
        header('Location: index.php?error=unauthorized');
        exit;
    }
}

function rupiah($angka) {
    return 'Rp ' . number_format($angka, 0, ',', '.');
}

function format_tanggal($tgl) {
    if (!$tgl) return '-';
    $bulan = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $pecah = explode('-', date('Y-m-d', strtotime($tgl)));
    return $pecah[2] . ' ' . $bulan[(int)$pecah[1]] . ' ' . $pecah[0];
}
?>`,
    },
    {
      name: 'database.sql',
      path: 'peminjaman-lab/database.sql',
      description: 'Skema tabel MySQL relasional: kategori, alat, peminjaman, peminjaman_item, perawatan, pengguna.',
      code: `-- Schema Database: peminjaman_lab
CREATE DATABASE IF NOT EXISTS \`peminjaman_lab\` DEFAULT CHARACTER SET utf8mb4;
USE \`peminjaman_lab\`;

-- 1. Kategori Laboratorium
CREATE TABLE IF NOT EXISTS \`kategori\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`kode_prefix\` VARCHAR(10) NOT NULL UNIQUE,
  \`nama_kategori\` VARCHAR(100) NOT NULL,
  \`penanggung_jawab\` VARCHAR(100) NOT NULL,
  \`ruangan\` VARCHAR(100) NOT NULL,
  \`deskripsi\` TEXT
) ENGINE=InnoDB;

-- 2. Pengguna (Multi-Role)
CREATE TABLE IF NOT EXISTS \`pengguna\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`nama_lengkap\` VARCHAR(100) NOT NULL,
  \`nim_nip\` VARCHAR(50) NOT NULL,
  \`role\` ENUM('admin', 'asisten', 'mahasiswa', 'dosen') NOT NULL DEFAULT 'mahasiswa',
  \`email\` VARCHAR(100) NOT NULL,
  \`no_hp\` VARCHAR(20) NOT NULL,
  \`prodi\` VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 3. Alat Inventaris
CREATE TABLE IF NOT EXISTS \`alat\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`kode_alat\` VARCHAR(50) NOT NULL UNIQUE,
  \`kategori_id\` INT NOT NULL,
  \`nama_alat\` VARCHAR(150) NOT NULL,
  \`merk_model\` VARCHAR(100) NOT NULL,
  \`spesifikasi\` TEXT NOT NULL,
  \`lokasi_rak\` VARCHAR(100) NOT NULL,
  \`kondisi\` ENUM('BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'DALAM_PERAWATAN') NOT NULL DEFAULT 'BAIK',
  \`total_stok\` INT NOT NULL DEFAULT 1,
  \`stok_tersedia\` INT NOT NULL DEFAULT 1,
  \`harga_perkiraan\` DECIMAL(15,2) DEFAULT 0,
  \`aksesoris\` TEXT,
  FOREIGN KEY (\`kategori_id\`) REFERENCES \`kategori\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Peminjaman Tiket
CREATE TABLE IF NOT EXISTS \`peminjaman\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`kode_tiket\` VARCHAR(50) NOT NULL UNIQUE,
  \`nama_peminjam\` VARCHAR(100) NOT NULL,
  \`nim_nip\` VARCHAR(50) NOT NULL,
  \`peran\` VARCHAR(50) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`no_hp\` VARCHAR(20) NOT NULL,
  \`prodi_departemen\` VARCHAR(100) NOT NULL,
  \`keperluan\` VARCHAR(50) NOT NULL,
  \`judul_kegiatan\` VARCHAR(255) NOT NULL,
  \`dosen_pembimbing\` VARCHAR(100) NOT NULL,
  \`tanggal_pinjam\` DATE NOT NULL,
  \`tanggal_rencana_kembali\` DATE NOT NULL,
  \`tanggal_aktual_kembali\` DATETIME DEFAULT NULL,
  \`status\` ENUM('MENUNGGU_VERIFIKASI', 'DISETUJUI', 'DITOLAK', 'SEDANG_DIPINJAM', 'SELESAI', 'TERLAMBAT') NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
  \`denda_keterlambatan\` DECIMAL(12,2) DEFAULT 0,
  \`denda_kerusakan\` DECIMAL(12,2) DEFAULT 0,
  \`total_denda\` DECIMAL(12,2) DEFAULT 0,
  \`status_pembayaran_denda\` ENUM('LUNAS', 'BELUM_LUNAS', 'TIDAK_ADA') DEFAULT 'TIDAK_ADA',
  \`kondisi_pengembalian\` VARCHAR(50) DEFAULT NULL,
  \`catatan_pengembalian\` TEXT DEFAULT NULL
) ENGINE=InnoDB;

-- 5. Detail Item Peminjaman
CREATE TABLE IF NOT EXISTS \`peminjaman_item\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`peminjaman_id\` INT NOT NULL,
  \`alat_id\` INT NOT NULL,
  \`jumlah\` INT NOT NULL DEFAULT 1,
  \`kondisi_awal\` VARCHAR(100) DEFAULT 'Baik',
  FOREIGN KEY (\`peminjaman_id\`) REFERENCES \`peminjaman\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`alat_id\`) REFERENCES \`alat\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;`,
    },
    {
      name: 'index.php',
      path: 'peminjaman-lab/index.php',
      description: 'Halaman Dasbor utama PHP dengan statistik KPI, ringkasan peminjaman aktif, dan status sirkulasi.',
      code: `<?php
require_once __DIR__ . '/includes/header.php';

// Ambil Statistik dari Database
$total_alat = $pdo->query("SELECT COUNT(*) FROM alat")->fetchColumn() ?: 0;
$total_unit = $pdo->query("SELECT SUM(total_stok) FROM alat")->fetchColumn() ?: 0;
$tersedia = $pdo->query("SELECT SUM(stok_tersedia) FROM alat")->fetchColumn() ?: 0;
$sedang_pinjam = $pdo->query("SELECT COUNT(*) FROM peminjaman WHERE status = 'SEDANG_DIPINJAM'")->fetchColumn() ?: 0;
$recent_loans = $pdo->query("SELECT * FROM peminjaman ORDER BY id DESC LIMIT 5")->fetchAll();
?>

<div class="space-y-6">
  <div class="flex justify-between items-center pb-4 border-b border-slate-200">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Dasbor Pusat Kendali Laboratorium</h1>
      <p class="text-xs text-slate-500 mt-1">Sistem manajemen peminjaman alat, serah terima, dan kalibrasi.</p>
    </div>
    <a href="katalog.php" class="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg">+ Pinjam Alat</a>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <span class="text-xs text-slate-500">Total Alat Terdaftar</span>
      <div class="mt-2 text-2xl font-bold font-mono text-slate-900"><?= $total_alat ?> (<?= $total_unit ?> unit)</div>
    </div>
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <span class="text-xs text-slate-500">Unit Tersedia</span>
      <div class="mt-2 text-2xl font-bold font-mono text-teal-700"><?= $tersedia ?> unit</div>
    </div>
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <span class="text-xs text-slate-500">Peminjaman Berjalan</span>
      <div class="mt-2 text-2xl font-bold font-mono text-indigo-700"><?= $sedang_pinjam ?> transaksi</div>
    </div>
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <span class="text-xs text-slate-500">Standar Lab</span>
      <div class="mt-2 text-sm font-bold text-slate-900">ISO/IEC 17025</div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>`,
    },
    {
      name: 'katalog.php',
      path: 'peminjaman-lab/katalog.php',
      description: 'Katalog alat laboratorium dengan pencarian real-time, filter kategori, stok dan detail rak.',
      code: `<?php
require_once __DIR__ . '/includes/header.php';

$q = $_GET['q'] ?? '';
$kat_filter = $_GET['kat'] ?? '';

$sql = "SELECT a.*, k.nama_kategori FROM alat a JOIN kategori k ON a.kategori_id = k.id WHERE 1=1";
$params = [];

if (!empty($q)) {
    $sql .= " AND (a.nama_alat LIKE ? OR a.kode_alat LIKE ? OR a.merk_model LIKE ?)";
    $params[] = "%$q%"; $params[] = "%$q%"; $params[] = "%$q%";
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$alat_list = $stmt->fetchAll();
?>

<div class="space-y-6">
  <h1 class="text-2xl font-bold text-slate-900">Katalog Alat Laboratorium</h1>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <?php foreach ($alat_list as $item): ?>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <span class="text-xs font-mono text-slate-400"><?= htmlspecialchars($item['kode_alat']) ?></span>
        <h3 class="font-bold text-slate-900"><?= htmlspecialchars($item['nama_alat']) ?></h3>
        <p class="text-xs text-slate-500"><?= htmlspecialchars($item['merk_model']) ?></p>
        <div class="flex justify-between items-center pt-2 border-t">
          <span class="text-xs font-mono font-bold text-teal-700">Stok: <?= $item['stok_tersedia'] ?></span>
          <a href="peminjaman.php?alat_id=<?= $item['id'] ?>" class="px-3 py-1 bg-slate-900 text-white rounded text-xs">Pinjam</a>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>`,
    },
    {
      name: 'peminjaman.php',
      path: 'peminjaman-lab/peminjaman.php',
      description: 'Formulir pengajuan peminjaman alat dengan kalkulasi durasi dan nomor tiket otomatis.',
      code: `<?php
require_once __DIR__ . '/includes/header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $kode_tiket = 'PINJAM-' . date('Ymd') . '-' . rand(1000, 9999);
    $stmt = $pdo->prepare("INSERT INTO peminjaman (
        kode_tiket, nama_peminjam, nim_nip, peran, email, no_hp, prodi_departemen,
        keperluan, judul_kegiatan, dosen_pembimbing, tanggal_pinjam, tanggal_rencana_kembali
    ) VALUES (?, ?, ?, 'MAHASISWA', ?, ?, ?, ?, ?, ?, ?, ?)");

    $stmt->execute([
        $kode_tiket, $_POST['nama_peminjam'], $_POST['nim_nip'], $_POST['email'],
        $_POST['no_hp'], $_POST['prodi'], $_POST['keperluan'], $_POST['judul_kegiatan'],
        $_POST['dosen_pembimbing'], $_POST['tgl_pinjam'], $_POST['tgl_kembali']
    ]);

    header("Location: index.php?success=tiket_terbuat&tiket=$kode_tiket");
    exit;
}
?>`,
    },
    {
      name: 'pengembalian.php',
      path: 'peminjaman-lab/pengembalian.php',
      description: 'Pusat pengembalian alat dengan penghitungan denda keterlambatan (Rp 10.000/hari) & pemulihan stok.',
      code: `<?php
require_once __DIR__ . '/includes/header.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $peminjaman_id = $_POST['peminjaman_id'];
    $denda_telat = (float)$_POST['denda_telat'];
    $denda_rusak = (float)$_POST['denda_rusak'];
    $total_denda = $denda_telat + $denda_rusak;

    $stmt = $pdo->prepare("UPDATE peminjaman SET 
        status = 'SELESAI',
        tanggal_aktual_kembali = NOW(),
        kondisi_pengembalian = ?,
        denda_keterlambatan = ?,
        denda_kerusakan = ?,
        total_denda = ?,
        status_pembayaran_denda = 'LUNAS'
        WHERE id = ?");

    $stmt->execute([$_POST['kondisi'], $denda_telat, $denda_rusak, $total_denda, $peminjaman_id]);

    // Pulihkan stok alat
    $pdo->prepare("UPDATE alat a JOIN peminjaman_item pi ON a.id = pi.alat_id 
                   SET a.stok_tersedia = LEAST(a.total_stok, a.stok_tersedia + pi.jumlah) 
                   WHERE pi.peminjaman_id = ?")->execute([$peminjaman_id]);

    header('Location: pengembalian.php?selesai=1');
    exit;
}
?>`,
    },
    {
      name: 'laporan.php',
      path: 'peminjaman-lab/laporan.php',
      description: 'Rekapitulasi sirkulasi dan denda ber-KOP resmi universitas siap cetak/print.',
      code: `<?php
require_once __DIR__ . '/includes/header.php';
$loans = $pdo->query("SELECT * FROM peminjaman ORDER BY id DESC")->fetchAll();
?>
<div class="space-y-6">
  <div class="no-print flex justify-between items-center pb-4 border-b">
    <h1 class="text-2xl font-bold">Laporan Resmi Peminjaman</h1>
    <button onclick="window.print()" class="px-4 py-2 bg-slate-900 text-white rounded">Cetak Dokumen</button>
  </div>
  <table class="w-full text-xs border border-slate-300">
    <tr class="bg-slate-100 font-bold"><th class="p-2">Tiket</th><th class="p-2">Peminjam</th><th class="p-2">Status</th><th class="p-2">Denda</th></tr>
    <?php foreach ($loans as $l): ?>
      <tr>
        <td class="p-2 font-mono"><?= $l['kode_tiket'] ?></td>
        <td class="p-2"><?= $l['nama_peminjam'] ?></td>
        <td class="p-2"><?= $l['status'] ?></td>
        <td class="p-2 font-mono"><?= rupiah($l['total_denda']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php require_once __DIR__ . '/includes/footer.php'; ?>`,
    },
  ];

  const [activeFile, setActiveFile] = useState<PhpFile>(phpFiles[0]);

  const handleCopy = (code: string, path: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleDownloadFile = (file: PhpFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileCode className="w-6 h-6 text-teal-700" />
              <span>Kode Sumber PHP (Full Upgrade untuk XAMPP / Apache / MySQL)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Seluruh file PHP modern telah dibuatkan di folder <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">/peminjaman-lab/</code> lengkap dengan Tailwind CSS & PDO MySQL.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadFile(activeFile)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh {activeFile.name}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deployment Quick Guide Card */}
      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-2 text-teal-400 font-bold">
          <Server className="w-4 h-4" />
          <span>Cara Menjalankan di XAMPP / Laragon Lokal:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-300 font-mono text-[11px] leading-relaxed">
          <li>Salin folder <code className="text-teal-300 font-bold">peminjaman-lab/</code> ke direktori web server Anda (misal: <code className="text-white">C:\xampp\htdocs\peminjaman-lab\</code>).</li>
          <li>Buka <code className="text-teal-300">phpMyAdmin</code> (http://localhost/phpmyadmin), buat database baru bernama <code className="text-white font-bold">peminjaman_lab</code>.</li>
          <li>Import file <code className="text-teal-300 font-bold">database.sql</code> yang sudah disediakan di bawah ini.</li>
          <li>Buka peramban di <code className="text-teal-300 font-bold">http://localhost/peminjaman-lab/</code> untuk menikmati antarmuka PHP baru!</li>
        </ol>
      </div>

      {/* 2-Column Code Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: File Explorer */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-xs text-slate-800">
            <Folder className="w-4 h-4 text-teal-700" />
            <span>Daftar Berkas PHP (/peminjaman-lab/)</span>
          </div>

          <div className="space-y-1">
            {phpFiles.map((file) => {
              const isActive = activeFile.name === file.name;
              return (
                <button
                  key={file.name}
                  type="button"
                  onClick={() => setActiveFile(file)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span className="font-mono truncate">{file.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-slate-800 text-slate-300' : 'text-slate-400'}`}>
                    PHP
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer with Copy Action */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
          
          <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
            <div>
              <span className="font-mono font-bold text-xs text-teal-400">{activeFile.path}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">{activeFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(activeFile.code, activeFile.path)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                {copiedPath === activeFile.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-teal-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[550px] overflow-y-auto">
            <code>{activeFile.code}</code>
          </pre>

        </div>

      </div>

    </div>
  );
};
