import React from 'react';
import { 
  ShoppingBag, 
  Settings, 
  Store as StoreIcon, 
  Search, 
  Phone, 
  MessageCircle,
  Truck,
  Sparkles,
  X,
  Lock,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { StoreSettings, Language } from '../types';
import { formatCurrency, buildWhatsAppLink } from '../utils/whatsapp';
import { getTranslation } from '../utils/translations';

interface HeaderProps {
  settings: StoreSettings;
  cartCount: number;
  cartTotal: number;
  currentView: 'store' | 'admin';
  onViewChange: (view: 'store' | 'admin') => void;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAdminAuthenticated: boolean;
  onOpenAdminAuth: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentLang: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  cartTotal,
  currentView,
  onViewChange,
  onOpenCart,
  searchQuery,
  onSearchChange,
  isAdminAuthenticated,
  onOpenAdminAuth,
  isDarkMode,
  onToggleDarkMode,
  currentLang,
  onToggleLanguage,
}) => {
  const t = getTranslation(currentLang);
  const whatsappUrl = 'https://wa.me/message/NLV2EU2CTTDGN1';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Top Announcement Bar */}
      {settings.announcementText && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs font-semibold py-1.5 px-4 text-center overflow-hidden flex items-center justify-center gap-2">
          <Truck className="w-3.5 h-3.5 shrink-0 animate-pulse text-emerald-200" />
          <span className="truncate">{settings.announcementText}</span>
        </div>
      )}

      {/* Main Nav Container */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Store Info */}
          <div 
            onClick={() => onViewChange('store')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <img
                src={settings.logo || '/assets/aistudio/IMG_6271_1755271c.jpeg'}
                alt={settings.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-md group-hover:scale-105 group-hover:border-emerald-500 transition-all duration-300 bg-white dark:bg-slate-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/aistudio/IMG_6271_1755271c.jpeg';
                }}
              />
              <span className="absolute -bottom-1 -left-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition leading-tight">
                  {settings.name}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {t.availableForOrder}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span>{t.managedBy}</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{settings.ownerName || 'صاحب المتجر'}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500 text-[11px]">{settings.deliveryTime}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Switcher Button (العربية / English) */}
            <button
              onClick={onToggleLanguage}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer font-bold text-xs"
              title={currentLang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
              aria-label="تبديل اللغة / Toggle Language"
            >
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-black text-[11px] sm:text-xs">
                {currentLang === 'ar' ? 'English' : 'عربي'}
              </span>
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title={isDarkMode ? 'التحويل للوضع النهاري (فاتح)' : 'التحويل للوضع الليلي (داكن)'}
              aria-label="تبديل الوضع المظلم"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-xs font-bold text-slate-200">{t.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden md:inline text-xs font-bold text-slate-700">{t.darkMode}</span>
                </>
              )}
            </button>

            {/* View Switcher: Storefront vs Admin */}
            {currentView === 'store' ? (
              settings.hideAdminButtonFromPublic && !isAdminAuthenticated ? null : (
                <button
                  onClick={isAdminAuthenticated ? () => onViewChange('admin') : onOpenAdminAuth}
                  className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition border border-slate-200/80 dark:border-slate-700 shadow-xs cursor-pointer"
                  title={isAdminAuthenticated ? t.adminDashboard : t.enterAdmin}
                >
                  {isAdminAuthenticated ? (
                    <>
                      <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-hover" />
                      <span className="hidden sm:inline">{t.adminDashboard}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="hidden sm:inline">{t.enterAdmin}</span>
                    </>
                  )}
                </button>
              )
            ) : (
              <button
                onClick={() => onViewChange('store')}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm cursor-pointer"
                title={t.backToStore}
              >
                <StoreIcon className="w-4 h-4" />
                <span>{t.backToStore}</span>
              </button>
            )}

            {/* Cart Trigger in Header */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              aria-label="سلة المشتريات"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">{t.cart}</span>
              {cartTotal > 0 && (
                <span className="hidden md:inline-block font-extrabold text-emerald-100 text-xs bg-emerald-800/40 px-2 py-0.5 rounded-lg border border-emerald-400/30">
                  {formatCurrency(cartTotal, settings.currency)}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Search bar inside header when on store view */}
        {currentView === 'store' && (
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-1/2 -translate-y-1/2 ${currentLang === 'ar' ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition ${currentLang === 'ar' ? 'pr-9 pl-9' : 'pl-9 pr-9'}`}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 ${currentLang === 'ar' ? 'left-3' : 'right-3'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition"
              title={t.quickWhatsApp}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.quickWhatsApp}</span>
            </a>

            <a
              href={`tel:${settings.phoneNumber}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 transition"
              title={t.directCall}
            >
              <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t.directCall}</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
