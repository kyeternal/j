import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { 
  QrCode, 
  ShoppingBag, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface NavbarProps {
  onOpenRoleModal: () => void;
  onOpenCartModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRoleModal, onOpenCartModal }) => {
  const { 
    activeTab, 
    setActiveTab, 
    cart, 
    currentUser, 
    stats,
    setIsQRScannerOpen,
    resetAllData
  } = useLab();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const cartTotalItems = cart.reduce((acc, curr) => acc + curr.jumlah, 0);

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan' },
    { id: 'katalog', label: 'Katalog Alat' },
    { id: 'peminjaman', label: 'Permohonan' },
    { id: 'verifikasi', label: 'Verifikasi' },
    { id: 'pengembalian', label: 'Pengembalian' },
    { id: 'perawatan', label: 'Perawatan' },
    { id: 'laporan', label: 'Laporan Resmi' },
    { id: 'php_code', label: 'File PHP (XAMPP)' },
  ];

  const getRoleBadgeLabel = () => {
    switch (currentUser.role) {
      case 'ADMIN_LAB': return 'Admin Lab';
      case 'ASISTEN_LAB': return 'Asisten Lab';
      case 'DOSEN': return 'Dosen';
      default: return 'Mahasiswa';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-16">
            
            {/* Zone 1: Single Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold tracking-wider text-sm shadow-sm">
                  SL
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap leading-tight">
                    SIMPEL<span className="text-teal-600">-LAB</span>
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium tracking-normal whitespace-nowrap">
                    Sistem Peminjaman Laboratorium
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links (Clean single-line prose, anti-pill) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                // Indicator counts
                let count = 0;
                if (item.id === 'verifikasi') count = stats.menungguVerifikasi;
                if (item.id === 'pengembalian') count = stats.terlambat;
                if (item.id === 'perawatan') count = stats.dalamPerawatan;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-md transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {item.label}
                      {count > 0 && (
                        <span className="text-[10px] font-mono tabular-nums text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                          {count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Primary Action & Utilities */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* QR Scanner trigger */}
              <button
                type="button"
                onClick={() => setIsQRScannerOpen(true)}
                title="Pindai QR Barcode Alat / Tiket"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-800" />
                <span className="hidden sm:inline">Pindai QR</span>
              </button>

              {/* Cart for loan selection */}
              <button
                type="button"
                onClick={onOpenCartModal}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                title="Keranjang Alat Dipilih"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keranjang</span>
                {cartTotalItems > 0 && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {cartTotalItems}
                  </span>
                )}
              </button>

              {/* Role Persona Switcher */}
              <button
                type="button"
                onClick={onOpenRoleModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shadow-sm focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                <span className="truncate max-w-[110px]">{getRoleBadgeLabel()}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Reset to Default Data for Demo testing */}
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                title="Reset data ke data contoh default"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Mobile Navigation bar */}
          <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1.5 no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1 text-xs font-medium whitespace-nowrap rounded ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Kembalikan ke Data Awal?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Tindakan ini akan me-reset daftar alat, permohonan pinjam, dan log perawatan ke sampel default laboratorium.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
