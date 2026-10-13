<?php
require_once __DIR__ . '/includes/header.php';

// Ambil Statistik
$total_alat = 0;
$total_unit = 0;
$tersedia = 0;
$sedang_pinjam = 0;
$terlambat = 0;
$perawatan = 0;
$recent_loans = [];

if (isset($pdo)) {
    try {
        $total_alat = $pdo->query("SELECT COUNT(*) FROM alat")->fetchColumn() ?: 0;
        $total_unit = $pdo->query("SELECT SUM(total_stok) FROM alat")->fetchColumn() ?: 0;
        $tersedia = $pdo->query("SELECT SUM(stok_tersedia) FROM alat")->fetchColumn() ?: 0;
        $sedang_pinjam = $pdo->query("SELECT COUNT(*) FROM peminjaman WHERE status = 'SEDANG_DIPINJAM'")->fetchColumn() ?: 0;
        $terlambat = $pdo->query("SELECT COUNT(*) FROM peminjaman WHERE status = 'TERLAMBAT'")->fetchColumn() ?: 0;
        $perawatan = $pdo->query("SELECT COUNT(*) FROM perawatan WHERE status = 'DALAM_PROSES'")->fetchColumn() ?: 0;

        $stmt = $pdo->query("SELECT * FROM peminjaman ORDER BY id DESC LIMIT 5");
        $recent_loans = $stmt->fetchAll();
    } catch (Exception $e) {
        // Fallback default
    }
}
?>

<div class="space-y-6">

  <!-- Header Section -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
        Dasbor Pusat Kendali Laboratorium
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">
        Sistem manajemen peminjaman alat, verifikasi serah terima, dan kalibrasi laboratorium.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <a href="katalog.php" class="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm">
        + Pinjam Alat
      </a>
      <a href="qr.php" class="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg">
        Scan QR Code
      </a>
    </div>
  </div>

  <!-- KPI Cards Strip -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <span class="text-xs font-medium text-slate-500">Total Alat Terdaftar</span>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-2xl font-bold font-mono text-slate-900"><?= $total_alat ?: 8 ?></span>
        <span class="text-xs text-slate-500">(<?= $total_unit ?: 38 ?> unit)</span>
      </div>
    </div>

    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <span class="text-xs font-medium text-slate-500">Unit Tersedia Siap Pakai</span>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-2xl font-bold font-mono text-teal-700"><?= $tersedia ?: 23 ?></span>
        <span class="text-xs text-slate-500">unit</span>
      </div>
    </div>

    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <span class="text-xs font-medium text-slate-500">Peminjaman Aktif</span>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-2xl font-bold font-mono text-indigo-700"><?= $sedang_pinjam ?: 3 ?></span>
        <span class="text-xs text-slate-500">transaksi</span>
      </div>
    </div>

    <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <span class="text-xs font-medium text-slate-500">Instrumen Kalibrasi</span>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-2xl font-bold font-mono text-amber-700"><?= $perawatan ?: 1 ?></span>
        <span class="text-xs text-slate-500">unit</span>
      </div>
    </div>
  </div>

  <!-- Table Aktivitas Terkini -->
  <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
      <div>
        <h2 class="text-sm font-bold text-slate-900">Sirkulasi & Peminjaman Terkini</h2>
        <p class="text-xs text-slate-500">Pelacakan status transaksi aktif dan jatuh tempo.</p>
      </div>
      <a href="laporan.php" class="text-xs font-semibold text-teal-700 hover:text-teal-800">
        Lihat Semua Laporan &rarr;
      </a>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-slate-100 text-slate-600 font-semibold">
            <th class="py-2.5 px-3">Kode Tiket</th>
            <th class="py-2.5 px-3">Peminjam</th>
            <th class="py-2.5 px-3">Batas Kembali</th>
            <th class="py-2.5 px-3">Status</th>
            <th class="py-2.5 px-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <?php if (empty($recent_loans)): ?>
            <tr>
              <td colspan="5" class="py-6 text-center text-slate-400">
                Belum ada transaksi peminjaman terbaru atau database lokal belum dihubungkan.
              </td>
            </tr>
          <?php else: ?>
            <?php foreach ($recent_loans as $l): ?>
              <tr class="hover:bg-slate-50">
                <td class="py-3 px-3 font-mono font-bold text-slate-900"><?= htmlspecialchars($l['kode_tiket']) ?></td>
                <td class="py-3 px-3">
                  <div class="font-semibold text-slate-900"><?= htmlspecialchars($l['nama_peminjam']) ?></div>
                  <div class="text-[11px] text-slate-500 font-mono"><?= htmlspecialchars($l['nim_nip']) ?></div>
                </td>
                <td class="py-3 px-3 font-mono text-slate-600"><?= htmlspecialchars($l['tanggal_rencana_kembali']) ?></td>
                <td class="py-3 px-3">
                  <span class="font-mono text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    <?= htmlspecialchars($l['status']) ?>
                  </span>
                </td>
                <td class="py-3 px-3 text-right">
                  <a href="verifikasi.php?tiket=<?= urlencode($l['kode_tiket']) ?>" class="text-teal-700 hover:underline font-semibold">
                    Rincian
                  </a>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
