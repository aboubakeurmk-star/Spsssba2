import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Calendar,
  Sparkles,
  Printer,
  Trash2,
  Smartphone,
  Download,
} from 'lucide-react';
import { Order, Payment, Expense, Client, ServiceItem } from '../types';
import { formatCurrency, calculatePeriodKPIs, calculateOrderFinancials, getDeadlineStatus } from '../utils/calculations';

interface DashboardViewProps {
  orders: Order[];
  payments: Payment[];
  expenses: Expense[];
  clients: Client[];
  services: ServiceItem[];
  isDemoData: boolean;
  onClearDemoData: () => void;
  onSelectOrder: (order: Order) => void;
  onSelectClient: (client: Client) => void;
  onOpenReceipt: (payment: Payment) => void;
  onNavigate: (view: string) => void;
  onOpenAndroidInstall?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  payments,
  expenses,
  clients,
  services,
  isDemoData,
  onClearDemoData,
  onSelectOrder,
  onSelectClient,
  onOpenReceipt,
  onNavigate,
  onOpenAndroidInstall,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'this_year'>('all');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

  let dateFilter: { startDate?: string; endDate?: string } | undefined;
  if (periodFilter === 'this_month') {
    dateFilter = {
      startDate: `${currentYear}-${currentMonth}-01`,
      endDate: `${currentYear}-${currentMonth}-31`,
    };
  } else if (periodFilter === 'this_year') {
    dateFilter = {
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
    };
  }

  const kpis = calculatePeriodKPIs(orders, payments, expenses, dateFilter);

  // Overdue orders
  const overdueOrders = orders.filter((o) => {
    if (o.status === 'completed' || o.status === 'delivered' || o.status === 'cancelled') return false;
    const dl = getDeadlineStatus(o.expectedDeliveryDate, o.status);
    return dl.isOverdue;
  });

