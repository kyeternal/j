<?php
require_once __DIR__ . '/includes/header.php';

// Filter & Search
$q = $_GET['q'] ?? '';
$kat_filter = $_GET['kat'] ?? '';

$sql = "SELECT a.*, k.nama_kategori FROM alat a JOIN kategori k ON a.kategori_id = k.id WHERE 1=1";
$params = [];

if (!empty($q)) {
    $sql .= " AND (a.nama_alat LIKE ? OR a.kode_alat LIKE ? OR a.merk_model LIKE ?)";
    $params[] = "%$q%";
    $params[] = "%$q%";
    $params[] = "%$q%";
}

if (!empty($kat_filter)) {
    $sql .= " AND a.kategori_id = ?";
    $params[] = $kat_filter;
}

$sql .= " ORDER BY a.nama_alat ASC";

$alat_list = [];
$kategori_list = [];

if (isset($pdo)) {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $alat_list = $stmt->fetchAll();

    $kategori_list = $pdo->query("SELECT * FROM kategori ORDER BY nama_kategori ASC")->fetchAll();
}
?>

<div class="space-y-6">

  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
        Katalog Inventaris Alat Laboratorium
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">
        Pilih alat yang dibutuhkan untuk praktikum atau riset tugas akhir.
      </p>
    </div>
  </div>

  <!-- Search & Filter Form -->
  <form method="GET" action="katalog.php" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
    <input 
      type="text" 
      name="q" 
      value="<?= htmlspecialchars($q) ?>" 
      placeholder="Cari nama alat, merk, atau kode..." 
      class="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
    />
    <select name="kat" class="px-3 py-2 text-xs border border-slate-300 rounded-lg">
      <option value="">Semua Laboratorium</option>
      <?php foreach ($kategori_list as $kat): ?>
        <option value="<?= $kat['id'] ?>" <?= $kat_filter == $kat['id'] ? 'selected' : '' ?>>
          <?= htmlspecialchars($kat['nama_kategori']) ?>
        </option>
      <?php endforeach; ?>
    </select>
    <button type="submit" class="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg">
      Cari
    </button>
  </form>

  <!-- Grid Alat -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    <?php if (empty($alat_list)): ?>
      <div class="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
        Tidak ada data alat yang ditemukan.
      </div>
    <?php else: ?>
      <?php foreach ($alat_list as $item): ?>
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
          <div class="p-4 space-y-2">
            <div class="flex justify-between items-center text-[11px] font-mono text-slate-400">
              <span><?= htmlspecialchars($item['kode_alat']) ?></span>
              <span class="text-teal-700 font-bold"><?= $item['stok_tersedia'] ?> / <?= $item['total_stok'] ?> Unit</span>
            </div>

            <h3 class="text-sm font-bold text-slate-900 line-clamp-2">
              <?= htmlspecialchars($item['nama_alat']) ?>
            </h3>

            <p class="text-xs text-slate-500"><?= htmlspecialchars($item['merk_model']) ?></p>
            <p class="text-[11px] text-slate-600 line-clamp-2"><?= htmlspecialchars($item['spesifikasi']) ?></p>

            <div class="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
              Rak: <?= htmlspecialchars($item['lokasi_rak']) ?>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-slate-900">
              <?= $item['kondisi'] === 'BAIK' ? '<span class="text-teal-700">Kondisi Baik</span>' : '<span class="text-amber-700">' . $item['kondisi'] . '</span>' ?>
            </span>
            <a href="peminjaman.php?alat_id=<?= $item['id'] ?>" class="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg">
              Pinjam Alat
            </a>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
