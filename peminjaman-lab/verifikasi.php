<?php
require_once __DIR__ . '/includes/header.php';

// Handle Action Persetujuan / Tolak
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($pdo)) {
    $action = $_POST['action'] ?? '';
    $id = $_POST['peminjaman_id'] ?? 0;

    if ($action === 'approve') {
        $stmt = $pdo->prepare("UPDATE peminjaman SET status = 'DISETUJUI', disetujui_oleh = ? WHERE id = ?");
        $stmt->execute([$user['nama_lengkap'], $id]);
    } elseif ($action === 'reject') {
        $alasan = $_POST['alasan'] ?? 'Permohonan ditolak oleh laboratorium.';
        $stmt = $pdo->prepare("UPDATE peminjaman SET status = 'DITOLAK', alasan_penolakan = ?, disetujui_oleh = ? WHERE id = ?");
        $stmt->execute([$alasan, $user['nama_lengkap'], $id]);
    } elseif ($action === 'handover') {
        // Serah terima barang fisik
        $stmt = $pdo->prepare("UPDATE peminjaman SET status = 'SEDANG_DIPINJAM', serah_terima_oleh = ? WHERE id = ?");
        $stmt->execute([$user['nama_lengkap'], $id]);

        // Kurangi stok alat
        $items = $pdo->prepare("SELECT alat_id, jumlah FROM peminjaman_item WHERE peminjaman_id = ?");
        $items->execute([$id]);
        foreach ($items->fetchAll() as $item) {
            $pdo->prepare("UPDATE alat SET stok_tersedia = GREATEST(0, stok_tersedia - ?) WHERE id = ?")
                ->execute([$item['jumlah'], $item['alat_id']]);
        }
    }
    header('Location: verifikasi.php');
    exit;
}

$loans = [];
if (isset($pdo)) {
    $loans = $pdo->query("SELECT * FROM peminjaman ORDER BY id DESC")->fetchAll();
}
?>

<div class="space-y-6">

  <div class="pb-4 border-b border-slate-200">
    <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
      Verifikasi & Persetujuan Peminjaman
    </h1>
    <p class="text-xs sm:text-sm text-slate-500 mt-1">
      Persetujuan jadwal praktikum, penolakan tiket, dan serah terima fisik instrumen.
    </p>
  </div>

  <div class="space-y-3">
    <?php if (empty($loans)): ?>
      <div class="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
        Belum ada permohonan peminjaman dalam antrean.
      </div>
    <?php else: ?>
      <?php foreach ($loans as $loan): ?>
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <span class="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              <?= htmlspecialchars($loan['kode_tiket']) ?>
            </span>
            <span class="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
              <?= htmlspecialchars($loan['status']) ?>
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span class="text-slate-400 block font-medium">Peminjam:</span>
              <span class="font-bold text-slate-900"><?= htmlspecialchars($loan['nama_peminjam']) ?></span>
              <span class="text-slate-500 font-mono text-[11px] block"><?= htmlspecialchars($loan['nim_nip']) ?> · <?= htmlspecialchars($loan['prodi_departemen']) ?></span>
            </div>
            <div>
              <span class="text-slate-400 block font-medium">Keperluan & Topik:</span>
              <span class="font-bold text-slate-900"><?= htmlspecialchars($loan['keperluan']) ?></span>
              <span class="text-slate-600 text-[11px] block"><?= htmlspecialchars($loan['judul_kegiatan']) ?></span>
            </div>
            <div>
              <span class="text-slate-400 block font-medium">Jadwal Pinjam:</span>
              <span class="font-mono font-semibold text-slate-900">
                <?= htmlspecialchars($loan['tanggal_pinjam']) ?> s/d <?= htmlspecialchars($loan['tanggal_rencana_kembali']) ?>
              </span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <?php if ($loan['status'] === 'MENUNGGU_VERIFIKASI'): ?>
              <form method="POST" class="inline">
                <input type="hidden" name="peminjaman_id" value="<?= $loan['id'] ?>">
                <input type="hidden" name="action" value="reject">
                <button type="submit" class="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg">
                  Tolak
                </button>
              </form>
              <form method="POST" class="inline">
                <input type="hidden" name="peminjaman_id" value="<?= $loan['id'] ?>">
                <input type="hidden" name="action" value="approve">
                <button type="submit" class="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg">
                  Setujui
                </button>
              </form>
            <?php elseif ($loan['status'] === 'DISETUJUI'): ?>
              <form method="POST" class="inline">
                <input type="hidden" name="peminjaman_id" value="<?= $loan['id'] ?>">
                <input type="hidden" name="action" value="handover">
                <button type="submit" class="px-4 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg">
                  Serah Terima Fisik (Check-Out)
                </button>
              </form>
            <?php elseif ($loan['status'] === 'SEDANG_DIPINJAM' || $loan['status'] === 'TERLAMBAT'): ?>
              <a href="pengembalian.php?tiket=<?= urlencode($loan['kode_tiket']) ?>" class="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg">
                Proses Pengembalian &rarr;
              </a>
            <?php endif; ?>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