  // Top services by revenue
  const serviceRevenueMap = new Map<string, { name: string; count: number; total: number }>();
  for (const o of orders) {
    if (o.status === 'cancelled') continue;
    for (const sName of o.serviceNames) {
      const existing = serviceRevenueMap.get(sName) || { name: sName, count: 0, total: 0 };
      existing.count += 1;
      existing.total += o.finalPrice / (o.serviceNames.length || 1);
      serviceRevenueMap.set(sName, existing);
    }
  }
  const topServices = Array.from(serviceRevenueMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  // Monthly breakdown for bar visualization (Last 6 months)
  const monthNames = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const monthlyData: { monthKey: string; monthLabel: string; income: number; expense: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const monthKey = `${y}-${m}`;
    const monthLabel = `${monthNames[d.getMonth()]} ${y}`;

    const monthIncome = payments
      .filter((p) => !p.isRefund && p.date.startsWith(monthKey))
      .reduce((sum, p) => sum + p.amount, 0);

    const monthExpense = expenses
      .filter((e) => e.date.startsWith(monthKey))
      .reduce((sum, e) => sum + e.amount, 0);

    monthlyData.push({ monthKey, monthLabel, income: monthIncome, expense: monthExpense });
  }

  const maxMonthlyVal = Math.max(...monthlyData.map((m) => Math.max(m.income, m.expense)), 10000);

  // Recent 4 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-8">
      {/* Demo Data Notice Banner */}
      {isDemoData && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-right">
              <span className="text-xs font-bold text-amber-900 block">
                بيئة تجريبية جاهزة للاختبار
              </span>
              <span className="text-[11px] text-amber-700 block">
                تتضمن بيانات افتراضية لاختبار الطلبات، الدفعات، وصولات PDF، والحسابات. يمكنك مسحها والبدء ببياناتك الفعلية متى شئت.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearDemoData}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 self-end sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح البيانات التجريبية</span>
          </button>
        </div>
      )}

      {/* Android 14 APK / WebAPK Direct Install Banner */}
      {onOpenAndroidInstall && (
        <div className="bg-gradient-to-l from-[#0F2A4A] via-[#153a63] to-[#0d2238] text-white rounded-2xl p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">نسخة تطبيق أندرويد (متوافقة مع Android 14)</span>
                <span className="bg-emerald-500 text-[#0F2A4A] font-bold text-[9px] px-2 py-0.5 rounded-full font-mono">
                  APK / PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                يمكنك تثبيت التطبيق مباشرة على هاتفك ليعمل كـ App مستقل دون متصفح وبدعم العمل أوفلاين.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAndroidInstall}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0F2A4A] text-xs font-black rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5 self-stretch sm:self-auto justify-center active:scale-[0.98]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>تثبيت على أندرويد 14</span>
          </button>
        </div>
      )}

      {/* Overdue Orders Alert Banner */}
      {overdueOrders.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-right">
              <span className="text-xs font-bold text-rose-900 block">
                تنبيه: يوجد {overdueOrders.length} {overdueOrders.length === 1 ? 'طلب متأخر' : 'طلبات متأخرة'} عن موعد التسليم
              </span>
              <span className="text-[11px] text-rose-700">
                يرجى مراجعة قائمة الطلبات واستكمال المهام أو التنسيق مع العملاء.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1"
          >
            <span>عرض الطلبات</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Period Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          المؤشرات المالية ولوحة النشاط
        </h2>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setPeriodFilter('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              periodFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('this_month')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              periodFilter === 'this_month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            هذا الشهر
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('this_year')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              periodFilter === 'this_year' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            هذا العام
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid (Mobile friendly 2-col, Desktop 4-col) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Collected (المقبوضات الفعلية) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] sm:text-xs font-medium">المقبوضات الفعلية</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-emerald-600 font-mono">
            {formatCurrency(kpis.totalCashCollected)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            مبالغ مستلمة فعلياً
          </div>
        </div>

        {/* Net Cash Flow (صافي التدفق النقدي) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] sm:text-xs font-medium">صافي التدفق النقدي</span>
            <div className={`w-7 h-7 rounded-lg ${kpis.netCashFlow >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-base sm:text-xl font-black font-mono ${kpis.netCashFlow >= 0 ? 'text-[#0F2A4A]' : 'text-rose-600'}`}>
            {formatCurrency(kpis.netCashFlow)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            المقبوضات − المصاريف
          </div>
        </div>

        {/* Remaining Receivables (مبالغ متبقية بذمة العملاء) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] sm:text-xs font-medium">المتبقي لدى العملاء</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-amber-600 font-mono">
            {formatCurrency(kpis.totalRemainingDebt)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            مستحقات واجبة التحصيل
          </div>
        </div>

        {/* Total Expenses (المصاريف التشغيلية) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] sm:text-xs font-medium">إجمالي المصاريف</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-slate-800 font-mono">
            {formatCurrency(kpis.totalExpenses)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            برامج، اتصالات، تسويق
          </div>
        </div>
      </div>

      {/* Operational Counters Grid (Compact for mobile) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] sm:text-xs text-slate-500 block">العملاء</span>
          <span className="text-sm sm:text-lg font-black text-slate-900 font-mono">{clients.length}</span>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] sm:text-xs text-slate-500 block">كل الطلبات</span>
          <span className="text-sm sm:text-lg font-black text-slate-900 font-mono">{orders.length}</span>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] sm:text-xs text-slate-500 block">قيد الإنجاز</span>
          <span className="text-sm sm:text-lg font-black text-blue-600 font-mono">{kpis.activeOrdersCount}</span>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] sm:text-xs text-slate-500 block">مكتملة ومسلّمة</span>
          <span className="text-sm sm:text-lg font-black text-emerald-600 font-mono">{kpis.completedOrdersCount}</span>
        </div>
      </div>

      {/* Monthly Inflow / Outflow Chart Section */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            تطور المقبوضات والمصاريف (آخر 6 أشهر)
          </h3>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              مقبوضات
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" />
              مصاريف
            </span>
          </div>
        </div>

        {/* Visual Bar Columns */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-4 pb-2 items-end h-40 border-b border-slate-100">
          {monthlyData.map((m) => {
            const incomeHeight = Math.max(8, Math.round((m.income / maxMonthlyVal) * 100));
            const expenseHeight = Math.max(4, Math.round((m.expense / maxMonthlyVal) * 100));

            return (
              <div key={m.monthKey} className="flex flex-col items-center justify-end h-full gap-1">
                <div className="flex items-end gap-1 w-full justify-center h-full">
                  {/* Income bar */}
                  <div
                    style={{ height: `${incomeHeight}%` }}
                    title={`المقبوضات: ${formatCurrency(m.income)}`}
                    className="w-3 sm:w-5 bg-emerald-500 rounded-t-sm hover:bg-emerald-600 transition-all cursor-pointer"
                  />
                  {/* Expense bar */}
                  <div
                    style={{ height: `${expenseHeight}%` }}
                    title={`المصاريف: ${formatCurrency(m.expense)}`}
                    className="w-3 sm:w-5 bg-slate-300 rounded-t-sm hover:bg-slate-400 transition-all cursor-pointer"
                  />
                </div>
                <span className="text-[9px] sm:text-[11px] text-slate-500 truncate w-full text-center">
                  {m.monthLabel.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Services & Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Demanded Services */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              أكثر الخدمات تحقيقاً للمداخيل
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="text-[11px] text-blue-600 hover:underline font-medium"
            >
              عرض الخدمات
            </button>
          </div>

          <div className="space-y-2.5">
            {topServices.map((svc, idx) => (
              <div key={svc.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="text-right">
                  <div className="font-bold text-slate-900">{svc.name}</div>
                  <div className="text-[10px] text-slate-500">{svc.count} طلبات منفذة</div>
                </div>
                <div className="text-left font-mono font-bold text-[#0F2A4A]">
                  {formatCurrency(svc.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              أحدث الطلبات المسجلة
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="text-[11px] text-blue-600 hover:underline font-medium"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-2">
            {recentOrders.map((ord) => {
              const client = clients.find((c) => c.id === ord.clientId);
              const fin = calculateOrderFinancials(ord, payments);
              const dl = getDeadlineStatus(ord.expectedDeliveryDate, ord.status);

              return (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-[#0F2A4A] cursor-pointer transition-colors bg-white flex items-center justify-between text-xs"
                >
                  <div className="text-right">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{ord.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-normal">({ord.id})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {client?.name || 'عميل'} · {ord.serviceNames[0]}
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="font-mono font-bold text-slate-900">
                      {formatCurrency(ord.finalPrice)}
                    </div>
                    <div className="text-[10px] mt-0.5">
                      {fin.remainingAmount > 0 ? (
                        <span className="text-amber-600 font-semibold">متبقي: {formatCurrency(fin.remainingAmount)}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">مسدد بالكامل</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
