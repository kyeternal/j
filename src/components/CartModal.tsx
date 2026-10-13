import React from 'react';
import { useLab } from '../context/LabContext';
import { ShoppingBag, X, Trash2, ArrowRight, Package } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, setActiveTab } = useLab();

  if (!isOpen) return null;

  const totalItems = cart.reduce((acc, curr) => acc + curr.jumlah, 0);

  const handleProceedToForm = () => {
    onClose();
    setActiveTab('peminjaman');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            <h3 className="text-base font-bold text-slate-900">
              Keranjang Peminjaman Alat ({totalItems} unit)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        {cart.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-xs text-slate-600">Keranjang masih kosong.</p>
            <p className="text-[11px] text-slate-400">Pilih alat laboratorium dari menu Katalog untuk mulai meminjam.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.alat.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{item.alat.nama}</h4>
                  <p className="text-slate-500 font-mono text-[11px]">{item.alat.kode} · {item.alat.lokasiRak}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.alat.id, -1)}
                      className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 rounded-l"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-0.5 font-mono font-bold text-slate-900">
                      {item.jumlah}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.alat.id, 1)}
                      disabled={item.jumlah >= item.alat.stokTersedia}
                      className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 rounded-r disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.alat.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-slate-400 hover:text-rose-600 font-medium"
            >
              Kosongkan Keranjang
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Tutup
            </button>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleProceedToForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg shadow-sm"
            >
              <span>Lanjut ke Formulir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
