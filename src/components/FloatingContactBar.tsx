import React from 'react';
import { Phone, MessageCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { StoreSettings, Language } from '../types';
import { buildWhatsAppLink, formatCurrency } from '../utils/whatsapp';
import { getTranslation } from '../utils/translations';

interface FloatingContactBarProps {
  settings: StoreSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  lang?: Language;
}

export const FloatingContactBar: React.FC<FloatingContactBarProps> = ({
  settings,
  cartCount,
  cartTotal,
  onOpenCart,
  lang = 'ar',
}) => {
  const t = getTranslation(lang);
  // Pure direct link to chat as requested by user
  const whatsappUrl = 'https://wa.me/message/NLV2EU2CTTDGN1';
  const customIdeaWhatsAppUrl = 'https://wa.me/message/NLV2EU2CTTDGN1';

  const tiktokUrl = settings.tiktokUrl || 'https://www.tiktok.com';
  const facebookUrl = settings.facebookUrl || 'https://www.facebook.com';
  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com';

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-2 sm:p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none">
      
      {/* Persistent Custom Idea Bar as requested by user */}
      <div className="mb-2 max-w-4xl mx-auto pointer-events-auto flex justify-center">
        <a
          href={customIdeaWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/50 hover:border-emerald-400 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 text-xs font-bold"
          title="نقدر نعملك أي فكرة حابب تعملها تواصل واتس اب للتنفيذ"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-amber-300 text-sm">💡</span>
          <span className="text-slate-100 group-hover:text-emerald-300 transition text-[11px] sm:text-xs">
            {lang === 'en' 
              ? 'Have a custom idea? We can make it for you! Contact WhatsApp' 
              : 'نقدر نعملك أي فكرة حابب تعملها! تواصل واتساب للتنفيذ'}
          </span>
          <span className="bg-emerald-600 group-hover:bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <MessageCircle className="w-3 h-3 fill-white stroke-emerald-600" />
            <span>{lang === 'en' ? 'Chat' : 'تواصل'}</span>
          </span>
        </a>
      </div>

      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto">
        
        {/* Left / Social & Direct Contact Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* WhatsApp Direct Chat Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.whatsappChat}
            aria-label="WhatsApp"
            className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:scale-95 border border-emerald-400/40"
          >
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white stroke-emerald-600" />
          </a>

          {/* Direct Phone Call Button */}
          <a
            href={`tel:${settings.phoneNumber}`}
            title={t.callUs}
            aria-label="Phone Call"
            className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:scale-95 border border-blue-400/30"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 fill-white stroke-blue-600" />
          </a>

          {/* TikTok Icon & Link */}
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.followOnTiktok}
            aria-label="TikTok"
            className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black hover:bg-slate-900 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:scale-95 border border-slate-700/80 hover:border-cyan-400"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-cyan-300 transition"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.33-6.32V8.92a8.28 8.28 0 0 0 4.84 1.57V7.07a4.93 4.93 0 0 1-.92-.38z"/>
            </svg>
          </a>

          {/* Facebook Icon & Link */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.followOnFacebook}
            aria-label="Facebook"
            className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1877F2] hover:bg-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:scale-95 border border-blue-300/30"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-4 h-4 sm:w-5 sm:h-5"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Instagram Icon & Link */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t.followOnInstagram}
            aria-label="Instagram"
            className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:scale-95 border border-rose-300/30"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>

        </div>

        {/* Right / Floating Cart Trigger Button */}
        {cartCount > 0 ? (
          <button
            onClick={onOpenCart}
            className="flex-1 max-w-[190px] sm:max-w-xs flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 text-white rounded-2xl shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:scale-95 border border-slate-700 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="text-start">
                <div className="text-[11px] font-medium text-slate-300">{t.cart}</div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {formatCurrency(cartTotal, settings.currency)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-xl border border-emerald-500/30">
              <span className="hidden sm:inline">{t.orderNowWhatsApp.split(' ')[0]}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t.cart} (0)</span>
          </button>
        )}

      </div>
    </div>
  );
};
