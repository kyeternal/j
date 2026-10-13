import React from 'react';
import { useLab } from '../context/LabContext';
import { Printer, X, Check, ShieldCheck } from 'lucide-react';

export const PrintTiketModal: React.FC = () => {
  const { isPrintModalOpen, setIsPrintModalOpen, printData } = useLab();

  if (!isPrintModalOpen || !printData) return null;

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 print:border-none print:shadow-none print:p-0">
        
        {/* Action Header (Hidden during print) */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pratinjau Surat Izin Peminjaman Alat Resmi
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Nomor: {printData.kodeTiket}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="space-y-6 text-xs text-slate-800">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between gap-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg shrink-0">
              SL
            </div>
            <div className="text-center flex-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                UNIVERSITAS RISET DAN TEKNOLOGI
              </h2>
              <h3 className="text-sm font-extrabold uppercase text-slate-900">
                UNIT LABORATORIUM TERPADU & PUSAT INSTRUMEN
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Surat Izin Peminjaman Instrumen Penelitian & Praktikum · Form SIMPEL-LAB/BA-01
              </p>
            </div>
            <div className="w-16 text-right font-mono text-[10px] text-slate-500 shrink-0">
              SALINAN RESMI
            </div>
          </div>

          {/* Ticket metadata */}
          <div className="flex justify-between items-start font-mono text-xs border-b border-slate-200 pb-3">
            <div>
              <p><span className="text-slate-500">NO. TIKET :</span> <strong>{printData.kodeTiket}</strong></p>
              <p><span className="text-slate-500">TGL PENGAJUAN :</span> {formatDate(printData.tanggalPengajuan)}</p>
            </div>
            <div className="text-right">
              <p><span className="text-slate-500">STATUS :</span> <strong>{printData.status}</strong></p>
              <p><span className="text-slate-500">DURASI :</span> {printData.tanggalPinjam} s/d {printData.tanggalRencanaKembali}</p>
            </div>
          </div>

          {/* Borrower information */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              I. IDENTITAS PENANGGUNG JAWAB & PEMINJAM
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p><strong>Nama Peminjam:</strong> {printData.namaPeminjam}</p>
              <p><strong>NIM / NIP:</strong> {printData.nimNip}</p>
              <p><strong>Departemen / Prodi:</strong> {printData.prodiDepartemen}</p>
              <p><strong>Kontak / WA:</strong> {printData.noHp}</p>
              <p><strong>Keperluan:</strong> {printData.keperluan}</p>
              <p><strong>Dosen Pembimbing:</strong> {printData.dosenPembimbing}</p>
              <p className="col-span-2"><strong>Judul Riset/Kegiatan:</strong> {printData.judulKegiatan}</p>
            </div>
          </div>

          {/* Equipment list */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-100 pb-1">
              II. RINCIAN ALAT LABORATORIUM
            </h4>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Kode Alat</th>
                  <th className="p-2">Nama Instrumen</th>
                  <th className="p-2 text-center">Jumlah</th>
                  <th className="p-2">Aksesoris Disertakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {printData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 font-mono font-bold">{item.kodeAlat}</td>
                    <td className="p-2">{item.namaAlat}</td>
                    <td className="p-2 text-center font-mono font-bold">{item.jumlah} Unit</td>
                    <td className="p-2 text-[11px] text-slate-600">
                      {item.aksesoris.slice(0, 3).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Terms */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1 text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-900">Klausul Perjanjian & Tata Tertib Laboratorium:</p>
            <p>1. Peminjam bertanggung jawab penuh atas kebersihan, keamanan, dan keutuhan seluruh unit beserta aksesorisnya.</p>
            <p>2. Keterlambatan pengembalian dikenakan sanksi denda administratif sebesar <strong>Rp 10.000 / hari</strong> keterlambatan.</p>
            <p>3. Kerusakan fisik atau kehilangan komponen menjadi kewajiban peminjam untuk mengganti suku cadang asli sesuai rekomendasi teknisi.</p>
          </div>

          {/* Signature Box */}
          <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p>Peminjam / Penanggung Jawab,</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">{printData.namaPeminjam}</p>
              <p className="font-mono text-slate-500 text-[10px]">NIM. {printData.nimNip}</p>
            </div>

            <div>
              <p>Petugas Laboran Penyerah,</p>
              <div className="h-16" />
              <p className="font-bold underline text-slate-900">{printData.serahTerimaOleh || printData.disetujuiOleh || 'Petugas Laboratorium'}</p>
              <p className="font-mono text-slate-500 text-[10px]">Pranata Laboratorium Pendidikan</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
