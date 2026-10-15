import { Client, ServiceItem, Order, Payment, Expense, AppSettings, AppDatabase } from '../types';

const STORAGE_KEYS = {
  CLIENTS: 'spss_sba_clients_v1',
  SERVICES: 'spss_sba_services_v1',
  ORDERS: 'spss_sba_orders_v1',
  PAYMENTS: 'spss_sba_payments_v1',
  EXPENSES: 'spss_sba_expenses_v1',
  SETTINGS: 'spss_sba_settings_v1',
  IS_DEMO: 'spss_sba_is_demo_v1',
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'SRV-01',
    name: 'كتابة وإعداد مذكرات التخرج',
    description: 'صياغة المذكرات لطلبة الليسانس والماستر والدكتوراه وفق المعايير الأكاديمية والمنهجية العلمية.',
    category: 'أكاديمي وبحث علمي',
    estimatedPrice: 35000,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'SRV-02',
    name: 'إعداد التقارير وتقارير التربص',
    description: 'إعداد وتنسيق تقارير نهاية التربص الميداني وتقارير المشاريع التطبيقية بدقة عالية.',
    category: 'أكاديمي وبحث علمي',
    estimatedPrice: 15000,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'SRV-03',
    name: 'التحليل الإحصائي للبيانات باستخدام SPSS',
    description: 'تفريغ الاستبيانات، التحليل الوصفي، اختبار الفرضيات، تحليل الانحدار والتباين، ومناقشة النتائج.',
    category: 'إحصاء وتحليل بيانات',
    estimatedPrice: 20000,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'SRV-04',
    name: 'تصميم وإعداد السير الذاتية CV',
    description: 'تصميم سيرة ذاتية احترافية ثنائية اللغة تدعم معايير الفرز الآلي ATS بصيغتي PDF و Word.',
    category: 'تصميم وهوية مهنية',
    estimatedPrice: 3000,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'SRV-05',
    name: 'تصميم العروض التقديمية باستخدام PowerPoint',
    description: 'عروض تقديمية تفاعلية جذابة لمناقشات المذكرات والمؤتمرات مع مؤثرات ورسوم بيانية.',
    category: 'تصميم وعروض',
    estimatedPrice: 8000,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'SRV-06',
    name: 'التسجيلات والخدمات المرتبطة بها',
    description: 'مرافقة تسجيلات المنح الجامعية، التسجيل في منصات الدكتوراه ومسابقات التوظيف والتربصات.',
    category: 'خدمات إدارية وتسجيل',
    estimatedPrice: 5000,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'SRV-07',
    name: 'تنسيق المذكرات والوثائق وتعديلها',
    description: 'ضبط الهوامش والخطوط والفهارس الآلية والمراجع وفق دليل الجامعة (APA، شيكاغو، وغيرها).',
    category: 'تدقيق وتنسيق',
    estimatedPrice: 7000,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'SRV-08',
    name: 'استشارات وتدقيق المنهجية الإحصائية',
    description: 'مراجعة أدوات الدراسة (الاستبيان والمقابلة)، حساب الصدق والثبات، وتصحيح العينات.',
    category: 'إحصاء واستشارات',
    estimatedPrice: 12000,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  brandName: 'SPSS SBA',
  brandTagline: 'خدمات أكاديمية وإحصائية وتصميمية للطلبة والباحثين',
  phone: '0655652572',
  whatsappNumber: '0655652572',
  facebookAccount: 'Spss Sba',
  instagramAccount: 'spss.sba',
  currency: 'د.ج',
  signatoryTitle: 'المسؤول المالي والإداري',
};

// Initial realistic demo clients
export const DEMO_CLIENTS: Client[] = [
  {
    id: 'CLI-1001',
    name: 'أحمد بن علي',
    phone: '0661234567',
    socialHandle: 'ahmed.benali.dz',
    specialty: 'علوم اقتصادية وإدارة أعمال',
    institution: 'جامعة جيلالي ليابس - سيدي بلعباس',
    source: 'Facebook',
    firstContactDate: '2026-09-10',
    notes: 'طالب ماستر 2، يحتاج تحليل استبيان لـ 150 عينة مع كتابة الفصل التطبيقي.',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'CLI-1002',
    name: 'سارة بوجمعة',
    phone: '0550987654',
    socialHandle: 'sara_psych',
    specialty: 'علم النفس العيادي والتربوي',
    institution: 'جامعة وهران 2',
    source: 'Instagram',
    firstContactDate: '2026-09-15',
    notes: 'تحليل مقياس الاكتئاب وقلق الامتحان لدى المراهقين.',
    createdAt: '2026-09-15T14:30:00Z',
    updatedAt: '2026-09-15T14:30:00Z',
  },
  {
    id: 'CLI-1003',
    name: 'الدكتور محمد قادري',
    phone: '0770334455',
    specialty: 'علوم طبية وبيولوجيا',
    institution: 'المركز الاستشفائي الجامعي',
    source: 'إحالة',
    firstContactDate: '2026-09-20',
    notes: 'ورقة بحثية منشورة، تحليل إحصائي سريري متقدم ومقارنة مجموعات.',
    createdAt: '2026-09-20T09:15:00Z',
    updatedAt: '2026-09-20T09:15:00Z',
  },
  {
    id: 'CLI-1004',
    name: 'فاطمة الزهراء منصوري',
    phone: '0658112233',
    socialHandle: 'fatima_zohra_m',
    specialty: 'حقوق وعلوم سياسية',
    institution: 'جامعة تلمسان',
    source: 'WhatsApp',
    firstContactDate: '2026-10-01',
    notes: 'تنسيق مذكرة تخرج وعرض باوربوينت للمناقشة.',
    createdAt: '2026-10-01T11:00:00Z',
    updatedAt: '2026-10-01T11:00:00Z',
  },
];

