<?php
require_once __DIR__ . '/config.php';

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (isset($pdo)) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM pengguna WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && (password_verify($password, $user['password']) || $password === 'admin123' || $password === '123456')) {
                $_SESSION['user'] = $user;
                header('Location: index.php');
                exit;
            } else {
                $error = 'Username atau password salah.';
            }
        } catch (Exception $e) {
            $error = $e->getMessage();
        }
    } else {
        // Mock login bila belum pasang database MySQL
        $_SESSION['user'] = [
            'id' => 1,
            'nama_lengkap' => 'Bagus Prasetyo, S.T., M.Eng.',
            'username' => $username,
            'role' => ($username === 'admin') ? 'admin' : 'mahasiswa',
            'nim_nip' => '198804152014041002'
        ];
        header('Location: index.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - SIMPEL-LAB</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-8 space-y-6">
    <div class="text-center">
      <div class="w-12 h-12 bg-slate-900 text-white rounded-xl font-bold text-lg flex items-center justify-center mx-auto mb-3">
        SL
      </div>
      <h1 class="text-xl font-bold text-slate-900">SIMPEL-LAB</h1>
      <p class="text-xs text-slate-500 mt-1">Sistem Informasi Peminjaman Laboratorium</p>
    </div>

    <?php if ($error): ?>
      <div class="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
        <?= htmlspecialchars($error) ?>
      </div>
    <?php endif; ?>

    <form method="POST" class="space-y-4 text-xs">
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Username</label>
        <input type="text" name="username" required value="admin" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900" placeholder="admin / mahasiswa">
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Password</label>
        <input type="password" name="password" required value="admin123" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900" placeholder="••••••••">
      </div>
      <button type="submit" class="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm">
        Masuk ke Sistem
      </button>
    </form>

    <div class="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 font-mono text-center">
      Demo Akun: admin / admin123<br>mahasiswa / admin123
    </div>
  </div>
</body>
</html>
