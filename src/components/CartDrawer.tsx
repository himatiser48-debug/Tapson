import React, { useState, useRef } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Send, 
  FileText, 
  Truck, 
  ShieldCheck, 
  Phone, 
  User, 
  MapPin, 
  CreditCard,
  Printer,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerInfo, OrderRecord, StoreSettings } from '../types';
import { 
  formatCurrency, 
  generateOrderNumber, 
  generateWhatsAppInvoiceMessage, 
  buildWhatsAppLink 
} from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  settings: StoreSettings;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCompleted: (order: OrderRecord) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'invoice'>('cart');
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    alternatePhone: '',
    city: settings.cityList?.[0] || 'القاهرة',
    address: '',
    notes: '',
    paymentMethod: 'cash_on_delivery',
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [showValidationBanner, setShowValidationBanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Form field refs for smooth scrolling and auto-focus
  const customerFormRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  // Totals calculations
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Shipping calculation
  const isFreeShipping = settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold;
  const shippingFee = subtotal === 0 ? 0 : isFreeShipping ? 0 : settings.shippingFee;
  const discount = 0; // standard base
  const grandTotal = subtotal + shippingFee - discount;

  const freeShippingDifference = settings.freeShippingThreshold - subtotal;

  const validateForm = () => {
    const errors: { name?: string; phone?: string; address?: string } = {};
    if (!customer.name.trim()) {
      errors.name = 'يرجى كتابة اسم العميل بالكامل لتسجيله بالفاتورة';
    }
    if (!customer.phone.trim()) {
      errors.phone = 'يرجى كتابة رقم الهاتف للتواصل وتأكيد الطلب';
    } else if (customer.phone.replace(/[^0-9]/g, '').length < 8) {
      errors.phone = 'يرجى إدخال رقم هاتف صحيح';
    }
    if (!customer.address.trim()) {
      errors.address = 'يرجى كتابة عنوان التوصيل بالتفصيل';
    }
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setShowValidationBanner(!isValid);
    return isValid;
  };

  const handleOrderViaWhatsApp = () => {
    if (items.length === 0) return;

    if (!validateForm()) {
      setActiveTab('cart');
      setTimeout(() => {
        customerFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!customer.name.trim()) {
          nameInputRef.current?.focus();
        } else if (!customer.phone.trim()) {
          phoneInputRef.current?.focus();
        } else if (!customer.address.trim()) {
          addressInputRef.current?.focus();
        }
      }, 50);
      return;
    }

    setIsSubmitting(true);

    const orderNumber = generateOrderNumber();
    const currentDate = new Date().toLocaleDateString('ar-EG');
    const currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newOrder: OrderRecord = {
      id: orderNumber,
      orderNumber,
      date: currentDate,
      time: currentTime,
      customer: { ...customer },
      items: items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
        image: item.product.image,
      })),
      subtotal,
      shippingFee,
      discount,
      total: grandTotal,
      currency: settings.currency,
      status: 'new',
    };

    // Trigger joyful celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    // Build the formatted WhatsApp invoice message
    const message = generateWhatsAppInvoiceMessage(
      settings,
      customer,
      items,
      subtotal,
      shippingFee,
      discount,
      grandTotal,
      orderNumber
    );

    // Auto-copy invoice text to clipboard for convenience
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(message);
      }
    } catch {
      // safe fallback
    }

    // Save order in history
    onOrderCompleted(newOrder);
    setCompletedOrder(newOrder);

    // Open WhatsApp chat directly with invoice placed in the text box ready to send
    const waUrl = buildWhatsAppLink(settings.whatsappNumber || 'https://wa.me/message/NLV2EU2CTTDGN1', message);
    window.open(waUrl, '_blank');

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl overflow-hidden animate-slideInRight border-l border-slate-200 dark:border-slate-800 transition-colors"
        dir="rtl"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/90 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                سلة المشتريات والفاتورة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {items.length === 0 ? 'لا توجد منتجات' : `${totalCount} قطعة مختارة`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Cart & Details vs Invoice Preview) */}
        {items.length > 0 && !completedOrder && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/80 p-1.5 gap-1.5 transition-colors">
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'cart'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-slate-200 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>محتويات السلة والبيانات ({totalCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'invoice'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs border border-slate-200 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>معاينة الفاتورة 🧾</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {completedOrder ? (
            /* Order Completed Success View */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  تم إرسال الطلب بنجاح!
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
                  شكراً لتسوقك من {settings.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  تم فتح محادثة الواتساب لإرسال الفاتورة وبيانات الاستلام لصاحب المتجر مباشرة.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-right space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between font-bold border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span>رقم الفاتورة:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>اسم المستلم:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{completedOrder.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>رقم الهاتف:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">{completedOrder.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>العنوان:</span>
                  <span>{completedOrder.customer.city} - {completedOrder.customer.address}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-emerald-700 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>المبلغ المطلوب:</span>
                  <span>{formatCurrency(completedOrder.total, settings.currency)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={buildWhatsAppLink(
                    settings.whatsappNumber || 'https://wa.me/message/NLV2EU2CTTDGN1',
                    generateWhatsAppInvoiceMessage(
                      settings,
                      completedOrder.customer,
                      items,
                      completedOrder.subtotal,
                      completedOrder.shippingFee,
                      completedOrder.discount,
                      completedOrder.total,
                      completedOrder.orderNumber
                    )
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    try {
                      const invoiceText = generateWhatsAppInvoiceMessage(
                        settings,
                        completedOrder.customer,
                        items,
                        completedOrder.subtotal,
                        completedOrder.shippingFee,
                        completedOrder.discount,
                        completedOrder.total,
                        completedOrder.orderNumber
                      );
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(invoiceText);
                      }
                    } catch {
                      // ignore
                    }
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الفاتورة عبر واتساب (مكتوبة وجاهزة للإرسال) 🚀</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const invoiceText = generateWhatsAppInvoiceMessage(
                      settings,
                      completedOrder.customer,
                      items,
                      completedOrder.subtotal,
                      completedOrder.shippingFee,
                      completedOrder.discount,
                      completedOrder.total,
                      completedOrder.orderNumber
                    );
                    navigator.clipboard.writeText(invoiceText);
                    setCopiedInvoice(true);
                    setTimeout(() => setCopiedInvoice(false), 2500);
                  }}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {copiedInvoice ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">تم نسخ نص الفاتورة بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>نسخ نص الفاتورة كاملاً</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center font-medium">
                  يتم إرسال الفاتورة لحساب الواتساب:
                  <div className="font-mono text-xs text-emerald-900 dark:text-emerald-200 dir-ltr font-bold mt-0.5">
                    https://wa.me/message/NLV2EU2CTTDGN1
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    onClearCart();
                    onClose();
                  }}
                  className="w-full py-2 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  العودة للمتجر والبدء بطلب جديد
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart View */
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">سلتك فارغة حالياً</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  تصفح المنتجات في المتجر وحدد الكمية التي تريدها وسنجهز لك الفاتورة فوراً.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-3 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : activeTab === 'invoice' ? (
            /* Formal Invoice Preview */
            <div id="invoice-printable" className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-xs transition-colors">
              
              {/* Store & Invoice Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={settings.logo || '/assets/aistudio/IMG_6271_1755271c.jpeg'}
                    alt={settings.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/aistudio/IMG_6271_1755271c.jpeg';
                    }}
                  />
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">{settings.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">بإدارة: {settings.ownerName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">هاتف: {settings.phoneNumber}</p>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    معاينة فاتورة
                  </span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {new Date().toLocaleDateString('ar-EG')}
                  </div>
                </div>
              </div>

              {/* Customer Info Box */}
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-100 dark:border-slate-750 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">بيانات العميل:</div>
                <div className="text-slate-600 dark:text-slate-300 flex justify-between">
                  <span>الاسم: <strong className="text-slate-900 dark:text-slate-100">{customer.name || '(لم يحدد بعد)'}</strong></span>
                  <span>الهاتف: <strong className="text-slate-900 dark:text-slate-100 font-mono">{customer.phone || '-'}</strong></span>
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  العنوان: <span className="text-slate-900 dark:text-slate-100">{customer.city} {customer.address ? `- ${customer.address}` : ''}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-600">
                      <th className="py-2 px-2">المنتج</th>
                      <th className="py-2 px-2 text-center">الكمية</th>
                      <th className="py-2 px-2 text-left">سعر القطعة</th>
                      <th className="py-2 px-2 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {items.map((item) => (
                      <tr key={item.product.id}>
                        <td className="py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">
                          {item.product.name}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-slate-900 dark:text-slate-100">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-2 text-left text-slate-600 dark:text-slate-400">
                          {formatCurrency(item.product.price, settings.currency)}
                        </td>
                        <td className="py-2 px-2 text-left font-black text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(item.product.price * item.quantity, settings.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Totals */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>مجموع المنتجات:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(subtotal, settings.currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>مصاريف الشحن:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {shippingFee === 0 ? 'مجاناً 🎁' : formatCurrency(shippingFee, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>المبلغ المطلوب تسليمه:</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(grandTotal, settings.currency)}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleOrderViaWhatsApp}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال هذه الفاتورة عبر واتساب (مكتوبة وجاهزة للإرسال) 🚀</span>
                </button>
                <div className="text-[10px] text-center text-slate-500 dark:text-slate-400">
                  يفتح محادثة الواتساب مع الفاتورة محملة في خانة الكتابة جاهزة للإرسال فوراً
                </div>
              </div>
            </div>
          ) : (
            /* Standard Cart & Customer Info Form */
            <>
              {/* Free shipping banner if configured */}
              {settings.freeShippingThreshold > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {isFreeShipping
                        ? '🎉 مبروك! حصلت على شحن مجاني لطلبك'
                        : `أضف بـ ${formatCurrency(freeShippingDifference, settings.currency)} إضافية واحصل على شحن مجاني!`}
                    </span>
                  </div>
                  {isFreeShipping && (
                    <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      مجاني
                    </span>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">المنتجات المطلوبة:</h3>
                  <button
                    onClick={onClearCart}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تفريغ السلة</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs overflow-hidden">
                  {items.map((item) => {
                    const itemTotal = item.product.price * item.quantity;
                    return (
                      <div key={item.product.id} className="p-3.5 flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80';
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            سعر القطعة: <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(item.product.price, settings.currency)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity buttons */}
                            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 border border-slate-200 dark:border-slate-600">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
                                title="تقليل العدد"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-black text-xs text-slate-900 dark:text-slate-100">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition cursor-pointer"
                                title="زيادة العدد"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Item Subtotal */}
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">الإجمالي:</span>
                              <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(itemTotal, settings.currency)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 transition cursor-pointer"
                          title="حذف الصنف"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Information Form */}
              <div 
                ref={customerFormRef}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 space-y-3.5 ${
                  showValidationBanner
                    ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 shadow-lg ring-2 ring-rose-200 dark:ring-rose-900/50'
                    : 'bg-emerald-50/40 dark:bg-slate-800/80 border-emerald-200/80 dark:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span>بيانات العميل (لتضمينها داخل الفاتورة الرسمية)</span>
                      <span className="text-rose-500 font-bold mr-1">*</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    إلزامية قبل الإرسال
                  </span>
                </div>

                {/* Explanation text for the user */}
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 flex items-start gap-2 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    اكتب اسمك، رقم هاتفك، وعنوانك بالأسفل ليتم كتابتها تلقائياً داخل الفاتورة التي ستُرسل إلى إدارة <strong>{settings.name}</strong> عبر الواتساب لتجهيز الطلب وشحنه.
                  </p>
                </div>

                {/* Validation Banner if user tried to order without filling details */}
                {showValidationBanner && (
                  <div className="p-3 bg-rose-100 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-700 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 font-bold animate-pulse">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>⚠️ يرجى استكمال بياناتك (الاسم، رقم الهاتف، وعنوان التوصيل) لتضمينهم في الفاتورة قبل الإرسال.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      اسم العميل بالكامل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      placeholder="مثال: أحمد محمود علي"
                      value={customer.name}
                      onChange={(e) => {
                        setCustomer({ ...customer, name: e.target.value });
                        if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                        if (showValidationBanner && e.target.value.trim() && customer.phone.trim() && customer.address.trim()) {
                          setShowValidationBanner(false);
                        }
                      }}
                      className={`w-full bg-white dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition ${
                        formErrors.name
                          ? 'border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-950 ring-1 ring-rose-300'
                          : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-950'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      رقم الهاتف (للاتصال والواتساب) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      placeholder="مثال: 01012345678"
                      value={customer.phone}
                      onChange={(e) => {
                        setCustomer({ ...customer, phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                        if (showValidationBanner && customer.name.trim() && e.target.value.trim() && customer.address.trim()) {
                          setShowValidationBanner(false);
                        }
                      }}
                      className={`w-full bg-white dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition ${
                        formErrors.phone
                          ? 'border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-950 ring-1 ring-rose-300'
                          : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-950'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      المحافظة / المدينة
                    </label>
                    <select
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition cursor-pointer"
                    >
                      {settings.cityList?.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Alternate Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      رقم هاتف بديل (اختياري)
                    </label>
                    <input
                      type="tel"
                      placeholder="رقم آخر للتأكيد"
                      value={customer.alternatePhone}
                      onChange={(e) => setCustomer({ ...customer, alternatePhone: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    العنوان بالتفصيل (الشارع، رقم العمارة، الشقة أو علامة مميزة) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    ref={addressInputRef}
                    rows={2}
                    placeholder="اكتب العنوان بالتفصيل لتسريع التوصيل ودقة الفاتورة..."
                    value={customer.address}
                    onChange={(e) => {
                      setCustomer({ ...customer, address: e.target.value });
                      if (formErrors.address) setFormErrors({ ...formErrors, address: undefined });
                      if (showValidationBanner && customer.name.trim() && customer.phone.trim() && e.target.value.trim()) {
                        setShowValidationBanner(false);
                      }
                    }}
                    className={`w-full bg-white dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition ${
                      formErrors.address
                        ? 'border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-950 ring-1 ring-rose-300'
                        : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-100 dark:focus:ring-emerald-950'
                    }`}
                  />
                  {formErrors.address && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    طريقة الدفع المفضلة
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, paymentMethod: 'cash_on_delivery' })}
                      className={`p-2 rounded-xl border text-right font-bold transition flex items-center gap-2 cursor-pointer ${
                        customer.paymentMethod === 'cash_on_delivery'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-800'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>الدفع عند الاستلام</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomer({ ...customer, paymentMethod: 'instapay' })}
                      className={`p-2 rounded-xl border text-right font-bold transition flex items-center gap-2 cursor-pointer ${
                        customer.paymentMethod === 'instapay'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-800'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>إنستاباي / محفظة</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    ملاحظات إضافية على الطلب (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: التوصيل بعد الساعة 4 عصراً، أو مقاس محدد..."
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer & Action Button */}
        {items.length > 0 && !completedOrder && (
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-xl space-y-3 transition-colors">
            {/* Bill summary row */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>المجموع الفرعي ({totalCount} قطعة):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(subtotal, settings.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>مصاريف الشحن:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {shippingFee === 0 ? 'مجاناً 🎁' : formatCurrency(shippingFee, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>السعر الإجمالي المطلوب:</span>
                <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(grandTotal, settings.currency)}</span>
              </div>
            </div>

            {/* "Order Now" action button */}
            <button
              onClick={handleOrderViaWhatsApp}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-98 border border-emerald-500/40 cursor-pointer"
            >
              <Send className="w-5 h-5 fill-white stroke-none" />
              <span>اطلب الآن (فتح الواتساب مع الفاتورة جاهزة للإرسال) 🚀</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>يتم فتح شات الواتساب وتكون الفاتورة مكتوبة جاهزة في خانة الرسائل للإرسال</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
