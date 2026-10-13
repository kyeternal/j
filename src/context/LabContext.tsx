import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Alat, 
  Kategori, 
  Peminjaman, 
  Perawatan, 
  UserSession, 
  CartItem, 
  UserRole,
  KondisiAlat
} from '../types';
import { 
  INITIAL_ALAT, 
  INITIAL_CATEGORIES, 
  INITIAL_PEMINJAMAN, 
  INITIAL_PERAWATAN, 
  INITIAL_USER 
} from '../data/initialData';

interface LabContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTicketForReturn: string | null;
  setSelectedTicketForReturn: (ticket: string | null) => void;
  selectedAlatForDetail: Alat | null;
  setSelectedAlatForDetail: (alat: Alat | null) => void;
  
  // Data
  alatList: Alat[];
  kategoriList: Kategori[];
  peminjamanList: Peminjaman[];
  perawatanList: Perawatan[];
  currentUser: UserSession;
  cart: CartItem[];
  
  // Cart Actions
  addToCart: (alat: Alat, jumlah?: number) => void;
  removeFromCart: (alatId: string) => void;
  updateCartQuantity: (alatId: string, delta: number) => void;
  clearCart: () => void;
  
  // Equipment Actions
  addAlat: (alat: Omit<Alat, 'id'>) => void;
  updateAlat: (id: string, alat: Partial<Alat>) => void;
  deleteAlat: (id: string) => void;
  
  // Category Actions
  addKategori: (kat: Omit<Kategori, 'id'>) => void;
  updateKategori: (id: string, kat: Partial<Kategori>) => void;
  
  // Loan Operations
  submitPeminjaman: (data: Omit<Peminjaman, 'id' | 'kodeTiket' | 'status' | 'dendaKeterlambatan' | 'dendaKerusakan' | 'totalDenda' | 'tanggalPengajuan'>) => Peminjaman;
  approvePeminjaman: (id: string, catatan?: string) => void;
  rejectPeminjaman: (id: string, alasan: string) => void;
  handoverPeminjaman: (id: string, petugas: string) => void;
  processPengembalian: (
    id: string, 
    params: {
      kondisiPengembalian: 'LENGKAP_BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'KOMPONEN_HILANG';
      dendaKerusakan: number;
      catatanPengembalian: string;
      diterimaKembaliOleh: string;
    }
  ) => void;
  
  // Maintenance Operations
  addPerawatan: (data: Omit<Perawatan, 'id'>) => void;
  updatePerawatanStatus: (id: string, status: 'DIJADWALKAN' | 'DALAM_PROSES' | 'SELESAI', hasil?: string) => void;
  
  // User Persona Switcher
  switchRole: (role: UserRole) => void;
  updateProfile: (profile: Partial<UserSession>) => void;
  
  // Quick Utilities & Modals
  isQRScannerOpen: boolean;
  setIsQRScannerOpen: (open: boolean) => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
  printData: Peminjaman | null;
  setPrintData: (data: Peminjaman | null) => void;
  resetAllData: () => void;
  
  // Statistics & Metrics
  stats: {
    totalAlat: number;
    totalUnit: number;
    unitTersedia: number;
    sedangDipinjam: number;
    menungguVerifikasi: number;
    terlambat: number;
    dalamPerawatan: number;
    totalDendaTerkumpul: number;
  };
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ALAT: 'simpel_lab_alat_v2',
  KATEGORI: 'simpel_lab_kategori_v2',
  PEMINJAMAN: 'simpel_lab_peminjaman_v2',
  PERAWATAN: 'simpel_lab_perawatan_v2',
  USER: 'simpel_lab_user_v2',
  CART: 'simpel_lab_cart_v2',
};

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTicketForReturn, setSelectedTicketForReturn] = useState<string | null>(null);
  const [selectedAlatForDetail, setSelectedAlatForDetail] = useState<Alat | null>(null);

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<Peminjaman | null>(null);

  // Initialize from LocalStorage or Fallback
  const [alatList, setAlatList] = useState<Alat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALAT);
      return saved ? JSON.parse(saved) : INITIAL_ALAT;
    } catch {
      return INITIAL_ALAT;
    }
  });

  const [kategoriList, setKategoriList] = useState<Kategori[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KATEGORI);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [peminjamanList, setPeminjamanList] = useState<Peminjaman[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PEMINJAMAN);
      return saved ? JSON.parse(saved) : INITIAL_PEMINJAMAN;
    } catch {
      return INITIAL_PEMINJAMAN;
    }
  });

  const [perawatanList, setPerawatanList] = useState<Perawatan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERAWATAN);
      return saved ? JSON.parse(saved) : INITIAL_PERAWATAN;
    } catch {
      return INITIAL_PERAWATAN;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALAT, JSON.stringify(alatList));
  }, [alatList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(kategoriList));
  }, [kategoriList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PEMINJAMAN, JSON.stringify(peminjamanList));
  }, [peminjamanList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERAWATAN, JSON.stringify(perawatanList));
  }, [perawatanList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Recalculate overdue loans dynamically based on current date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setPeminjamanList((prev) => 
      prev.map((item) => {
        if (item.status === 'SEDANG_DIPINJAM' && item.tanggalRencanaKembali < today) {
          const planDate = new Date(item.tanggalRencanaKembali).getTime();
          const currDate = new Date(today).getTime();
          const diffDays = Math.max(1, Math.round((currDate - planDate) / (1000 * 3600 * 24)));
          const lateFee = diffDays * 10000; // Rp 10.000 per hari terlambat
          return {
            ...item,
            status: 'TERLAMBAT',
            dendaKeterlambatan: lateFee,
            totalDenda: lateFee + (item.dendaKerusakan || 0),
            statusPembayaranDenda: 'BELUM_LUNAS',
          };
        }
        return item;
      })
    );
  }, []);

  // Cart Management
  const addToCart = (alat: Alat, jumlah: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.alat.id === alat.id);
      if (existing) {
        const newQty = Math.min(existing.jumlah + jumlah, alat.stokTersedia);
        return prev.map((item) => 
          item.alat.id === alat.id ? { ...item, jumlah: newQty } : item
        );
      }
      return [...prev, { alat, jumlah: Math.min(jumlah, Math.max(1, alat.stokTersedia)) }];
    });
  };

  const removeFromCart = (alatId: string) => {
    setCart((prev) => prev.filter((item) => item.alat.id !== alatId));
  };

  const updateCartQuantity = (alatId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.alat.id === alatId) {
            const nextQty = item.jumlah + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.alat.stokTersedia) return item;
            return { ...item, jumlah: nextQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => setCart([]);

  // Equipment CRUD
  const addAlat = (newAlat: Omit<Alat, 'id'>) => {
    const id = newAlat.kode || `ALT-${Date.now().toString().slice(-4)}`;
    const fullAlat: Alat = { ...newAlat, id };
    setAlatList((prev) => [fullAlat, ...prev]);
  };

  const updateAlat = (id: string, updated: Partial<Alat>) => {
    setAlatList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteAlat = (id: string) => {
    setAlatList((prev) => prev.filter((item) => item.id !== id));
  };

  // Category Actions
  const addKategori = (kat: Omit<Kategori, 'id'>) => {
    const id = `KAT-${kat.kodePrefix.toUpperCase()}`;
    setKategoriList((prev) => [...prev, { ...kat, id }]);
  };

  const updateKategori = (id: string, kat: Partial<Kategori>) => {
    setKategoriList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...kat } : item))
    );
  };

  // Submit Loan Request
  const submitPeminjaman = (
    data: Omit<Peminjaman, 'id' | 'kodeTiket' | 'status' | 'dendaKeterlambatan' | 'dendaKerusakan' | 'totalDenda' | 'tanggalPengajuan'>
  ): Peminjaman => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const kodeTiket = `PINJAM-${dateStr}-${randomSeq}`;
    const nowIso = new Date().toISOString();

    const newLoan: Peminjaman = {
      ...data,
      id: kodeTiket,
      kodeTiket,
      tanggalPengajuan: nowIso,
      status: 'MENUNGGU_VERIFIKASI',
      dendaKeterlambatan: 0,
      dendaKerusakan: 0,
      totalDenda: 0,
    };

    setPeminjamanList((prev) => [newLoan, ...prev]);
    clearCart();
    return newLoan;
  };

  // Approve Loan Request (Reduces available stock)
  const approvePeminjaman = (id: string, catatan?: string) => {
    setPeminjamanList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'DISETUJUI',
            catatanVerifikasi: catatan || 'Disetujui oleh Administrator Laboratorium.',
            disetujuiOleh: currentUser.name,
          };
        }
        return p;
      })
    );
  };

  // Reject Loan Request
  const rejectPeminjaman = (id: string, alasan: string) => {
    setPeminjamanList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'DITOLAK',
            alasanPenolakan: alasan,
            disetujuiOleh: currentUser.name,
          };
        }
        return p;
      })
    );
  };

  // Handover (Equipment physical checkout / taken by student)
  const handoverPeminjaman = (id: string, petugas: string) => {
    const loan = peminjamanList.find((p) => p.id === id);
    if (!loan) return;

    // Deduct stock
    setAlatList((prev) =>
      prev.map((alat) => {
        const itemInLoan = loan.items.find((i) => i.alatId === alat.id);
        if (itemInLoan) {
          return {
            ...alat,
            stokTersedia: Math.max(0, alat.stokTersedia - itemInLoan.jumlah),
          };
        }
        return alat;
      })
    );

    setPeminjamanList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'SEDANG_DIPINJAM',
            serahTerimaOleh: petugas || currentUser.name,
          };
        }
        return p;
      })
    );
  };

  // Process Return
  const processPengembalian = (
    id: string,
    params: {
      kondisiPengembalian: 'LENGKAP_BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'KOMPONEN_HILANG';
      dendaKerusakan: number;
      catatanPengembalian: string;
      diterimaKembaliOleh: string;
    }
  ) => {
    const loan = peminjamanList.find((p) => p.id === id);
    if (!loan) return;

    const today = new Date().toISOString().split('T')[0];
    const planDate = new Date(loan.tanggalRencanaKembali).getTime();
    const returnDate = new Date(today).getTime();
    const diffDays = Math.max(0, Math.round((returnDate - planDate) / (1000 * 3600 * 24)));
    const dendaTelat = diffDays > 0 ? diffDays * 10000 : 0;
    const totalDenda = dendaTelat + params.dendaKerusakan;

    // Restore stock and adjust condition if broken
    setAlatList((prev) =>
      prev.map((alat) => {
        const itemInLoan = loan.items.find((i) => i.alatId === alat.id);
        if (itemInLoan) {
          let newKondisi: KondisiAlat = alat.kondisi;
          if (params.kondisiPengembalian === 'RUSAK_RINGAN') newKondisi = 'RUSAK_RINGAN';
          if (params.kondisiPengembalian === 'RUSAK_BERAT') newKondisi = 'RUSAK_BERAT';

          return {
            ...alat,
            stokTersedia: Math.min(alat.totalStok, alat.stokTersedia + itemInLoan.jumlah),
            kondisi: newKondisi,
          };
        }
        return alat;
      })
    );

    setPeminjamanList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'SELESAI',
            tanggalAktualKembali: new Date().toISOString(),
            kondisiPengembalian: params.kondisiPengembalian,
            diterimaKembaliOleh: params.diterimaKembaliOleh || currentUser.name,
            dendaKeterlambatan: dendaTelat,
            dendaKerusakan: params.dendaKerusakan,
            totalDenda,
            statusPembayaranDenda: totalDenda > 0 ? 'LUNAS' : 'TIDAK_ADA',
            catatanPengembalian: params.catatanPengembalian,
          };
        }
        return p;
      })
    );
  };

  // Maintenance
  const addPerawatan = (data: Omit<Perawatan, 'id'>) => {
    const id = `MAINT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newMaint: Perawatan = { ...data, id };

    setPerawatanList((prev) => [newMaint, ...prev]);

    // Update equipment condition & reserve stock
    if (data.status === 'DALAM_PROSES') {
      setAlatList((prev) =>
        prev.map((alat) => {
          if (alat.id === data.alatId) {
            return {
              ...alat,
              kondisi: 'DALAM_PERAWATAN',
              stokTersedia: Math.max(0, alat.stokTersedia - 1),
            };
          }
          return alat;
        })
      );
    }
  };

  const updatePerawatanStatus = (
    id: string,
    status: 'DIJADWALKAN' | 'DALAM_PROSES' | 'SELESAI',
    hasil?: string
  ) => {
    const maint = perawatanList.find((m) => m.id === id);
    if (!maint) return;

    setPerawatanList((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status,
            hasilPemeriksaan: hasil || m.hasilPemeriksaan,
            tanggalSelesai: status === 'SELESAI' ? new Date().toISOString().split('T')[0] : m.tanggalSelesai,
          };
        }
        return m;
      })
    );

    // If finished, restore condition to BAIK
    if (status === 'SELESAI') {
      setAlatList((prev) =>
        prev.map((alat) => {
          if (alat.id === maint.alatId) {
            return {
              ...alat,
              kondisi: 'BAIK',
              stokTersedia: Math.min(alat.totalStok, alat.stokTersedia + 1),
            };
          }
          return alat;
        })
      );
    }
  };

  // Role switch
  const switchRole = (role: UserRole) => {
    let mockProfile: UserSession;
    if (role === 'ADMIN_LAB') {
      mockProfile = {
        role: 'ADMIN_LAB',
        name: 'Bagus Prasetyo, S.T., M.Eng.',
        nimNip: '198804152014041002',
        email: 'bagus.prasetyo@univ.ac.id',
        prodi: 'Laboratorium Terpadu Sains & Teknologi',
        noHp: '081223344556',
      };
    } else if (role === 'ASISTEN_LAB') {
      mockProfile = {
        role: 'ASISTEN_LAB',
        name: 'Rizal Fahmi Pratama, S.Si.',
        nimNip: '199510122022031005',
        email: 'rizal.fahmi@lab.univ.ac.id',
        prodi: 'Laboran Pengelola Alat Riset',
        noHp: '081377889900',
      };
    } else if (role === 'DOSEN') {
      mockProfile = {
        role: 'DOSEN',
        name: 'Dr. apt. Rina Kusuma, M.Si.',
        nimNip: '197902142006042001',
        email: 'rina.kusuma@farmasi.ac.id',
        prodi: 'Departemen Bioteknologi & Farmasi',
        noHp: '081122334455',
      };
    } else {
      mockProfile = {
        role: 'MAHASISWA',
        name: 'Muhammad Fauzan Alamsyah',
        nimNip: '22/498213/TK/54120',
        email: 'm.fauzan.a@mail.ugm.ac.id',
        prodi: 'Teknik Elektro dan Teknologi Informasi',
        noHp: '081234567890',
      };
    }
    setCurrentUser(mockProfile);
  };

  const updateProfile = (profile: Partial<UserSession>) => {
    setCurrentUser((prev) => ({ ...prev, ...profile }));
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.ALAT);
    localStorage.removeItem(STORAGE_KEYS.KATEGORI);
    localStorage.removeItem(STORAGE_KEYS.PEMINJAMAN);
    localStorage.removeItem(STORAGE_KEYS.PERAWATAN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CART);

    setAlatList(INITIAL_ALAT);
    setKategoriList(INITIAL_CATEGORIES);
    setPeminjamanList(INITIAL_PEMINJAMAN);
    setPerawatanList(INITIAL_PERAWATAN);
    setCurrentUser(INITIAL_USER);
    setCart([]);
  };

  // Stats calculation
  const totalAlat = alatList.length;
  const totalUnit = alatList.reduce((acc, curr) => acc + curr.totalStok, 0);
  const unitTersedia = alatList.reduce((acc, curr) => acc + curr.stokTersedia, 0);
  const sedangDipinjam = peminjamanList.filter((p) => p.status === 'SEDANG_DIPINJAM').length;
  const menungguVerifikasi = peminjamanList.filter((p) => p.status === 'MENUNGGU_VERIFIKASI').length;
  const terlambat = peminjamanList.filter((p) => p.status === 'TERLAMBAT').length;
  const dalamPerawatan = perawatanList.filter((p) => p.status === 'DALAM_PROSES').length;
  const totalDendaTerkumpul = peminjamanList
    .filter((p) => p.statusPembayaranDenda === 'LUNAS')
    .reduce((acc, curr) => acc + curr.totalDenda, 0);

  return (
    <LabContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedTicketForReturn,
        setSelectedTicketForReturn,
        selectedAlatForDetail,
        setSelectedAlatForDetail,
        alatList,
        kategoriList,
        peminjamanList,
        perawatanList,
        currentUser,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addAlat,
        updateAlat,
        deleteAlat,
        addKategori,
        updateKategori,
        submitPeminjaman,
        approvePeminjaman,
        rejectPeminjaman,
        handoverPeminjaman,
        processPengembalian,
        addPerawatan,
        updatePerawatanStatus,
        switchRole,
        updateProfile,
        isQRScannerOpen,
        setIsQRScannerOpen,
        isPrintModalOpen,
        setIsPrintModalOpen,
        printData,
        setPrintData,
        resetAllData,
        stats: {
          totalAlat,
          totalUnit,
          unitTersedia,
          sedangDipinjam,
          menungguVerifikasi,
          terlambat,
          dalamPerawatan,
          totalDendaTerkumpul,
        },
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
