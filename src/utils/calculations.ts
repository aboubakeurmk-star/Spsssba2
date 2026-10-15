import { Order, Payment, Expense } from '../types';

/**
 * Format currency with Algerian Dinar symbol
 */
export function formatCurrency(amount: number, includeCurrency = true): string {
  const formatted = new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  return includeCurrency ? `${formatted} د.ج` : formatted;
}

/**
 * Format date in Arabic friendly representation
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

/**
 * Check deadline status of an order
 */
export function getDeadlineStatus(expectedDeliveryDate: string, orderStatus: string): {
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
  daysRemaining: number;
  label: string;
} {
  if (!expectedDeliveryDate || orderStatus === 'completed' || orderStatus === 'delivered' || orderStatus === 'cancelled') {
    return { isOverdue: false, isDueToday: false, isDueTomorrow: false, daysRemaining: 999, label: 'مكتمل أو ملغى' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delivery = new Date(expectedDeliveryDate);
  delivery.setHours(0, 0, 0, 0);

  const diffTime = delivery.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isOverdue: true,
      isDueToday: false,
      isDueTomorrow: false,
      daysRemaining: diffDays,
      label: `متأخر بـ ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'يوم' : Math.abs(diffDays) === 2 ? 'يومين' : 'أيام'}`,
    };
  } else if (diffDays === 0) {
    return {
      isOverdue: false,
      isDueToday: true,
      isDueTomorrow: false,
      daysRemaining: 0,
      label: 'موعد التسليم اليوم!',
    };
  } else if (diffDays === 1) {
    return {
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: true,
      daysRemaining: 1,
      label: 'موعد التسليم غداً',
    };
  } else {
    return {
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: false,
      daysRemaining: diffDays,
      label: `متبقي ${diffDays} أيام`,
    };
  }
}

/**
 * Calculate financials for a specific order
 */
export function calculateOrderFinancials(order: Order, payments: Payment[]): {
  finalPrice: number;
  totalPaid: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  isOverpaid: boolean;
  overpaidAmount: number;
  paymentsCount: number;
  refundsTotal: number;
} {
  const orderPayments = payments.filter((p) => p.orderId === order.id);

  let totalPaid = 0;
  let refundsTotal = 0;
  let paymentsCount = 0;

  for (const p of orderPayments) {
    if (p.isRefund) {
      refundsTotal += p.amount;
    } else {
      totalPaid += p.amount;
      paymentsCount += 1;
    }
  }

  // Net payments collected for this order
  const netPaid = Math.max(0, totalPaid - refundsTotal);
  const remaining = order.finalPrice - netPaid;
  const isOverpaid = remaining < 0;
  const remainingAmount = isOverpaid ? 0 : Math.max(0, remaining);
  const overpaidAmount = isOverpaid ? Math.abs(remaining) : 0;
  const isFullyPaid = remaining <= 0 && order.finalPrice > 0;

  return {
    finalPrice: order.finalPrice,
    totalPaid: netPaid,
    remainingAmount,
    isFullyPaid,
    isOverpaid,
    overpaidAmount,
    paymentsCount,
    refundsTotal,
  };
}

/**
 * Period KPIs Calculation
 */
export function calculatePeriodKPIs(
  orders: Order[],
  payments: Payment[],
  expenses: Expense[],
  dateFilter?: { startDate?: string; endDate?: string }
): {
  totalOrdersCount: number;
  completedOrdersCount: number;
  activeOrdersCount: number;
  overdueOrdersCount: number;
  totalOrdersValue: number;
  totalCashCollected: number;
  totalExpenses: number;
  totalRefunds: number;
  netCashFlow: number;
  totalRemainingDebt: number;
  estimatedProfit: number;
} {
  // Filter by date if specified
  const filteredOrders = dateFilter?.startDate && dateFilter?.endDate
    ? orders.filter((o) => o.registrationDate >= dateFilter.startDate! && o.registrationDate <= dateFilter.endDate!)
    : orders;

  const filteredPayments = dateFilter?.startDate && dateFilter?.endDate
    ? payments.filter((p) => p.date >= dateFilter.startDate! && p.date <= dateFilter.endDate!)
    : payments;

  const filteredExpenses = dateFilter?.startDate && dateFilter?.endDate
    ? expenses.filter((e) => e.date >= dateFilter.startDate! && e.date <= dateFilter.endDate!)
    : expenses;

  let totalCashCollected = 0;
  let totalRefunds = 0;

  for (const p of filteredPayments) {
    if (p.isRefund) {
      totalRefunds += p.amount;
    } else {
      totalCashCollected += p.amount;
    }
  }

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOrdersValue = filteredOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.finalPrice : sum), 0);

  // Remaining debt across active orders
  let totalRemainingDebt = 0;
  let completedCount = 0;
  let activeCount = 0;
  let overdueCount = 0;

  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    if (o.status === 'completed' || o.status === 'delivered') {
      completedCount++;
    } else {
      activeCount++;
      const dl = getDeadlineStatus(o.expectedDeliveryDate, o.status);
      if (dl.isOverdue) overdueCount++;
    }

    const fin = calculateOrderFinancials(o, payments);
    totalRemainingDebt += fin.remainingAmount;
  }

  // Net cash flow: actual cash in minus cash out
  const netCashFlow = totalCashCollected - totalRefunds - totalExpenses;
  const estimatedProfit = netCashFlow;

  return {
    totalOrdersCount: filteredOrders.length,
    completedOrdersCount: completedCount,
    activeOrdersCount: activeCount,
    overdueOrdersCount: overdueCount,
    totalOrdersValue,
    totalCashCollected,
    totalExpenses,
    totalRefunds,
    netCashFlow,
    totalRemainingDebt,
    estimatedProfit,
  };
}

/**
 * Convert number to written Arabic words (Tafqeet / تفقيط المبالغ)
 * e.g., 15000 -> خمسة عشر ألف دينار جزائري فقط لا غير
 */
export function amountToArabicWords(number: number): string {
  if (number === 0) return 'صفر دينار جزائري فقط لا غير';

  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  function convertGroup(n: number): string {
    let result = '';
    const h = Math.floor(n / 100);
    const r = n % 100;
    const t = Math.floor(r / 10);
    const u = r % 10;

    if (h > 0) {
      result += hundreds[h];
    }

    if (r > 0) {
      if (result) result += ' و';
      if (r < 10) {
        result += units[r];
      } else if (r >= 10 && r < 20) {
        result += teens[r - 10];
      } else {
        if (u > 0) {
          result += units[u] + ' و' + tens[t];
        } else {
          result += tens[t];
        }
      }
    }
    return result;
  }

  const integerPart = Math.floor(number);
  const millions = Math.floor(integerPart / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(`${convertGroup(millions)} ملايين`);
    else parts.push(`${convertGroup(millions)} مليون`);
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(`${convertGroup(thousands)} آلاف`);
    else parts.push(`${convertGroup(thousands)} ألف`);
  }

  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  const arabicText = parts.join(' و');
  return `${arabicText} دينار جزائري فقط لا غير`;
}