// Initial realistic demo orders
export const DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-2026-001',
    clientId: 'CLI-1001',
    serviceIds: ['SRV-03', 'SRV-07'],
    serviceNames: ['التحليل الإحصائي للبيانات باستخدام SPSS', 'تنسيق المذكرات والوثائق وتعديلها'],
    title: 'تحليل استبيان الحوكمة وأثرها على الأداء المالي',
    description: 'تفريغ 150 استبياناً، تحليل الانحدار المتعدد ومناقشة الفرضيات مع تنسيق الفصل 4.',
    registrationDate: '2026-09-12',
    startDate: '2026-09-13',
    expectedDeliveryDate: '2026-09-28',
    actualDeliveryDate: '2026-09-27',
    totalPrice: 28000,
    discount: 3000,
    finalPrice: 25000,
    status: 'delivered',
    priority: 'high',
    internalNotes: 'تم التسليم بنجاح مع شرح الملفات الصوتية للعميل.',
    timeline: [
      { id: '1', timestamp: '2026-09-12T10:00:00Z', type: 'created', description: 'تسجيل الطلب والاتفاق على الشروط والموعد.' },
      { id: '2', timestamp: '2026-09-13T12:00:00Z', type: 'payment_added', description: 'استلام دفعة أولى بمبلغ 15,000 د.ج عبر بريدي موب.' },
      { id: '3', timestamp: '2026-09-27T16:00:00Z', type: 'payment_added', description: 'استلام الدفعة المتبقية بمبلغ 10,000 د.ج نقدًا.' },
      { id: '4', timestamp: '2026-09-27T17:00:00Z', type: 'status_change', description: 'تسليم العمل النهائي للعميل بالكامل.' },
    ],
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-27T17:00:00Z',
  },
  {
    id: 'ORD-2026-002',
    clientId: 'CLI-1002',
    serviceIds: ['SRV-03'],
    serviceNames: ['التحليل الإحصائي للبيانات باستخدام SPSS'],
    title: 'تحليل صدق وثبات مقياس قلق الامتحان لدى التلاميذ',
    description: 'حساب معامل ألفا كرونباخ والتحليل العاملي الاستكشافي واختبار ت للعينات المستقلة.',
    registrationDate: '2026-09-18',
    startDate: '2026-09-20',
    expectedDeliveryDate: '2026-10-18',
    totalPrice: 18000,
    discount: 0,
    finalPrice: 18000,
    status: 'in_progress',
    priority: 'medium',
    internalNotes: 'تم إنجاز 70% من التحليل وجاري كتابة جداول التعليق.',
    timeline: [
      { id: '1', timestamp: '2026-09-18T15:00:00Z', type: 'created', description: 'تسجيل الطلب مع استلام مصفوفة إكسل.' },
      { id: '2', timestamp: '2026-09-20T10:00:00Z', type: 'payment_added', description: 'استلام تسبيق مالي بمبلغ 10,000 د.ج.' },
      { id: '3', timestamp: '2026-10-05T09:30:00Z', type: 'status_change', description: 'البدء في التحليل المتقدم.' },
    ],
    createdAt: '2026-09-18T15:00:00Z',
    updatedAt: '2026-10-05T09:30:00Z',
  },
  {
    id: 'ORD-2026-003',
    clientId: 'CLI-1003',
    serviceIds: ['SRV-03', 'SRV-05'],
    serviceNames: ['التحليل الإحصائي للبيانات باستخدام SPSS', 'تصميم العروض التقديمية باستخدام PowerPoint'],
    title: 'تحليل نتائج تجربة سريرية مع عرض باوربوينت',
    description: 'تحليل بقاء كابلان-ماير وتحليل كوكس للأخطار النسبية مع تصميم شرائح عرض احترافية.',
    registrationDate: '2026-09-25',
    startDate: '2026-09-26',
    expectedDeliveryDate: '2026-10-10', // Overdue in demo scenario
    totalPrice: 42000,
    discount: 2000,
    finalPrice: 40000,
    status: 'in_progress',
    priority: 'urgent',
    internalNotes: 'طلب مستعجل لمؤتمر قادم، يتطلب دقة شديدة في الرسوم البيانية.',
    timeline: [
      { id: '1', timestamp: '2026-09-25T11:00:00Z', type: 'created', description: 'تسجيل الطلب الطبي.' },
      { id: '2', timestamp: '2026-09-26T14:00:00Z', type: 'payment_added', description: 'استلام دفعة أولى بمبلغ 20,000 د.ج تحويل بنكي.' },
    ],
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-09-26T14:00:00Z',
  },
  {
    id: 'ORD-2026-004',
    clientId: 'CLI-1004',
    serviceIds: ['SRV-05', 'SRV-07'],
    serviceNames: ['تصميم العروض التقديمية باستخدام PowerPoint', 'تنسيق المذكرات والوثائق وتعديلها'],
    title: 'تنسيق مذكرة ماستر وتجهيز عرض المناقشة',
    description: 'تنسيق 120 صفحة قانونية وتصميم 18 شريحة عرض متناسقة.',
    registrationDate: '2026-10-02',
    startDate: '2026-10-03',
    expectedDeliveryDate: '2026-10-22',
    totalPrice: 15000,
    discount: 1000,
    finalPrice: 14000,
    status: 'new',
    priority: 'medium',
    internalNotes: 'في انتظار إرسال النسخة المدققة لغوياً من قبل الطالبة.',
    timeline: [
      { id: '1', timestamp: '2026-10-02T13:00:00Z', type: 'created', description: 'تسجيل الطلب.' },
    ],
    createdAt: '2026-10-02T13:00:00Z',
    updatedAt: '2026-10-02T13:00:00Z',
  },
];

