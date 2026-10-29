import React from 'react';
import { Plus, Minus, ShoppingCart, Check, Tag } from 'lucide-react';
import { Product, StoreSettings, Language } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  settings: StoreSettings;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onViewDetails?: (product: Product) => void;
  lang?: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  settings,
  onAddToCart,
  onUpdateQuantity,
  onViewDetails,
  lang = 'ar',
}) => {
  const isEn = lang === 'en';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onViewDetails?.(product)}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80';
          }}
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end z-10">
          {product.badge && (
            <span className="bg-emerald-600/95 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md">
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="bg-rose-500/95 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              {isEn ? `${discountPercentage}% OFF` : `خصم ${discountPercentage}%`}
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-lg">
              {isEn ? 'Out of stock' : 'نفدت الكمية حالياً'}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
            <span>{product.category || (isEn ? 'General' : 'عام')}</span>
            {quantityInCart > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                {isEn ? `In Cart (${quantityInCart})` : `في السلة (${quantityInCart})`}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails?.(product)}
            className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer transition mb-1 leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short Description */}
          {product.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Interactive Quantity Selector */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <div>
              <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                {formatCurrency(product.price, settings.currency)}
              </div>
              {hasDiscount && (
                <div className="text-xs text-slate-400 dark:text-slate-500 line-through">
                  {formatCurrency(product.originalPrice!, settings.currency)}
                </div>
              )}
            </div>

            {quantityInCart > 0 && (
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/90 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {isEn ? 'Total: ' : 'الإجمالي: '}<span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{formatCurrency(product.price * quantityInCart, settings.currency)}</span>
              </div>
            )}
          </div>

          {/* Quantity Controls / Add to Cart */}
          {quantityInCart === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
                product.inStock
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{product.inStock ? (isEn ? 'Add to Cart' : 'أضف للسلة') : (isEn ? 'Out of stock' : 'غير متوفر')}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between bg-slate-100/90 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-200 font-black flex items-center justify-center shadow-xs transition active:scale-90 cursor-pointer"
                title={isEn ? 'Decrease quantity' : 'تقليل العدد'}
                aria-label={isEn ? 'Decrease quantity' : 'تقليل العدد'}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{isEn ? 'Qty' : 'العدد'}</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                  {quantityInCart}
                </span>
              </div>

              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center shadow-xs transition active:scale-90 cursor-pointer"
                title={isEn ? 'Increase quantity' : 'زيادة العدد'}
                aria-label={isEn ? 'Increase quantity' : 'زيادة العدد'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
