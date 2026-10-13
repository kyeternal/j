<?php
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
define('DENDA_PER_HARI', 10000); // Rp 10.000 / hari

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    // Tampilan ramah bila database belum dikonfigurasi
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
?>
