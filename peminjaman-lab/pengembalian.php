<?php
require_once __DIR__ . '/includes/header.php';

$tiket_param = $_GET['tiket'] ?? '';
$selected_loan = null;

if ($tiket_param && isset($pdo)) {
    $stmt = $pdo->prepare("SELECT * FROM peminjaman WHERE kode_tiket = ?");
    $stmt->execute([$tiket_param]);
    $selected_loan = $stmt->fetch();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($pdo)) {
    $peminjaman_id = $_POST['peminjaman_id'] ?? 0;
    $kondisi = $_POST['kondisi'] ?? 'LENGKAP_BAIK';
    $denda_rusak = (float)($_POST['denda_rusak'] ?? 0);
    $denda_telat = (float)($_POST['denda_telat'] ?? 0);
    $catatan = $_POST['catatan'] ?? '';
    $total_denda = $denda_telat + $denda_rusak;

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("UPDATE peminjaman SET 
        status = 'SELESAI',
        tanggal_aktual_kembali = NOW(),
        kondisi_pengembalian = ?,
        denda_keterlambatan = ?,
        denda_kerusakan = ?,
        total_denda = ?,
        status_pembayaran_denda = ?,
        catatan_pengembalian = ?,
        diterima_kembali_oleh = ?
        WHERE id = ?");

    $status_bayar = $total_denda > 0 ? 'LUNAS' : 'TIDAK_ADA';
    $stmt->execute([
        $kondisi, $denda_telat, $denda_rusak, $total_denda,
        $status_bayar, $catatan, $user['nama_lengkap'], $peminjaman_id
    ]);

    // Pulihkan stok alat
    $items = $pdo->prepare("SELECT alat_id, jumlah FROM peminjaman_item WHERE peminjaman_id = ?");
    $items->execute([$peminjaman_id]);
    foreach ($items->fetchAll() as $item) {
        $pdo->prepare("UPDATE alat SET stok_tersedia = LEAST(total_stok, stok_tersedia + ?) WHERE id = ?")
            ->execute([$item['jumlah'], $item['alat_id']]);
    }

    $pdo->commit();
    header('Location: pengembalian.php?success=1');
    exit;
}

$active_loans = [];
if (isset($pdo)) {
    $active_loans = $pdo->query("SELECT * FROM peminjaman WHERE status IN ('SEDANG_DIPINJAM', 'TERLAMBAT') ORDER BY id DESC")->fetchAll();
}
?>

<div class="space-y-6">

  <div class="pb-4 border-b border-slate-200">
    <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
      Pusat Pengembalian & Kalkulator Denda
    </h1>
    <p class="text-xs sm:text-sm text-slate-500 mt-1">
      Pemeriksaan fisik instrumen, penghitungan denda otomatis keterlambatan dan kerusakan.
    </p>
  </div>

  <?php if (isset($_GET['success'])): ?>
    <div class="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-semibold">
      Pengembalian alat telah berhasil diproses! Stok unit telah dipulihkan ke inventaris.
    </div>
  <?php endif; ?>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    
    <!-- List Active Loans -->
    <div class="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      <h3 class="text-sm font-bold text-slate-900">Peminjaman Berjalan (<?= count($active_loans) ?>)</h3>
      <div class="space-y-2">
        <?php foreach ($active_loans as $al): ?>
          <a href="pengembalian.php?tiket=<?= urlencode($al['kode_tiket']) ?>" class="block p-3 rounded-lg border border-slate-200 hover:border-slate-900 text-xs transition-colors">
            <div class="flex justify-between font-mono font-bold">
              <span><?= htmlspecialchars($al['kode_tiket']) ?></span>
              <span class="text-teal-700"><?= htmlspecialchars($al['status']) ?></span>
            </div>
            <div class="font-semibold text-slate-900 mt-1"><?= htmlspecialchars($al['nama_peminjam']) ?></div>
            <div class="text-slate-500 font-mono text-[11px]">Batas: <?= htmlspecialchars($al['tanggal_rencana_kembali']) ?></div>
          </a>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- Form Pengembalian -->
    <div class="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <?php if (!$selected_loan): ?>
        <div class="p-12 text-center text-slate-400 text-xs">
          Pilih salah satu tiket di sebelah kiri untuk memulai pemeriksaan pengembalian.
        </div>
      <?php else: 
        // Hitung denda keterlambatan
        $today = new DateTime();
        $plan = new DateTime($selected_loan['tanggal_rencana_kembali']);
        $diff = $today->diff($plan);
        $is_late = ($today > $plan);
        $late_days = $is_late ? $diff->days : 0;
        $denda_telat = $late_days * DENDA_PER_HARI;
      ?>
        <form method="POST" class="space-y-4 text-xs">
          <input type="hidden" name="peminjaman_id" value="<?= $selected_loan['id'] ?>">
          <input type="hidden" name="denda_telat" value="<?= $denda_telat ?>">

          <div class="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div>
              <span class="text-slate-400 font-mono">Tiket Pemeriksaan:</span>
              <h3 class="font-bold font-mono text-base text-slate-900"><?= htmlspecialchars($selected_loan['kode_tiket']) ?></h3>
            </div>
            <div class="text-right">
              <span class="font-semibold text-slate-900"><?= htmlspecialchars($selected_loan['nama_peminjam']) ?></span>
              <span class="text-slate-500 font-mono block text-[11px]"><?= htmlspecialchars($selected_loan['nim_nip']) ?></span>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Kondisi Alat Saat Dikembalikan *</label>
            <select name="kondisi" class="w-full px-3 py-2 border rounded-lg">
              <option value="LENGKAP_BAIK">Lengkap & Berfungsi Normal</option>
              <option value="RUSAK_RINGAN">Rusak Ringan (Perlu Servis Ringan)</option>
              <option value="KOMPONEN_HILANG">Komponen / Aksesoris Hilang</option>
              <option value="RUSAK_BERAT">Rusak Berat (Mati Total)</option>
            </select>
          </div>

          <div class="p-4 bg-slate-900 text-white rounded-xl space-y-2 font-mono">
            <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400">Rincian Kalkulasi Denda:</h4>
            <div class="flex justify-between">
              <span class="text-slate-400">Keterlambatan (<?= $late_days ?> hari):</span>
              <span><?= rupiah($denda_telat) ?></span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400">Denda Tambahan Kerusakan (Rp):</span>
              <input type="number" name="denda_rusak" value="0" min="0" class="w-32 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-right text-teal-300 font-bold">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Catatan Pemeriksaan</label>
            <input type="text" name="catatan" value="Pemeriksaan fisik selesai, fungsi normal." class="w-full px-3 py-2 border rounded-lg">
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm">
              Konfirmasi Selesai Pengembalian
            </button>
          </div>
        </form>
      <?php endif; ?>
    </div>

  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
