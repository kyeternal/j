import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { 
  QrCode, 
  X, 
  Camera, 
  Search, 
  ArrowRight, 
  CheckCircle,
  Package,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const QRScannerModal: React.FC = () => {
  const { 
    isQRScannerOpen, 
    setIsQRScannerOpen, 
    alatList, 
    peminjamanList, 
    setSelectedAlatForDetail,
    setSelectedTicketForReturn,
    setActiveTab 
  } = useLab();

  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    type: 'ALAT' | 'TIKET' | 'UNKNOWN';
    title: string;
    description: string;
    id: string;
  } | null>(null);

  if (!isQRScannerOpen) return null;

  const handleProcessCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Check if it matches equipment
    const matchedAlat = alatList.find(
      a => a.kode.toLowerCase() === cleanCode.toLowerCase() || a.id.toLowerCase() === cleanCode.toLowerCase()
    );

    if (matchedAlat) {
      setScanResult({
        type: 'ALAT',
        title: matchedAlat.nama,
        description: `Kode: ${matchedAlat.kode} · Rak: ${matchedAlat.lokasiRak} · Stok: ${matchedAlat.stokTersedia}/${matchedAlat.totalStok}`,
        id: matchedAlat.id,
      });
      return;
    }

    // Check if it matches loan ticket
    const matchedLoan = peminjamanList.find(
      p => p.kodeTiket.toLowerCase() === cleanCode.toLowerCase() || p.id.toLowerCase() === cleanCode.toLowerCase()
    );

    if (matchedLoan) {
      setScanResult({
        type: 'TIKET',
        title: `Tiket: ${matchedLoan.kodeTiket}`,
        description: `Peminjam: ${matchedLoan.namaPeminjam} (${matchedLoan.status}) · Batas: ${matchedLoan.tanggalRencanaKembali}`,
        id: matchedLoan.kodeTiket,
      });
      return;
    }

    setScanResult({
      type: 'UNKNOWN',
      title: 'Kode Tidak Terdaftar',
      description: `Kode "${cleanCode}" tidak ditemukan di database inventaris atau tiket peminjaman.`,
      id: cleanCode,
    });
  };

  const handleActionRedirect = () => {
    if (!scanResult) return;

    if (scanResult.type === 'ALAT') {
      const alat = alatList.find(a => a.id === scanResult.id);
      if (alat) {
        setSelectedAlatForDetail(alat);
        setActiveTab('katalog');
      }
    } else if (scanResult.type === 'TIKET') {
      const loan = peminjamanList.find(p => p.kodeTiket === scanResult.id);
      if (loan) {
        if (loan.status === 'SEDANG_DIPINJAM' || loan.status === 'TERLAMBAT') {
          setSelectedTicketForReturn(loan.kodeTiket);
          setActiveTab('pengembalian');
        } else {
          setActiveTab('verifikasi');
        }
      }
    }

    setIsQRScannerOpen(false);
    setScanResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900 text-white rounded-lg">
              <Camera className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pemindai QR Code & Barcode Lab
              </h3>
              <p className="text-[11px] text-slate-500">
                Pindai instrumen lab atau tiket permohonan peminjaman
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsQRScannerOpen(false);
              setScanResult(null);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder simulation frame */}
        <div className="relative aspect-4/3 bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-800">
          {/* Laser scanning beam */}
          <div className="absolute inset-x-0 h-0.5 bg-teal-400 shadow-[0_0_12px_#2dd4bf] animate-[bounce_2.5s_infinite]" />

          {/* Crosshair corners */}
          <div className="relative w-48 h-48 border-2 border-teal-500/60 rounded-xl flex items-center justify-center">
            <QrCode className="w-16 h-16 text-teal-500/30 animate-pulse" />
            
            {/* Viewfinder corner marks */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-teal-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-teal-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-teal-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-teal-400" />
          </div>

          <p className="text-[11px] text-teal-300 font-mono mt-3">
            Arahkan kamera ke QR Code alat atau tiket...
          </p>
        </div>

        {/* Quick Simulation Samples */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Uji Pindai Sampel Cepat (1-Klik):
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleProcessCode('ALT-BIO-001')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <span className="font-bold text-slate-900 block truncate">ALT-BIO-001</span>
              <span className="text-[10px] text-slate-500 block truncate">Mikroskop Zeiss</span>
            </button>

            <button
              type="button"
              onClick={() => handleProcessCode('ALT-ELK-001')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <span className="font-bold text-slate-900 block truncate">ALT-ELK-001</span>
              <span className="text-[10px] text-slate-500 block truncate">Oscilloscope Rigol</span>
            </button>

            <button
              type="button"
              onClick={() => handleProcessCode('PINJAM-2026-0041')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <span className="font-bold text-slate-900 block truncate">PINJAM-2026-0041</span>
              <span className="text-[10px] text-teal-700 block truncate">Tiket Aktif Fauzan</span>
            </button>

            <button
              type="button"
              onClick={() => handleProcessCode('PINJAM-2026-0038')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <span className="font-bold text-slate-900 block truncate">PINJAM-2026-0038</span>
              <span className="text-[10px] text-rose-700 block truncate">Tiket Terlambat (Denda)</span>
            </button>
          </div>
        </div>

        {/* Manual Keyboard Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleProcessCode(manualCode);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Ketik kode barcode manual..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
          >
            Cari
          </button>
        </form>

        {/* Scan Result Feedback Card */}
        {scanResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            scanResult.type === 'UNKNOWN' 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : 'bg-teal-50 border-teal-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-2">
              {scanResult.type === 'UNKNOWN' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-teal-700 shrink-0" />
              )}
              <h4 className="font-bold text-xs">{scanResult.title}</h4>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 font-mono">
              {scanResult.description}
            </p>

            {scanResult.type !== 'UNKNOWN' && (
              <button
                type="button"
                onClick={handleActionRedirect}
                className="w-full mt-2 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>
                  {scanResult.type === 'ALAT' ? 'Buka Detail Spesifikasi Alat' : 'Buka Formulir Pengembalian / Verifikasi'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