// Initial realistic demo payments
export const DEMO_PAYMENTS: Payment[] = [
  {
    id: 'TXN-1001',
    receiptNo: 'REC-2026-001',
    orderId: 'ORD-2026-001',
    clientId: 'CLI-1001',
    amount: 15000,
    date: '2026-09-13',
    time: '12:30',
    method: 'baridimob',
    notes: 'دفعة أولى (تسبيق) عند بدء العمل عبر تطبيق بريدي موب',
    createdAt: '2026-09-13T12:30:00Z',
  },
  {
    id: 'TXN-1002',
    receiptNo: 'REC-2026-002',
    orderId: 'ORD-2026-001',
    clientId: 'CLI-1001',
    amount: 10000,
    date: '2026-09-27',
    time: '16:15',
    method: 'cash',
    notes: 'الدفعة الثانية والمتبقية عند تسليم الملفات النهائية',
    createdAt: '2026-09-27T16:15:00Z',
  },
  {
    id: 'TXN-1003',
    receiptNo: 'REC-2026-003',
    orderId: 'ORD-2026-002',
    clientId: 'CLI-1002',
    amount: 10000,
    date: '2026-09-20',
    time: '10:00',
    method: 'baridimob',
    notes: 'تسبيق 10,000 د.ج للتحليل الإحصائي',
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'TXN-1004',
    receiptNo: 'REC-2026-004',
    orderId: 'ORD-2026-003',
    clientId: 'CLI-1003',
    amount: 20000,
    date: '2026-09-26',
    time: '14:20',
    method: 'bank_transfer',
    notes: 'تحويل الحساب الدفعة الأولى 50% من إجمالي الطلب',
    createdAt: '2026-09-26T14:20:00Z',
  },
];

// Initial realistic demo expenses
export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'EXP-1001',
    amount: 6000,
    date: '2026-09-05',
    category: 'software',
    description: 'تجديد اشتراك منصة الإحصاء والبرمجيات السحابية',
    method: 'baridimob',
    createdAt: '2026-09-05T09:00:00Z',
  },
  {
    id: 'EXP-1002',
    amount: 3500,
    date: '2026-09-15',
    category: 'internet',
    description: 'اشتراك إنترنت عالي السرعة وباقة اتصالات',
    method: 'cash',
    createdAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'EXP-1003',
    amount: 5000,
    date: '2026-09-22',
    category: 'marketing',
    description: 'حملة إعلانية ممولة على فيسبوك وإنستغرام موجهة للطلبة',
    method: 'baridimob',
    createdAt: '2026-09-22T16:00:00Z',
  },
  {
    id: 'EXP-1004',
    amount: 2800,
    date: '2026-10-01',
    category: 'printing',
    description: 'حبر طابعة وأوراق ودفاتر أرشيف للوصولات',
    method: 'cash',
    createdAt: '2026-10-01T10:00:00Z',
  },
];

