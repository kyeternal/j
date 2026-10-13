<?php
require_once __DIR__ . '/../config.php';
$current_page = basename($_SERVER['PHP_SELF'], '.php');
$user = $_SESSION['user'] ?? [
    'nama_lengkap' => 'Bagus Prasetyo, M.Eng.',
    'role' => 'admin',
    'nim_nip' => '198804152014041002'
];
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars(APP_NAME) ?> - Sistem Informasi Laboratorium</title>
  <!-- Tailwind CSS CDN Modern -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">

  <!-- Top Navigation Bar -->
  <header class="no-print sticky top-0 z-40 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between gap-6 h-16">
        
        <!-- Zone 1: Wordmark -->
        <a href="index.php" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            SL
          </div>
          <div class="flex flex-col">
            <span class="text-base font-bold tracking-tight text-slate-900 leading-tight">
              SIMPEL<span class="text-teal-600">-LAB</span>
            </span>
            <span class="text-[10px] text-slate-500 font-medium tracking-normal">
              Sistem Peminjaman Laboratorium
            </span>
          </div>
        </a>

        <!-- Zone 2: Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1">
          <?php
          $nav = [
            'index' => 'Dasbor',
            'katalog' => 'Katalog Alat',
            'alat' => 'Inventaris',
            'verifikasi' => 'Verifikasi',
            'pengembalian' => 'Pengembalian',
            'perawatan' => 'Perawatan',
            'laporan' => 'Laporan Resmi',
          ];
          foreach ($nav as $file => $label):
            $active = ($current_page === $file) ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50';
          ?>
            <a href="<?= $file ?>.php" class="px-3 py-1.5 text-xs rounded-md transition-colors <?= $active ?>">
              <?= $label ?>
            </a>
          <?php endforeach; ?>
        </nav>

        <!-- Zone 3: Quick Action & Profile -->
        <div class="flex items-center gap-2">
          <a href="qr.php" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            <span>Scan QR</span>
          </a>

          <div class="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
            <div class="text-right hidden sm:block">
              <span class="font-bold text-slate-900 block"><?= htmlspecialchars($user['nama_lengkap']) ?></span>
              <span class="text-[10px] text-teal-700 font-mono uppercase block"><?= htmlspecialchars($user['role']) ?></span>
            </div>
            <a href="logout.php" title="Keluar Sesi" class="p-1.5 text-slate-400 hover:text-rose-600 rounded">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
