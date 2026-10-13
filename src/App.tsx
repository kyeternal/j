/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { KatalogAlat } from './components/KatalogAlat';
import { FormPeminjaman } from './components/FormPeminjaman';
import { VerifikasiPeminjaman } from './components/VerifikasiPeminjaman';
import { PengembalianAlat } from './components/PengembalianAlat';
import { PerawatanAlat } from './components/PerawatanAlat';
import { LaporanRekap } from './components/LaporanRekap';
import { PhpCodeViewer } from './components/PhpCodeViewer';
import { QRScannerModal } from './components/QRScannerModal';
import { PrintTiketModal } from './components/PrintTiketModal';
import { CartModal } from './components/CartModal';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { Shield, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useLab();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Bar Navigation */}
      <Navbar 
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenCartModal={() => setIsCartModalOpen(true)}
      />

      {/* Main Viewport Container (1440px baseline presence) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'katalog' && <KatalogAlat />}
        {activeTab === 'peminjaman' && <FormPeminjaman />}
        {activeTab === 'verifikasi' && <VerifikasiPeminjaman />}
        {activeTab === 'pengembalian' && <PengembalianAlat />}
        {activeTab === 'perawatan' && <PerawatanAlat />}
        {activeTab === 'laporan' && <LaporanRekap />}
        {activeTab === 'php_code' && <PhpCodeViewer />}
      </main>

      {/* Clean Academic Lab Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight">SIMPEL-LAB</span>
            <span>·</span>
            <span>Sistem Informasi Manajemen & Peminjaman Alat Laboratorium</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Standar Akreditasi KAN ISO/IEC 17025</span>
            <span>·</span>
            <span>Jam Pelayanan: 08:00 - 16:30 WIB</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <QRScannerModal />
      <PrintTiketModal />
      <CartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />
      <RoleSwitcherModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />

    </div>
  );
};

export default function App() {
  return (
    <LabProvider>
      <MainContent />
    </LabProvider>
  );
}