/**
 * Load complete application state from local storage or initialize with demo data
 */
export function loadDatabase(): AppDatabase {
  try {
    const clientsStr = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    const servicesStr = localStorage.getItem(STORAGE_KEYS.SERVICES);
    const ordersStr = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const paymentsStr = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    const expensesStr = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const isDemoStr = localStorage.getItem(STORAGE_KEYS.IS_DEMO);

    // If no existing data, seed demo data
    if (!clientsStr && !ordersStr) {
      saveDatabase({
        clients: DEMO_CLIENTS,
        services: INITIAL_SERVICES,
        orders: DEMO_ORDERS,
        payments: DEMO_PAYMENTS,
        expenses: DEMO_EXPENSES,
        settings: INITIAL_SETTINGS,
        isDemoData: true,
      });
      return {
        clients: DEMO_CLIENTS,
        services: INITIAL_SERVICES,
        orders: DEMO_ORDERS,
        payments: DEMO_PAYMENTS,
        expenses: DEMO_EXPENSES,
        settings: INITIAL_SETTINGS,
        isDemoData: true,
      };
    }

    return {
      clients: clientsStr ? JSON.parse(clientsStr) : DEMO_CLIENTS,
      services: servicesStr ? JSON.parse(servicesStr) : INITIAL_SERVICES,
      orders: ordersStr ? JSON.parse(ordersStr) : DEMO_ORDERS,
      payments: paymentsStr ? JSON.parse(paymentsStr) : DEMO_PAYMENTS,
      expenses: expensesStr ? JSON.parse(expensesStr) : DEMO_EXPENSES,
      settings: settingsStr ? { ...INITIAL_SETTINGS, ...JSON.parse(settingsStr) } : INITIAL_SETTINGS,
      isDemoData: isDemoStr !== null ? JSON.parse(isDemoStr) : false,
    };
  } catch (err) {
    console.error('Failed to load database from localStorage', err);
    return {
      clients: DEMO_CLIENTS,
      services: INITIAL_SERVICES,
      orders: DEMO_ORDERS,
      payments: DEMO_PAYMENTS,
      expenses: DEMO_EXPENSES,
      settings: INITIAL_SETTINGS,
      isDemoData: true,
    };
  }
}

/**
 * Save complete application state to local storage
 */
export function saveDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(db.clients));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(db.services));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(db.orders));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(db.payments));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(db.expenses));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(db.settings));
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, JSON.stringify(db.isDemoData));
  } catch (err) {
    console.error('Failed to save database to localStorage', err);
  }
}

/**
 * Clear demo data and start with a fresh clean empty state (preserving default services and settings)
 */
export function clearDemoDataAndStartFresh(): AppDatabase {
  const currentSettingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  const settings = currentSettingsStr ? JSON.parse(currentSettingsStr) : INITIAL_SETTINGS;

  const freshDb: AppDatabase = {
    clients: [],
    services: INITIAL_SERVICES,
    orders: [],
    payments: [],
    expenses: [],
    settings: settings,
    isDemoData: false,
  };

  saveDatabase(freshDb);
  return freshDb;
}

/**
 * Reset application to initial demo data
 */
export function resetToDemoData(): AppDatabase {
  const demoDb: AppDatabase = {
    clients: DEMO_CLIENTS,
    services: INITIAL_SERVICES,
    orders: DEMO_ORDERS,
    payments: DEMO_PAYMENTS,
    expenses: DEMO_EXPENSES,
    settings: INITIAL_SETTINGS,
    isDemoData: true,
  };

  saveDatabase(demoDb);
  return demoDb;
}

/**
 * Export complete backup to downloadable JSON
 */
export function exportDatabaseBackup(db: AppDatabase): void {
  const backupData = {
    appName: 'SPSS SBA Management System',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: db,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `SPSS_SBA_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Generate next sequence ID
 */
export function generateNextId(prefix: string, existingIds: string[]): string {
  const numbers = existingIds
    .map((id) => {
      const match = id.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
  const next = max + 1;

  if (prefix === 'ORD') {
    const year = new Date().getFullYear();
    const count = (numbers.length + 1).toString().padStart(3, '0');
    return `ORD-${year}-${count}`;
  }

  if (prefix === 'REC') {
    const year = new Date().getFullYear();
    const count = (numbers.length + 1).toString().padStart(3, '0');
    return `REC-${year}-${count}`;
  }

  return `${prefix}-${next}`;
}
