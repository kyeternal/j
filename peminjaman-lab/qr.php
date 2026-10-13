<?php
require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-xl mx-auto space-y-6">

  <div class="text-center pb-4 border-b border-slate-200">
    <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
      Pemindai QR Code & Barcode Lab
    </h1>
    <p class="text-xs sm:text-sm text-slate-500 mt-1">
      Pindai kode barcode fisik alat atau tiket permohonan peminjaman.
    </p>
  </div>

  <!-- Simulated Viewfinder -->
  <div class="relative aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 shadow-lg">
    <div class="relative w-48 h-48 border-2 border-teal-500/60 rounded-xl flex items-center justify-center">
      <svg class="w-16 h-16 text-teal-500/40 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
      <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-teal-400"></div>
      <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-teal-400"></div>
      <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-teal-400"></div>
      <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-teal-400"></div>
    </div>
    <p class="text-[11px] text-teal-300 font-mono mt-3">Arahkan kamera ke barcode alat / tiket...</p>
  </div>

  <!-- Manual Input Form -->
  <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Cari Barcode Cepat:</h3>
    <form action="pengembalian.php" method="GET" class="flex gap-2">
      <input type="text" name="tiket" required placeholder="Contoh: PINJAM-20261013-4819 atau ALT-BIO-001" class="flex-1 px-3 py-2 text-xs border rounded-lg font-mono">
      <button type="submit" class="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg">
        Buka Data
      </button>
    </form>
  </div>

</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
