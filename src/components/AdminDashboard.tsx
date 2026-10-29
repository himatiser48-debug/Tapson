import React, { useState, useRef } from 'react';
import { 
  Package, 
  Settings, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Upload, 
  RefreshCw, 
  Download, 
  Check, 
  Store, 
  Eye, 
  Phone, 
  MessageCircle, 
  FileText, 
  Search, 
  Tag, 
  Copy, 
  AlertTriangle,
  BarChart3,
  Lock
} from 'lucide-react';
import { Product, StoreSettings, OrderRecord } from '../types';
import { formatCurrency, sanitizeWhatsAppNumber } from '../utils/whatsapp';
import { CATEGORIES } from '../data/initialData';
import { AdminAnalytics } from './AdminAnalytics';

interface AdminDashboardProps {
  products: Product[];
  settings: StoreSettings;
  orders: OrderRecord[];
  onSaveProducts: (products: Product[]) => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onBackToStore: () => void;
  onResetDefaults: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  settings,
  orders,
  onSaveProducts,
  onSaveSettings,
  onBackToStore,
  onResetDefaults,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'analytics' | 'settings' | 'orders' | 'backup'>('products');
  
  // Local editable settings
  const [localSettings, setLocalSettings] = useState<StoreSettings>({ ...settings });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Product editing modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 100,
    originalPrice: undefined,
    image: '',
    category: 'أخرى',
    inStock: true,
    badge: '',
  });

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // File input refs for uploading images directly
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Quick Inline Price change
  const handleInlinePriceChange = (productId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    const updated = products.map((p) => (p.id === productId ? { ...p, price: newPrice } : p));
    onSaveProducts(updated);
  };

  // Handle Stock Toggle
  const handleToggleStock = (productId: string) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p));
    onSaveProducts(updated);
  };

  // Open modal for creating or editing product
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: 150,
        originalPrice: undefined,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        category: 'أحذية',
        inStock: true,
        badge: '',
      });
    }
    setIsProductModalOpen(true);
  };

  // Save product (Add or Edit)
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name?.trim() || !productForm.price) {
      alert('يرجى كتابة اسم المنتج وسعر صحيح');
      return;
    }

    if (editingProduct) {
      // Edit existing
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? ({ ...p, ...productForm } as Product)
          : p
      );
      onSaveProducts(updated);
    } else {
      // Add new
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: productForm.name!.trim(),
        description: productForm.description || '',
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        image: productForm.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        category: productForm.category || 'عام',
        inStock: productForm.inStock ?? true,
        badge: productForm.badge || '',
        createdAt: new Date().toISOString(),
      };
      onSaveProducts([newProd, ...products]);
    }

    setIsProductModalOpen(false);
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من المتجر؟')) {
      const updated = products.filter((p) => p.id !== productId);
      onSaveProducts(updated);
    }
  };

  // Duplicate product
  const handleDuplicateProduct = (product: Product) => {
    const copy: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      name: `${product.name} (نسخة)`,
      createdAt: new Date().toISOString(),
    };
    onSaveProducts([copy, ...products]);
  };

  // Handle Image File Upload for Product
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProductForm((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Logo Upload for Store
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLocalSettings((prev) => ({ ...prev, logo: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Store Settings
  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      settings: localSettings,
      products,
      orders,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `store_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.products && Array.isArray(parsed.products)) {
          onSaveProducts(parsed.products);
        }
        if (parsed.settings) {
          onSaveSettings(parsed.settings);
          setLocalSettings(parsed.settings);
        }
        alert('تم استيراد بيانات المتجر والمنتجات بنجاح!');
      } catch (err) {
        alert('حدث خطأ في قراءة ملف النسخة الاحتياطية. يرجى التأكد من صحة الملف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6" dir="rtl">
      
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black">لوحة التحكم والتعديل</h2>
              <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                إدارة المتجر
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              تحكم كامل في المنتجات، تعديل الأسعار، تغيير اسم المتجر واللوجو، ومراجعة الطلبات.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onBackToStore}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm transition shadow-md"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة صفحة المتجر</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl font-bold text-xs sm:text-sm transition shadow-sm"
              title="تسجيل الخروج وقفل لوحة التحكم"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>قفل وخروج</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl transition shrink-0 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>المنتجات والأسعار ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl transition shrink-0 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>الإحصائيات والرسوم البيانية</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl transition shrink-0 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>هوية المتجر والأرقام</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl transition shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل الطلبات الواردة ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl transition shrink-0 cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>النسخ والاستعادة</span>
        </button>
      </div>

      {/* ===================== TAB 1: PRODUCTS & PRICES ===================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search, Category, and Add Button */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
            
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو القسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Add New Product Trigger */}
            <button
              onClick={() => handleOpenProductModal()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          {/* Quick Notice for Merchant */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between transition-colors">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>تعديل الأسعار السريع:</strong> يمكنك تعديل أي سعر مباشرة في الجدول بالأسفل وسيتم الحفظ الفوري!
              </span>
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">
              المعروض: {filteredProducts.length} من أصل {products.length}
            </span>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">الصورة</th>
                    <th className="py-3 px-4">اسم المنتج والقسم</th>
                    <th className="py-3 px-4 text-center">السعر الحالي ({settings.currency})</th>
                    <th className="py-3 px-4 text-center">السعر القديم</th>
                    <th className="py-3 px-4 text-center">الحالة</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        لا توجد منتجات مطابقة لخيارات البحث
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Image */}
                        <td className="py-3 px-4">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80';
                            }}
                          />
                        </td>

                        {/* Title & Category */}
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-900 dark:text-slate-100">{prod.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                              {prod.category}
                            </span>
                            {prod.badge && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                                {prod.badge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price Inline Input */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-700 transition">
                            <input
                              type="number"
                              min="0"
                              value={prod.price}
                              onChange={(e) => handleInlinePriceChange(prod.id, parseFloat(e.target.value))}
                              className="w-20 text-center font-black text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
                              title="اضغط لتعديل السعر مباشرة"
                            />
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">{settings.currency}</span>
                          </div>
                        </td>

                        {/* Old Price */}
                        <td className="py-3 px-4 text-center text-slate-400 dark:text-slate-500 font-mono">
                          {prod.originalPrice ? `${prod.originalPrice} ${settings.currency}` : '-'}
                        </td>

                        {/* Stock status toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStock(prod.id)}
                            className={`px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer ${
                              prod.inStock
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                                : 'bg-red-100 dark:bg-rose-950/80 text-red-800 dark:text-rose-300 hover:bg-red-200 dark:hover:bg-rose-900'
                            }`}
                          >
                            {prod.inStock ? 'متوفر 🟢' : 'نفد 🔴'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenProductModal(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
                              title="تعديل تفاصيل المنتج"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition cursor-pointer"
                              title="تكرار / نسخ المنتج"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 transition cursor-pointer"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ===================== TAB: ANALYTICS & CHARTS ===================== */}
      {activeTab === 'analytics' && (
        <AdminAnalytics
          orders={orders}
          products={products}
          settings={settings}
        />
      )}

      {/* ===================== TAB 2: STORE SETTINGS & CONTACTS ===================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveStoreSettings} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 transition-colors">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">هوية المتجر وبيانات التواصل</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              عدّل اسمك، لوجو المتجر، وأرقام الواتساب والاتصال التي تظهر للزبائن وترسل الفواتير إليها.
            </p>
          </div>

          {settingsSavedMessage && (
            <div className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl text-xs font-black flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>تم حفظ بيانات وهوية المتجر بنجاح!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Store Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                اسم المتجر الرسمي
              </label>
              <input
                type="text"
                value={localSettings.name}
                onChange={(e) => setLocalSettings({ ...localSettings, name: e.target.value })}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-750 transition"
              />
            </div>

            {/* Owner Name ("اسمي") */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                اسمك (صاحب المتجر - يظهر في الترويسة والفاتورة)
              </label>
              <input
                type="text"
                value={localSettings.ownerName}
                onChange={(e) => setLocalSettings({ ...localSettings, ownerName: e.target.value })}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-750 transition"
              />
            </div>

            {/* Logo Settings */}
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-2">
                لوجو المتجر (صورة الشعار)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative">
                  <img
                    src={localSettings.logo}
                    alt="معاينة اللوجو"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md bg-white dark:bg-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/aistudio/IMG_6271_1755271c.jpeg';
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full text-[10px]">
                    <Check className="w-3 h-3" />
                  </span>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    placeholder="رابط صورة اللوجو (URL)"
                    value={localSettings.logo}
                    onChange={(e) => setLocalSettings({ ...localSettings, logo: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع لوجو من جهازك مباشرة</span>
                    </button>
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">أو ضع رابط مباشر لأي صورة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Link or Number */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80">
              <label className="block text-xs font-black text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>رابط أو رقم الواتساب (لاستقبال الفواتير والطلبات ومحادثة العملاء)</span>
              </label>
              <input
                type="text"
                placeholder="مثال: https://wa.me/message/NLV2EU2CTTDGN1 أو رقم 201012345678"
                value={localSettings.whatsappNumber}
                onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                required
                className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl py-2 px-3 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                يمكنك وضع رابط الواتساب المباشر مثل <strong>https://wa.me/message/NLV2EU2CTTDGN1</strong> أو رقم هاتف بكود الدولة. سيتم فتح هذا الحساب وإرسال الفاتورة والطلبات عليه مباشرة.
              </p>
            </div>

            {/* Direct Phone Number */}
            <div className="bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/80">
              <label className="block text-xs font-black text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>رقم الاتصال الهاتفي المباشر</span>
              </label>
              <input
                type="text"
                placeholder="مثال: 01012345678 أو +201012345678"
                value={localSettings.phoneNumber}
                onChange={(e) => setLocalSettings({ ...localSettings, phoneNumber: e.target.value })}
                required
                className="w-full bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-xl py-2 px-3 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                الرقم الذي سيتصل به العميل عند النقر على أيقونة الاتصال بالأسفل.
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                عملة المتجر
              </label>
              <input
                type="text"
                value={localSettings.currency}
                onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
                placeholder="مثال: ج.م أو ر.س أو $"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-700"
              />
            </div>

            {/* Shipping Fee */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                تكلفة الشحن والتوصيل ({localSettings.currency})
              </label>
              <input
                type="number"
                min="0"
                value={localSettings.shippingFee}
                onChange={(e) => setLocalSettings({ ...localSettings, shippingFee: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-700"
              />
            </div>

            {/* Free Shipping Threshold */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                حد الشحن المجاني (شحن مجاني للطلبات الأكبر من:)
              </label>
              <input
                type="number"
                min="0"
                value={localSettings.freeShippingThreshold}
                onChange={(e) => setLocalSettings({ ...localSettings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-700"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-500">اكتب 0 لإلغاء حد الشحن المجاني</span>
            </div>

            {/* Announcement text */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                نص الشريط الإعلاني العلوي
              </label>
              <input
                type="text"
                value={localSettings.announcementText}
                onChange={(e) => setLocalSettings({ ...localSettings, announcementText: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-700"
              />
            </div>

            {/* Tagline / Bio */}
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
                نبذة عن المتجر (تظهر للمستخدمين)
              </label>
              <textarea
                rows={2}
                value={localSettings.tagline}
                onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-700"
              />
            </div>

            {/* Video Explainer Section */}
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    🎬
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">فيديو شرح المنتجات (في أول المتجر)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      عرض فيديو توضيحي حي للمنتجات والخامات في أعلى الصفحة لزيادة ثقة العملاء والطلبات
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={localSettings.showExplainerVideo ?? true}
                    onChange={(e) => setLocalSettings({ ...localSettings, showExplainerVideo: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">تفعيل الفيديو</span>
                </label>
              </div>

              {localSettings.showExplainerVideo !== false && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      رابط الفيديو (URL) - يدعم يوتيوب أو رابط فيديو مباشر
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: https://www.youtube.com/watch?v=... أو رابط مباشر"
                      value={localSettings.videoUrl || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, videoUrl: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      عنوان قسم الفيديو
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: شاهد فيديو شرح وتجربة المنتجات على الطبيعة"
                      value={localSettings.videoTitle || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, videoTitle: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      وصف وتفاصيل الفيديو
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: استعراض لجودة الخامات والتفاصيل وطريقة الاستلام"
                      value={localSettings.videoDescription || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, videoDescription: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Accounts (TikTok, Facebook, Instagram) */}
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold">
                  📱
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">حسابات التواصل الاجتماعي (تيك توك، فيسبوك، إنستقرام)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ضع روابط صفحاتك وحساباتك لتظهر في الأيقونات الثابتة بأسفل المتجر وفي التذييل
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* TikTok Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                    <span>رابط حساب تيك توك (TikTok)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.tiktok.com/@youraccount"
                    value={localSettings.tiktokUrl || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, tiktokUrl: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    يفتح صفحتك على تيك توك بضغطة زر
                  </span>
                </div>

                {/* Facebook Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]"></span>
                    <span>رابط صفحة فيسبوك (Facebook)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.facebook.com/yourpage"
                    value={localSettings.facebookUrl || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, facebookUrl: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    يفتح صفحتك على فيسبوك
                  </span>
                </div>

                {/* Instagram Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500"></span>
                    <span>رابط حساب إنستقرام (Instagram)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/youraccount"
                    value={localSettings.instagramUrl || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    يفتح صفحتك على إنستقرام
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Access Protection Section */}
            <div className="md:col-span-2 bg-slate-900 dark:bg-slate-850 text-white p-5 rounded-3xl border border-slate-700 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">حماية لوحة الإدارة وخصوصية المالك</h4>
                  <p className="text-xs text-slate-400">
                    منع العملاء والزوار من التعديل في الأسعار أو الاطلاع على الفواتير
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                {/* Admin PIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    الرمز السري للإدارة (PIN)
                  </label>
                  <input
                    type="text"
                    value={localSettings.adminPin || '1234'}
                    onChange={(e) => setLocalSettings({ ...localSettings, adminPin: e.target.value })}
                    placeholder="مثال: 1234 أو رمز خاص بك"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm font-mono font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    هذا الرمز مطلوب دائماً للدخول إلى لوحة التحكم (الافتراضي هو 1234).
                  </span>
                </div>

                {/* Hide Button Toggle */}
                <div className="flex flex-col justify-center">
                  <label className="flex items-start gap-2.5 cursor-pointer bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 hover:border-slate-600 transition">
                    <input
                      type="checkbox"
                      checked={localSettings.hideAdminButtonFromPublic ?? false}
                      onChange={(e) => setLocalSettings({ ...localSettings, hideAdminButtonFromPublic: e.target.checked })}
                      className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-xs text-white block">إخفاء زر الإدارة تماماً عن واجهة المتجر للزوار</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                        عند تفعيل هذا الخيار، لن يرى أي زائر زر "الإدارة". ويمكنك أنت كمالك الدخول بالنقر 3 مرات على اللوجو أو عبر قفل صغير في أسفل الصفحة.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ جميع التعديلات</span>
            </button>
          </div>
        </form>
      )}

      {/* ===================== TAB 3: ORDERS LOG ===================== */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">سجل الطلبات الواردة</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                قائمة بالطلبات والفواتير التي أنشأها العملاء وأرسلوها عبر الواتساب.
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
              إجمالي الطلبات: {orders.length}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold">لا توجد طلبات واردة بعد</p>
              <p className="text-xs">عندما يقوم أي عميل بطلب منتج من السلة، ستظهر فاتورته هنا تلقائياً.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3">رقم الطلب</th>
                    <th className="py-2.5 px-3">العميل</th>
                    <th className="py-2.5 px-3">الهاتف</th>
                    <th className="py-2.5 px-3">المدينة / العنوان</th>
                    <th className="py-2.5 px-3">المنتجات</th>
                    <th className="py-2.5 px-3 text-left">الإجمالي</th>
                    <th className="py-2.5 px-3 text-center">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {ord.customer.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        <a href={`tel:${ord.customer.phone}`} className="hover:text-emerald-700 dark:hover:text-emerald-400 underline">
                          {ord.customer.phone}
                        </a>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                        {ord.customer.city} - {ord.customer.address}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <span className="font-bold">{ord.items.length} أصناف</span>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] block truncate max-w-[150px]">
                          {ord.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-left font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatCurrency(ord.total, ord.currency)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                        {ord.date} {ord.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 4: BACKUP & RESTORE ===================== */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 transition-colors">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">النسخ الاحتياطي وإدارة البيانات</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              احفظ نسخة من منتجاتك وأسعارك وبيانات متجرك لاستعادتها في أي وقت أو نقلها لجهاز آخر.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">تصدير نسخة احتياطية (JSON)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  تنزيل ملف يحتوي على كل المنتجات والأسعار والإعدادات الحالية.
                </p>
              </div>
              <button
                onClick={handleExportBackup}
                className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                تنزيل النسخة الاحتياطية
              </button>
            </div>

            {/* Import */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">استيراد نسخة سابقة</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  رفع ملف JSON تم تصديره سابقاً لاسترجاع كافة المنتجات فوراً.
                </p>
              </div>
              <button
                onClick={() => backupFileInputRef.current?.click()}
                className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                اختيار ملف النسخة الاحتياطية
              </button>
              <input
                type="file"
                ref={backupFileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
            </div>

            {/* Reset */}
            <div className="bg-rose-50/60 dark:bg-rose-950/40 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 flex items-center justify-center mb-3">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">استعادة المنتجات الافتراضية</h4>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                  إعادة تعيين المنتجات إلى القائمة التجريبية الأولى.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من استعادة المنتجات الافتراضية؟')) {
                    onResetDefaults();
                  }
                }}
                className="mt-4 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                استعادة الافتراضيات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ADD / EDIT PRODUCT MODAL ===================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-fadeIn">
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block font-black text-slate-700 dark:text-slate-200 mb-1">
                  اسم المنتج <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: حذاء كاجوال خفيف"
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 dark:text-slate-200 mb-1">
                    القسم / الصنف
                  </label>
                  <select
                    value={productForm.category || 'عام'}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c !== 'الكل').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-700 dark:text-slate-200 mb-1">
                    شارة ترويجية (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: الأكثر طلباً، عرض خاص"
                    value={productForm.badge || ''}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 dark:text-slate-200 mb-1">
                    السعر الحالي ({settings.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="السعر"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 dark:text-slate-200 mb-1">
                    السعر قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="مثال: 500"
                    value={productForm.originalPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: parseFloat(e.target.value) || undefined })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Image Input (URL or Upload) */}
              <div className="space-y-2">
                <label className="block font-black text-slate-700 dark:text-slate-200">
                  صورة المنتج
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={productForm.image || 'https://via.placeholder.com/150'}
                    alt="معاينة"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      placeholder="رابط الصورة (URL)"
                      value={productForm.image || ''}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => productFileInputRef.current?.click()}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>أو رفع صورة من الجهاز</span>
                    </button>
                    <input
                      type="file"
                      ref={productFileInputRef}
                      onChange={handleProductImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-black text-slate-700 dark:text-slate-200 mb-1">
                  وصف المنتج ومميزاته
                </label>
                <textarea
                  rows={3}
                  placeholder="مواصفات، خامات، مميزات..."
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Stock toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={productForm.inStock ?? true}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="inStockCheck" className="font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                  المنتج متوفر في المخزن وجاهز للطلب الفوري
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
