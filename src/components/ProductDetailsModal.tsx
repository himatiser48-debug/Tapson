import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, Tag, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, buildWhatsAppLink } from '../utils/whatsapp';

interface ProductDetailsModalProps {
  product: Product | null;
  settings: StoreSettings;
  quantityInCart: number;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  settings,
  quantityInCart,
  onClose,
  onAddToCart,
  onUpdateQuantity,
}) => {
  if (!product) return null;

  const [localQty, setLocalQty] = useState(quantityInCart > 0 ? quantityInCart : 1);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleApply = () => {
    onUpdateQuantity(product.id, localQty);
    onClose();
  };

  const productWhatsAppUrl = 'https://wa.me/message/NLV2EU2CTTDGN1';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-fadeIn flex flex-col md:flex-row transition-colors"
        dir="rtl"
      >
        {/* Product Image Section */}
        <div className="md:w-1/2 relative bg-slate-100 dark:bg-slate-800 min-h-[260px] md:min-h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
            }}
          />
          {product.badge && (
            <span className="absolute top-3 right-3 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
              خصم {discountPercentage}%
            </span>
          )}
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {product.category}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2 leading-tight">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {formatCurrency(product.price, settings.currency)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                  {formatCurrency(product.originalPrice!, settings.currency)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              {product.description || 'منتج عالي الجودة متوفر للطلب الفوري مع إمكانية المعاينة عند الاستلام.'}
            </p>

            {/* Perks */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>توصيل سريع: {settings.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>معاينة المنتج والبرمجة والتخصيص</span>
              </div>
            </div>
          </div>

          {/* Quantity, Add Button and WhatsApp Inquiry */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">الكمية المطلوبة:</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 shadow-xs cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-black text-sm text-slate-900 dark:text-slate-100">
                  {localQty}
                </span>
                <button
                  onClick={() => setLocalQty(localQty + 1)}
                  className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>الإجمالي لهذا الصنف:</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                {formatCurrency(product.price * localQty, settings.currency)}
              </span>
            </div>

            <button
              onClick={handleApply}
              disabled={!product.inStock}
              className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer ${
                product.inStock
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{product.inStock ? `تأكيد الإضافة للسلة (${formatCurrency(product.price * localQty, settings.currency)})` : 'المنتج غير متوفر'}</span>
            </button>

            {/* Direct WhatsApp Product Inquiry */}
            <a
              href={productWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>استفسار فوري عبر واتساب عن هذا المنتج</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
