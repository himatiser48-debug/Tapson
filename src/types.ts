export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  badge?: string;
  featured?: boolean;
  createdAt?: string;
}

export type Language = 'ar' | 'en';

export interface StoreSettings {
  name: string;
  ownerName: string;
  logo: string;
  tagline: string;
  whatsappNumber: string; // WhatsApp link like https://wa.me/message/NLV2EU2CTTDGN1 or phone digits
  whatsappUrl?: string; // Direct full link
  phoneNumber: string;
  currency: string;
  shippingFee: number;
  freeShippingThreshold: number;
  announcementText: string;
  deliveryTime: string;
  cityList?: string[];
  enableStockWarning?: boolean;
  adminPin?: string; // Secret PIN code to access admin
  hideAdminButtonFromPublic?: boolean; // If true, hides the admin button from visitors
  // Explainer Video settings
  showExplainerVideo?: boolean;
  videoUrl?: string; // YouTube or direct MP4/WebM url
  videoTitle?: string;
  videoDescription?: string;
  // Social media accounts
  tiktokUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  alternatePhone: string;
  city: string;
  address: string;
  notes: string;
  paymentMethod: 'cash_on_delivery' | 'vodafone_cash' | 'instapay' | 'bank_transfer';
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  customer: CustomerInfo;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    image: string;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: string;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: string;
}
