import React from 'react';
import { useLab } from '../context/LabContext';
import { UserRole } from '../types';
import { ShieldCheck, User, Wrench, GraduationCap, X, Check } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRole } = useLab();

  if (!isOpen) return null;

  const roles: Array<{
    id: UserRole;
    title: string;
    description: string;
    icon: React.ReactNode;
    sampleName: string;
  }> = [
    {
      id: 'ADMIN_LAB',
      title: 'Administrator / Kepala Laboratorium',
      description: 'Akses penuh kelola inventaris alat, persetujuan permohonan, laporan resmi, dan tarif denda.',
      icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
      sampleName: 'Bagus Prasetyo, S.T., M.Eng.',
    },
    {
      id: 'ASISTEN_LAB',
      title: 'Pranata Laboran / Asisten Lab',
      description: 'Verifikasi checklist kelengkapan aksesoris, serah terima barang fisik, dan log servis.',
      icon: <Wrench className="w-5 h-5 text-blue-400" />,
      sampleName: 'Rizal Fahmi Pratama, S.Si.',
    },
    {
      id: 'MAHASISWA',
      title: 'Mahasiswa / Peneliti Peminjam',
      description: 'Jelajahi katalog alat, ajukan permohonan peminjaman praktikum & riset tugas akhir.',
      icon: <User className="w-5 h-5 text-amber-400" />,
      sampleName: 'Muhammad Fauzan Alamsyah',
    },
    {
      id: 'DOSEN',
      title: 'Dosen Pembimbing / Peneliti Utama',
      description: 'Menyetujui proyek penelitian mahasiswa bimbingan dan peminjaman alat berisiko tinggi.',
      icon: <GraduationCap className="w-5 h-5 text-indigo-400" />,
      sampleName: 'Dr. apt. Rina Kusuma, M.Si.',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ganti Peran Pengguna (Demo Role Switcher)
            </h3>
            <p className="text-xs text-slate-500">
              Uji coba aplikasi dari berbagai perspektif hak akses laboratorium
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles list */}
        <div className="space-y-2.5">
          {roles.map((r) => {
            const isSelected = currentUser.role === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      {r.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{r.title}</h4>
                      <p className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {r.sampleName}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                  )}
                </div>

                <p className={`text-[11px] mt-2.5 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-400">
            Peran aktif saat ini: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>

      </div>
    </div>
  );
};
