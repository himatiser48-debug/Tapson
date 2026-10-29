import { CartItem, CustomerInfo, OrderRecord, StoreSettings } from '../types';

/**
 * Clean phone number for WhatsApp wa.me link
 * Removes +, spaces, dashes, leading double zeroes
 */
export function sanitizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // If user entered local Egyptian format like 01012345678, convert to 201012345678
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '2' + cleaned;
  }
  
  return cleaned;
}

export function generateOrderNumber(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `ORD-${dateStr}-${random}`;
}

export function formatCurrency(amount: number, currency = 'ج.م'): string {
  return `${amount.toLocaleString('ar-EG')} ${currency}`;
}

export function generateWhatsAppInvoiceMessage(
  settings: StoreSettings,
  customer: CustomerInfo,
  items: CartItem[],
  subtotal: number,
  shippingFee: number,
  discount: number,
  total: number,
  orderNumber: string
): string {
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: '💵 الدفع عند الاستلام',
    vodafone_cash: '📱 محفظة إلكترونية (فودافون كاش / أورانج / اتصالات)',
    instapay: '⚡ إنستاباي (InstaPay)',
    bank_transfer: '🏦 تحويل بنكي',
  };

  let itemsText = '';
  items.forEach((item, index) => {
    const itemSubtotal = item.product.price * item.quantity;
    itemsText += `${index + 1}️⃣ *${item.product.name}*\n`;
    itemsText += `    ▫️ الكمية: *${item.quantity}* × ${item.product.price} ${settings.currency}\n`;
    itemsText += `    ▫️ الإجمالي الفرعي: *${itemSubtotal} ${settings.currency}*\n`;
    if (item.notes) {
      itemsText += `    ▫️ ملاحظة الصنف: ${item.notes}\n`;
    }
  });

  const shippingText = shippingFee === 0 
    ? '🎁 مجاني (عرض خاص)' 
    : `${shippingFee} ${settings.currency}`;

  const discountText = discount > 0 
    ? `\n🎟️ *الخصم:* -${discount} ${settings.currency}` 
    : '';

  const message = `🛍️ *فاتورة طلب جديد من: ${settings.name}*
🏷️ *رقم الطلب:* \`${orderNumber}\`
📅 *التاريخ:* ${currentDate} | ${currentTime}
👤 *إدارة المتجر:* ${settings.ownerName}
━━━━━━━━━━━━━━━━━━━━
👤 *بيانات العميل المستلم:*
• *الاسم:* ${customer.name}
• *رقم الهاتف:* ${customer.phone}
${customer.alternatePhone ? `• *رقم هاتف بديل:* ${customer.alternatePhone}\n` : ''}• *المحافظة / المدينة:* ${customer.city || 'غير محدد'}
• *العنوان بالتفصيل:* ${customer.address}
• *طريقة الدفع:* ${paymentLabels[customer.paymentMethod] || customer.paymentMethod}
${customer.notes ? `• *ملاحظات خاصة:* ${customer.notes}\n` : ''}━━━━━━━━━━━━━━━━━━━━
📦 *تفاصيل المنتجات والكميات:*
${itemsText}━━━━━━━━━━━━━━━━━━━━
🧾 *ملخص الحساب:*
• المجموع الفرعي للمنتجات: *${subtotal} ${settings.currency}*
• مصاريف الشحن والتوصيل: *${shippingText}*${discountText}
━━━━━━━━━━━━━━━━━━━━
💰 *المبلغ الإجمالي المستحق:* *${total} ${settings.currency}*
━━━━━━━━━━━━━━━━━━━━
✨ برجاء تأكيد الطلب لتجهيز الشحنة والتوصيل في أقرب وقت. شكراً لتسوقك من *${settings.name}*!`;

  return message;
}

export function buildWhatsAppLink(target: string | undefined, text?: string): string {
  const defaultShortlink = 'https://wa.me/message/NLV2EU2CTTDGN1';
  const defaultPhone = '201023748782'; // Verified phone number for NLV2EU2CTTDGN1
  let cleanTarget = (target || '').trim();

  if (!cleanTarget) {
    cleanTarget = defaultShortlink;
  }

  // Handle WhatsApp Business shortlink (e.g. https://wa.me/message/NLV2EU2CTTDGN1)
  if (cleanTarget.includes('wa.me/message/')) {
    if (!cleanTarget.startsWith('http://') && !cleanTarget.startsWith('https://')) {
      cleanTarget = 'https://' + cleanTarget;
    }
    // When text is provided, WhatsApp requires the phone number endpoint to place the message into the chat ready to send
    if (text) {
      return `https://api.whatsapp.com/send/?phone=${defaultPhone}&text=${encodeURIComponent(text)}`;
    }
    return cleanTarget.split('?')[0];
  }

  // Handle standard wa.me phone links (e.g. https://wa.me/2010... or wa.me/2010...)
  if (cleanTarget.includes('wa.me/')) {
    const phonePart = cleanTarget.replace(/.*wa\.me\//, '').split('?')[0];
    const sanitized = sanitizeWhatsAppNumber(phonePart);
    if (sanitized) {
      return text 
        ? `https://api.whatsapp.com/send/?phone=${sanitized}&text=${encodeURIComponent(text)}`
        : `https://wa.me/${sanitized}`;
    }
  }

  // If user entered just phone digits or +digits
  const sanitized = sanitizeWhatsAppNumber(cleanTarget);
  if (sanitized && sanitized.length >= 8) {
    return text 
      ? `https://api.whatsapp.com/send/?phone=${sanitized}&text=${encodeURIComponent(text)}`
      : `https://wa.me/${sanitized}`;
  }

  // Fallback
  return text 
    ? `https://api.whatsapp.com/send/?phone=${defaultPhone}&text=${encodeURIComponent(text)}` 
    : defaultShortlink;
}
