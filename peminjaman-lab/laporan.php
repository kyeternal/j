<?php
require_once __DIR__ . '/includes/header.php';

$tgl_dari = $_GET['dari'] ?? date('Y-m-01');
$tgl_sampai = $_GET['sampai'] ?? date('Y-m-d');

$loans = [];
if (isset($pdo)) {
    $stmt = $pdo->prepare("SELECT * FROM peminjaman WHERE tanggal_pinjam BETWEEN ? AND ? ORDER BY id DESC");
    $stmt->execute([$tgl_dari, $tgl_sampai]);
    $loans = $stmt->fetchAll();
}
?>

<div class="space-y-6">

  <!-- Header -->
  <div class="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
        Laporan Rekapitulasi Sirkulasi Laboratorium
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">
        Dokumen resmi arsip akreditasi dan rekonsiliasi denda laboratorium.
      </p>
    </div>

    <button onclick="window.print()" class="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm">
      Cetak Berkas Resmi
    </button>
  </div>

  <!-- Filter Form (no-print) -->
  <form method="GET" class="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 text-xs">
    <div>
      <label class="block font-semibold text-slate-700 mb-1">Dari Tanggal:</label>
      <input type="date" name="dari" value="<?= htmlspecialchars($tgl_dari) ?>" class="px-3 py-1.5 border rounded-lg font-mono">
    </div>
    <div>
      <label class="block font-semibold text-slate-700 mb-1">Sampai Tanggal:</label>
      <input type="date" name="sampai" value="<?= htmlspecialchars($tgl_sampai) ?>" class="px-3 py-1.5 border rounded-lg font-mono">
    </div>
    <div class="self-end">
      <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg">
        Tampilkan
      </button>
    </div>
  </form>

  <!-- KOP Resmi dan Tabel Laporan -->
  <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm print:border-none print:p-0 space-y-6">
    
    <!-- KOP Universitas -->
    <div class="border-b-2 border-slate-900 pb-3 flex items-center justify-between text-center">
      <div class="w-12 h-12 bg-slate-900 text-white font-bold text-lg rounded-lg flex items-center justify-center">
        SL
      </div>
      <div class="flex-1">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900">KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI</h2>
        <h3 class="text-sm font-extrabold uppercase text-slate-900">UNIT LABORATORIUM RISET & PRAKTIKUM TERPADU (SIMPEL-LAB)</h3>
        <p class="text-[11px] text-slate-500 font-mono">Gedung Lab Terpadu Lt. 1-3 · Email: lab@univ.ac.id · Telp: (0274) 512345</p>
      </div>
      <div class="w-12 text-[10px] text-slate-400 font-mono">ARSIP</div>
    </div>

    <div class="text-center">
      <h4 class="text-sm font-bold uppercase underline">REKAPITULASI RESMI SIRKULASI PEMINJAMAN ALAT</h4>
      <p class="text-xs text-slate-500 font-mono mt-0.5">Periode: <?= format_tanggal($tgl_dari) ?> s/d <?= format_tanggal($tgl_sampai) ?></p>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border border-slate-300">
        <thead>
          <tr class="bg-slate-100 border-b border-slate-300 font-bold">
            <th class="p-2 w-8 text-center">No</th>
            <th class="p-2">Kode Tiket</th>
            <th class="p-2">Nama Peminjam</th>
            <th class="p-2">Keperluan</th>
            <th class="p-2">Tgl Pinjam</th>
            <th class="p-2">Batas Kembali</th>
            <th class="p-2">Status</th>
            <th class="p-2 text-right">Denda (Rp)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <?php if (empty($loans)): ?>
            <tr>
              <td colspan="8" class="p-4 text-center text-slate-500">Tidak ada transaksi pada rentang tanggal ini.</td>
            </tr>
          <?php else: ?>
            <?php foreach ($loans as $idx => $l): ?>
              <tr>
                <td class="p-2 text-center font-mono"><?= $idx + 1 ?></td>
                <td class="p-2 font-mono font-bold"><?= htmlspecialchars($l['kode_tiket']) ?></td>
                <td class="p-2 font-semibold"><?= htmlspecialchars($l['nama_peminjam']) ?></td>
                <td class="p-2"><?= htmlspecialchars($l['keperluan']) ?></td>
                <td class="p-2 font-mono"><?= htmlspecialchars($l['tanggal_pinjam']) ?></td>
                <td class="p-2 font-mono"><?= htmlspecialchars($l['tanggal_rencana_kembali']) ?></td>
                <td class="p-2 font-mono"><?= htmlspecialchars($l['status']) ?></td>
                <td class="p-2 text-right font-mono font-bold"><?= rupiah($l['total_denda'] ?: 0) ?></td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>

    <!-- Tanda Tangan -->
    <div class="pt-8 grid grid-cols-2 text-xs text-center">
      <div>
        <p>Mengetahui,</p>
        <p class="font-bold text-slate-900">Kepala Bagian Laboratorium</p>
        <div class="h-16"></div>
        <p class="font-bold underline text-slate-900">Dr. Ir. Hendra Wijaya, M.T.</p>
        <p class="font-mono text-[11px] text-slate-500">NIP. 197508212003121001</p>
      </div>

      <div>
        <p>Yogyakarta, <?= format_tanggal(date('Y-m-d')) ?></p>
        <p class="font-bold text-slate-900">Pranata Laboratorium Pendidikan</p>
        <div class="h-16"></div>
        <p class="font-bold underline text-slate-900"><?= htmlspecialchars($user['nama_lengkap']) ?></p>
        <p class="font-mono text-[11px] text-slate-500">NIP/ID. <?= htmlspecialchars($user['nim_nip']) ?></p>
      </div>
    </div>

  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
