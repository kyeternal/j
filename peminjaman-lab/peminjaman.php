<?php
require_once __DIR__ . '/includes/header.php';

$alat_id = $_GET['alat_id'] ?? null;
$selected_alat = null;

if ($alat_id && isset($pdo)) {
    $stmt = $pdo->prepare("SELECT * FROM alat WHERE id = ?");
    $stmt->execute([$alat_id]);
    $selected_alat = $stmt->fetch();
}

$success_tiket = null;
$error_msg = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($pdo)) {
    try {
        $nama = $_POST['nama_peminjam'] ?? '';
        $nim = $_POST['nim_nip'] ?? '';
        $email = $_POST['email'] ?? '';
        $no_hp = $_POST['no_hp'] ?? '';
        $prodi = $_POST['prodi'] ?? '';
        $keperluan = $_POST['keperluan'] ?? 'PRAKTIKUM';
        $judul = $_POST['judul_kegiatan'] ?? '';
        $dosen = $_POST['dosen_pembimbing'] ?? '';
        $tgl_pinjam = $_POST['tgl_pinjam'] ?? date('Y-m-d');
        $tgl_kembali = $_POST['tgl_kembali'] ?? date('Y-m-d', strtotime('+7 days'));
        $target_alat_id = $_POST['alat_id'] ?? null;
        $jumlah = (int)($_POST['jumlah'] ?? 1);

        $kode_tiket = 'PINJAM-' . date('Ymd') . '-' . rand(1000, 9999);

        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO peminjaman (
            kode_tiket, nama_peminjam, nim_nip, peran, email, no_hp, prodi_departemen,
            keperluan, judul_kegiatan, dosen_pembimbing, tanggal_pinjam, tanggal_rencana_kembali, status
        ) VALUES (?, ?, ?, 'MAHASISWA', ?, ?, ?, ?, ?, ?, ?, ?, 'MENUNGGU_VERIFIKASI')");

        $stmt->execute([
            $kode_tiket, $nama, $nim, $email, $no_hp, $prodi,
            $keperluan, $judul, $dosen, $tgl_pinjam, $tgl_kembali
        ]);

        $pinjam_id = $pdo->lastInsertId();

        if ($target_alat_id) {
            $stmtItem = $pdo->prepare("INSERT INTO peminjaman_item (peminjaman_id, alat_id, jumlah, kondisi_awal) VALUES (?, ?, ?, 'Baik')");
            $stmtItem->execute([$pinjam_id, $target_alat_id, $jumlah]);
        }

        $pdo->commit();
        $success_tiket = $kode_tiket;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $error_msg = $e->getMessage();
    }
}
?>

<div class="max-w-3xl mx-auto space-y-6">

  <div class="pb-4 border-b border-slate-200">
    <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
      Formulir Permohonan Peminjaman Alat
    </h1>
    <p class="text-xs sm:text-sm text-slate-500 mt-1">
      Lengkapi data identitas dan jadwal peminjaman instrumen laboratorium.
    </p>
  </div>

  <?php if ($success_tiket): ?>
    <div class="p-6 bg-white rounded-xl border border-slate-200 shadow-sm text-center space-y-3">
      <div class="w-12 h-12 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto">
        ✓
      </div>
      <h2 class="text-lg font-bold text-slate-900">Permohonan Berhasil Dikirim!</h2>
      <p class="text-xs text-slate-600">
        Nomor Tiket Anda: <strong class="font-mono text-teal-800 text-sm"><?= htmlspecialchars($success_tiket) ?></strong>
      </p>
      <div class="pt-2">
        <a href="katalog.php" class="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg">
          Kembali ke Katalog
        </a>
      </div>
    </div>
  <?php else: ?>

    <?php if ($error_msg): ?>
      <div class="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
        <?= htmlspecialchars($error_msg) ?>
      </div>
    <?php endif; ?>

    <form method="POST" action="peminjaman.php" class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
      
      <?php if ($selected_alat): ?>
        <input type="hidden" name="alat_id" value="<?= $selected_alat['id'] ?>">
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
          <div>
            <span class="text-slate-400 font-mono text-[11px]"><?= htmlspecialchars($selected_alat['kode_alat']) ?></span>
            <h4 class="font-bold text-slate-900"><?= htmlspecialchars($selected_alat['nama_alat']) ?></h4>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-medium">Jumlah Unit:</label>
            <input type="number" name="jumlah" min="1" max="<?= $selected_alat['stok_tersedia'] ?>" value="1" class="w-16 px-2 py-1 border rounded text-center font-mono">
          </div>
        </div>
      <?php endif; ?>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
          <input type="text" required name="nama_peminjam" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900" placeholder="Nama mahasiswa">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">NIM / NIP *</label>
          <input type="text" required name="nim_nip" class="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-slate-900" placeholder="NIM">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Email Institusi *</label>
          <input type="email" required name="email" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900" placeholder="nama@univ.ac.id">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">No. WhatsApp Aktif *</label>
          <input type="tel" required name="no_hp" class="w-full px-3 py-2 border rounded-lg font-mono focus:ring-2 focus:ring-slate-900" placeholder="081234567890">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Program Studi / Departemen *</label>
          <input type="text" required name="prodi" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900" placeholder="Teknik Elektro">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Keperluan *</label>
          <select name="keperluan" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900">
            <option value="PRAKTIKUM">Praktikum Kuliah</option>
            <option value="TUGAS_AKHIR">Tugas Akhir / Skripsi</option>
            <option value="PENELITIAN">Penelitian Dosen & Publikasi</option>
            <option value="LOMBA_PROYEK">Lomba Mahasiswa / Robotika</option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">Judul Riset / Mata Kuliah *</label>
          <input type="text" required name="judul_kegiatan" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900" placeholder="Topik penggunaan alat">
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Dosen Pembimbing *</label>
          <input type="text" required name="dosen_pembimbing" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900" placeholder="Nama Dosen">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tgl Pinjam *</label>
            <input type="date" required name="tgl_pinjam" value="<?= date('Y-m-d') ?>" class="w-full px-2 py-2 border rounded-lg font-mono">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Batas Kembali *</label>
            <input type="date" required name="tgl_kembali" value="<?= date('Y-m-d', strtotime('+7 days')) ?>" class="w-full px-2 py-2 border rounded-lg font-mono">
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
        <a href="katalog.php" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</a>
        <button type="submit" class="px-6 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-bold shadow-sm">
          Kirim Permohonan Tiket
        </button>
      </div>

    </form>

  <?php endif; ?>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
