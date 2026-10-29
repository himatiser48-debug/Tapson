import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Sparkles, 
  SlidersHorizontal, 
  Store, 
  Settings, 
  TrendingUp, 
  ArrowUpDown,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  Lock,
  MessageCircle,
  Lightbulb
} from 'lucide-react';
import { Product, StoreSettings, CartItem, OrderRecord, Language } from './types';
import { DEFAULT_PRODUCTS, DEFAULT_STORE_SETTINGS, DEFAULT_ORDERS, CATEGORIES } from './data/initialData';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { FloatingContactBar } from './components/FloatingContactBar';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ProductVideoExplainer } from './components/ProductVideoExplainer';
import { getTranslation } from './utils/translations';
import { buildWhatsAppLink } from './utils/whatsapp';

export default function App() {
  // Bilingual state with persistence
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('my_store_lang');
      return saved === 'en' || saved === 'ar' ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  const t = getTranslation(language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('my_store_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };
  // Load initial state from LocalStorage or defaults
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('my_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        let changed = false;
        if (!parsed.name || parsed.name === 'متجر النخبة للتسوق' || parsed.name === 'Elite Store' || parsed.name === 'متجري الإلكتروني وفواتير الواتساب') {
          parsed.name = 'Tapson Nfc/Qr';
          changed = true;
        }
        parsed.whatsappNumber = 'https://wa.me/message/NLV2EU2CTTDGN1';
        parsed.whatsappUrl = 'https://wa.me/message/NLV2EU2CTTDGN1';
        changed = true;
        if (!parsed.tagline || parsed.tagline.includes('أحدث حلول بطاقات وستاندات NFC')) {
          parsed.tagline = DEFAULT_STORE_SETTINGS.tagline;
          changed = true;
        }
        if (!parsed.logo || parsed.logo.includes('unsplash.com')) {
          parsed.logo = DEFAULT_STORE_SETTINGS.logo;
          changed = true;
        }
        if (!parsed.phoneNumber || parsed.phoneNumber === '01012345678') {
          parsed.phoneNumber = '01023748782';
          changed = true;
        }
        if (changed) {
          localStorage.setItem('my_store_settings', JSON.stringify(parsed));
        }
        return parsed;
      }
      return DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('my_store_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved was the old apparel demo data, refresh to the dedicated Tapson NFC/QR products
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.name?.includes('حذاء كاجوال')) {
          localStorage.setItem('my_store_products', JSON.stringify(DEFAULT_PRODUCTS));
          return DEFAULT_PRODUCTS;
        }
        return parsed;
      }
      return DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('my_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('my_store_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  });

  // UI state
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'discount'>('featured');

  // Admin Auth Protection State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('is_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Check secret URL param ?admin=true or #admin
  useEffect(() => {
    if (window.location.search.includes('admin') || window.location.hash.includes('admin')) {
      if (!isAdminAuthenticated) {
        setIsAdminAuthModalOpen(true);
      } else {
        setCurrentView('admin');
      }
    }
  }, [isAdminAuthenticated]);

  const handleViewChange = (view: 'store' | 'admin') => {
    if (view === 'admin') {
      if (isAdminAuthenticated) {
        setCurrentView('admin');
      } else {
        setIsAdminAuthModalOpen(true);
      }
    } else {
      setCurrentView('store');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('is_admin_logged_in');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('store');
  };

  // Dark Mode State with localStorage persistence & system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('my_store_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('my_store_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('my_store_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('my_store_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('my_store_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('my_store_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('my_store_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Cart operations
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalMoney = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) => {
        const itemExists = prev.some((item) => item.product.id === productId);
        if (!itemExists) {
          const product = products.find((p) => p.id === productId);
          if (product) {
            return [...prev, { product, quantity }];
          }
          return prev;
        }
        return prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
      });
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderCompleted = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleResetDefaults = () => {
    setProducts(DEFAULT_PRODUCTS);
    setSettings(DEFAULT_STORE_SETTINGS);
    setOrders(DEFAULT_ORDERS);
    setCart([]);
  };

  // Filter & Sort Products
  const isEn = language === 'en';
  const isAllCategory = selectedCategory === 'الكل' || selectedCategory === 'All';

  const filteredProducts = products.filter((p) => {
    const matchesCategory = isAllCategory || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'discount') {
      const aDisc = a.originalPrice ? a.originalPrice - a.price : 0;
      const bDisc = b.originalPrice ? b.originalPrice - b.price : 0;
      return bDisc - aDisc;
    }
    // featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Extract unique categories from current products list
  const availableCategories = ['الكل', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-cairo text-slate-800 dark:text-slate-100 transition-colors duration-200" 
      dir={isEn ? 'ltr' : 'rtl'}
    >
      
      {/* Sticky Header */}
      <Header
        settings={settings}
        cartCount={cartTotalCount}
        cartTotal={cartTotalMoney}
        currentView={currentView}
        onViewChange={handleViewChange}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        currentLang={language}
        onToggleLanguage={toggleLanguage}
      />

      {/* Main View Router */}
      {currentView === 'admin' ? (
        <main className="flex-1">
          <AdminDashboard
            products={products}
            settings={settings}
            orders={orders}
            onSaveProducts={setProducts}
            onSaveSettings={setSettings}
            onBackToStore={() => setCurrentView('store')}
            onResetDefaults={handleResetDefaults}
            onLogout={handleAdminLogout}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-32 space-y-6">
          
          {/* Store Welcome Banner with Logo and Owner Name */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 dark:from-emerald-950 dark:via-teal-950 dark:to-slate-950 text-white shadow-xl p-6 sm:p-8 border border-emerald-700/30 dark:border-emerald-600/30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative shrink-0">
                  <img
                    src={settings.logo}
                    alt={settings.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80';
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-white dark:border-slate-900 shadow">
                    {isEn ? '100% Original' : 'أصلي 100%'}
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      {t.storeVerified}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {t.supervisedBy}: <strong className="text-white font-black">{settings.ownerName}</strong>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2 leading-tight">
                    {isEn ? `Welcome to ${settings.name}` : `أهلاً بك في ${settings.name}`}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                    {settings.tagline}
                  </p>
                </div>
              </div>

              {/* Quick Trust badges */}
              <div className={`hidden lg:flex flex-col gap-2 shrink-0 ${isEn ? 'border-l border-white/10 pl-6' : 'border-r border-white/10 pr-6'}`}>
                <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>{t.delivery}: {settings.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.cashOnDelivery}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{t.customerService247}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Product Video Explainer Showcase (placed at the top of the storefront right below hero banner) */}
          <ProductVideoExplainer settings={settings} lang={language} />

          {/* Categories Selector & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {availableCategories.map((cat) => {
                const count = cat === 'الكل' 
                  ? products.length 
                  : products.filter((p) => p.category === cat).length;
                const isSelected = (cat === 'الكل' && isAllCategory) || selectedCategory === cat;
                const label = cat === 'الكل' ? (isEn ? 'All' : 'الكل') : cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sorting Dropdown */}
            <div className={`flex items-center gap-2 shrink-0 justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2 sm:pt-0`}>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.sortBy}</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="featured">{t.sortFeatured}</option>
                <option value="price_asc">{t.sortPriceAsc}</option>
                <option value="price_desc">{t.sortPriceDesc}</option>
                <option value="discount">{t.sortDiscount}</option>
              </select>
            </div>

          </div>

          {/* Products Grid Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {isAllCategory ? t.allProducts : `${isEn ? 'Category' : 'منتجات قسم'}: ${selectedCategory}`}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {isEn 
                    ? 'Select your quantity for each product and view the cart below to send WhatsApp invoice.' 
                    : 'حدد العدد المطلوب من أي منتج واضغط على السلة بالأسفل لإرسال الفاتورة عبر واتساب.'}
                </p>
              </div>

              <span className="text-xs font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-300/40 dark:border-slate-700">
                {sortedProducts.length} {isEn ? 'items' : 'منتج'}
              </span>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 shadow-xs">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">
                  {isEn ? 'No products match your search' : 'لا توجد منتجات مطابقة للبحث'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {isEn 
                    ? 'Try different keywords or select another category from the bar above.' 
                    : 'جرب تغيير كلمات البحث أو اختر قسماً آخر من شريط الأقسام بالأعلى.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('الكل');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  {isEn ? 'Show All Products' : 'عرض جميع المنتجات'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {sortedProducts.map((product) => {
                  const cartItem = cart.find((i) => i.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantityInCart={qty}
                      settings={settings}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onUpdateQuantity={handleUpdateCartQuantity}
                      onViewDetails={setSelectedProductDetails}
                      lang={language}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Idea section requested by user: نقدر نعملك أي فكرة حابب تعملها تواصل واتس اب للتنفيذ */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 dark:from-emerald-950 dark:via-teal-950 dark:to-slate-950 text-white p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isEn ? 'Custom Design & Implementation' : 'تنفيذ أي فكرة خاصة'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {isEn 
                    ? 'Have a custom idea? We can make it happen!' 
                    : 'عندك فكرة خاصة أو حابب تعمل تصميم مخصص؟ نقدر نعملك أي فكرة حابب تعملها!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {isEn
                    ? 'Customized NFC smart business cards, Google Review stands, restaurant digital menus, or personalized branded shapes. Contact us on WhatsApp to bring your idea to life.'
                    : 'كروت أعمال ذكية بشعارك وبياناتك، ستاندات تقييمات جوجل لمطعمك أو عيادتك، منيو رقمي، أو أي فكرة مبتكرة بتقنية NFC و QR. تواصل معنا على الواتساب للتنفيذ المباشر.'}
                </p>
              </div>

              <a
                href="https://wa.me/message/NLV2EU2CTTDGN1"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 active:scale-95 flex items-center gap-2.5 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-slate-950 stroke-none" />
                <span>{isEn ? 'Contact WhatsApp for Custom Idea' : 'تواصل واتساب للتنفيذ 🚀'}</span>
              </a>
            </div>
          </div>

          {/* Store Footer with Social Media & Owner Login */}
          <footer className="pt-10 pb-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
            
            {/* Social Media Links Bar requested by user */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* TikTok */}
              <a
                href={settings.tiktokUrl || 'https://www.tiktok.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs shadow-sm hover:scale-105 transition duration-200"
                title={t.visitTiktok}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
                <span>{t.tiktok}</span>
              </a>

              {/* Facebook */}
              <a
                href={settings.facebookUrl || 'https://www.facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm hover:scale-105 transition duration-200"
                title={t.visitFacebook}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>{t.facebook}</span>
              </a>

              {/* Instagram */}
              <a
                href={settings.instagramUrl || 'https://www.instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold text-xs shadow-sm hover:scale-105 transition duration-200"
                title={t.visitInstagram}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>{t.instagram}</span>
              </a>
            </div>

            <p className="font-medium">
              {isEn 
                ? `All rights reserved for ${settings.name} © ${new Date().getFullYear()} • Managed by ${settings.ownerName}` 
                : `جميع الحقوق محفوظة لـ ${settings.name} © ${new Date().getFullYear()} • بإدارة ${settings.ownerName}`}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setCurrentView('admin');
                  } else {
                    setIsAdminAuthModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="بوابة دخول الإدارة للمالك فقط"
              >
                <Lock className="w-3 h-3" />
                <span>
                  {isEn 
                    ? (isAdminAuthenticated ? 'Admin Panel (Logged in 🟢)' : 'Admin Login (Owner)') 
                    : (isAdminAuthenticated ? 'لوحة التحكم (مسجل 🟢)' : 'دخول الإدارة (للمالك)')}
                </span>
              </button>
            </div>
          </footer>

        </main>
      )}

      {/* Floating Bottom Contact Bar (TikTok, Facebook, Instagram, WhatsApp, Phone & Cart) */}
      <FloatingContactBar
        settings={settings}
        cartCount={cartTotalCount}
        cartTotal={cartTotalMoney}
        onOpenCart={() => setIsCartOpen(true)}
        lang={language}
      />

      {/* Cart & WhatsApp Invoice Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        settings={settings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Product Details Zoom Modal */}
      <ProductDetailsModal
        product={selectedProductDetails}
        settings={settings}
        quantityInCart={
          selectedProductDetails
            ? cart.find((i) => i.product.id === selectedProductDetails.id)?.quantity || 0
            : 0
        }
        onClose={() => setSelectedProductDetails(null)}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateCartQuantity}
      />

      {/* Admin PIN Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        correctPin={settings.adminPin || '1234'}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          try {
            sessionStorage.setItem('is_admin_logged_in', 'true');
          } catch (e) {
            console.error(e);
          }
          setIsAdminAuthModalOpen(false);
          setCurrentView('admin');
        }}
      />

    </div>
  );
}
