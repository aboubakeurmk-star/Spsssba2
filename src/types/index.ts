export type OrderStatus =
  | 'new'
  | 'in_progress'
  | 'waiting_info'
  | 'under_review'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type PaymentMethod = 'cash' | 'baridimob' | 'bank_transfer' | 'other';

export type ExpenseCategory =
  | 'software'
  | 'internet'
  | 'marketing'
  | 'printing'
  | 'supplies'
  | 'other';

export interface Client {
  id: string; // e.g., "CLI-1001"
  name: string;
  phone: string;
  socialHandle?: string; // Facebook or Instagram
  specialty?: string; // التخصص الجامعي
  institution?: string; // الجامعة أو المؤسسة
  source?: string; // Facebook, Instagram, WhatsApp, إحالة, أخرى
  firstContactDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string; // e.g., "SRV-101"
  name: string;
  description?: string;
  category: string;
  estimatedPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineEvent {
  id: string;
  timestamp: string;
  type: 'created' | 'status_change' | 'payment_added' | 'date_change' | 'note' | 'refund';
  description: string;
  author?: string;
}

export interface Order {
  id: string; // e.g., "ORD-2026-001"
  clientId: string;
  serviceIds: string[];
  serviceNames: string[]; // snapshot of service names
  title: string;
  description?: string;
  registrationDate: string;
  startDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  totalPrice: number; // السعر الإجمالي المتفق عليه
  discount: number; // الخصم
  finalPrice: number; // السعر النهائي بعد الخصم
  status: OrderStatus;
  priority: OrderPriority;
  internalNotes?: string;
  fileLinks?: string[];
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string; // e.g., "TXN-1001"
  receiptNo: string; // e.g., "REC-2026-001"
  orderId: string;
  clientId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  method: PaymentMethod;
  notes?: string;
  isRefund?: boolean;
  refundReason?: string;
  createdAt: string;
}

export interface Expense {
  id: string; // e.g., "EXP-1001"
  amount: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  method: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface AppSettings {
  brandName: string;
  brandTagline: string;
  logoDataUrl?: string; // Base64 uploaded logo
  phone: string;
  whatsappNumber: string;
  facebookAccount: string;
  instagramAccount: string;
  currency: string;
  signatoryTitle: string;
}

export interface AppDatabase {
  clients: Client[];
  services: ServiceItem[];
  orders: Order[];
  payments: Payment[];
  expenses: Expense[];
  settings: AppSettings;
  isDemoData: boolean;
  lastBackupDate?: string;
}
