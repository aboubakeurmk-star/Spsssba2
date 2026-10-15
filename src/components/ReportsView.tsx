import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Order, Payment, Expense, Client, ServiceItem, AppSettings } from '../types';
import { formatCurrency, formatDate, calculatePeriodKPIs } from '../utils/calculations';
import { OfficialLogo } from './OfficialLogo';

interface ReportsViewProps {
  orders: Order[];
  payments: Payment[];
  expenses: Expense[];
  clients: Client[];
  services: ServiceItem[];
  settings: AppSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  payments,
  expenses,
  clients,
  services,
  settings,
}) => {
  const now = new Date();
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const monthNames = [
    'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
    'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // Date range filter
  let dateFilter: { startDate: string; endDate: string };
  if (reportType === 'monthly') {
    const mStr = selectedMonth.toString().padStart(2, '0');
    dateFilter = {
      startDate: `${selectedYear}-${mStr}-01`,
      endDate: `${selectedYear}-${mStr}-31`,
    };
  } else {
    dateFilter = {
      startDate: `${selectedYear}-01-01`,
      endDate: `${selectedYear}-12-31`,
    };
  }

  const kpis = calculatePeriodKPIs(orders, payments, expenses, dateFilter);

  // Filtered lists for the period
  const periodOrders = orders.filter(
    (o) => o.registrationDate >= dateFilter.startDate && o.registrationDate <= dateFilter.endDate
  );
  const periodPayments = payments.filter(
    (p) => !p.isRefund && p.date >= dateFilter.startDate && p.date <= dateFilter.endDate
  );
  const periodExpenses = expenses.filter(
    (e) => e.date >= dateFilter.startDate && e.date <= dateFilter.endDate
  );

  // Previous month/year comparison for trend
  let prevDateFilter: { startDate: string; endDate: string };
  if (reportType === 'monthly') {
    const prevM = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    const mStr = prevM.toString().padStart(2, '0');
    prevDateFilter = {
      startDate: `${prevY}-${mStr}-01`,
      endDate: `${prevY}-${mStr}-31`,
    };
  } else {
    prevDateFilter = {
      startDate: `${selectedYear - 1}-01-01`,
      endDate: `${selectedYear - 1}-12-31`,
    };
  }
  const prevKpis = calculatePeriodKPIs(orders, payments, expenses, prevDateFilter);
  const incomeGrowth = prevKpis.totalCashCollected > 0
    ? Math.round(((kpis.totalCashCollected - prevKpis.totalCashCollected) / prevKpis.totalCashCollected) * 100)
    : 0;

  // Breakdown by service
  const serviceRevenueMap = new Map<string, { count: number; total: number }>();
  for (const o of periodOrders) {
    if (o.status === 'cancelled') continue;
    for (const sName of o.serviceNames) {
      const existing = serviceRevenueMap.get(sName) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += o.finalPrice / (o.serviceNames.length || 1);
      serviceRevenueMap.set(sName, existing);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const title = reportType === 'monthly'
      ? `تقرير_${monthNames[selectedMonth - 1]}_${selectedYear}`
      : `تقرير_سنة_${selectedYear}`;

    let csvContent = `data:text/csv;charset=utf-8,\uFEFF`;
    csvContent += `تقرير نشاط SPSS SBA - ${title}\n`;
    csvContent += `تاريخ التصدير,${new Date().toLocaleDateString('ar-DZ')}\n\n`;

    csvContent += `المؤشر,القيمة (د.ج / عدد)\n`;
    csvContent += `عدد الطلبات المسجلة,${kpis.totalOrdersCount}\n`;
    csvContent += `قيمة الطلبات المسجلة,${kpis.totalOrdersValue}\n`;
    csvContent += `إجمالي المقبوضات الفعلية,${kpis.totalCashCollected}\n`;
    csvContent += `إجمالي المصاريف,${kpis.totalExpenses}\n`;
    csvContent += `صافي التدفق النقدي,${kpis.netCashFlow}\n`;
    csvContent += `المستحقات المتبقية بذمة العملاء,${kpis.totalRemainingDebt}\n\n`;

    csvContent += `توزيع الخدمات,عدد الطلبات,المداخيل التقديرية\n`;
    serviceRevenueMap.forEach((val, key) => {
      csvContent += `"${key}",${val.count},${val.total}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPSS_SBA_${title}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Report Type Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                reportType === 'monthly' ? 'bg-[#0F2A4A] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              التقرير الشهري
            </button>
            <button
              type="button"
              onClick={() => setReportType('annual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                reportType === 'annual' ? 'bg-[#0F2A4A] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              التقرير السنوي
            </button>
          </div>

          {/* Period Selectors */}
          <div className="flex items-center gap-2">
            {reportType === 'monthly' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold font-mono"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              title="تصدير إلى Excel/CSV"
              className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">تصدير CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-10 px-4 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="printable-area bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs text-right print:shadow-none print:border-none print:p-0 space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-[#0F2A4A] pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <OfficialLogo
            logoDataUrl={settings.logoDataUrl}
            size="lg"
            showSubtitle={true}
            isPrintVersion={true}
          />

          <div className="text-center sm:text-left">
            <h2 className="text-base sm:text-lg font-black text-[#0F2A4A]">
              {reportType === 'monthly'
                ? `التقرير المالي والإداري لشهر ${monthNames[selectedMonth - 1]} ${selectedYear}`
                : `التقرير المالي والإداري السنوي لسنة ${selectedYear}`}
            </h2>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              تاريخ التحرير: {new Date().toLocaleDateString('ar-DZ')}
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
            <span className="text-[11px] text-slate-500 block">إجمالي المقبوضات الفعلية</span>
            <span className="text-base sm:text-xl font-mono font-black text-emerald-700">
              {formatCurrency(kpis.totalCashCollected)}
            </span>
            {incomeGrowth !== 0 && (
              <span className={`text-[10px] block mt-1 font-semibold ${incomeGrowth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {incomeGrowth > 0 ? `+${incomeGrowth}% مقارنة بالفترة السابقة` : `${incomeGrowth}% مقارنة بالفترة السابقة`}
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
            <span className="text-[11px] text-slate-500 block">صافي التدفق النقدي</span>
            <span className={`text-base sm:text-xl font-mono font-black ${kpis.netCashFlow >= 0 ? 'text-[#0F2A4A]' : 'text-rose-600'}`}>
              {formatCurrency(kpis.netCashFlow)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">السيولة الصافية للنشاط</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
            <span className="text-[11px] text-slate-500 block">إجمالي المصاريف التشغيلية</span>
            <span className="text-base sm:text-xl font-mono font-black text-slate-800">
              {formatCurrency(kpis.totalExpenses)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">{periodExpenses.length} عمليات صرف</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
            <span className="text-[11px] text-slate-500 block">الديون المستحقة لدى العملاء</span>
            <span className="text-base sm:text-xl font-mono font-black text-amber-600">
              {formatCurrency(kpis.totalRemainingDebt)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">واجبة التحصيل</span>
          </div>
        </div>

        {/* Operational Statistics */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="font-bold text-slate-800 mb-2">إحصائيات إنجاز الطلبات خلال الفترة:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">الطلبات المسجلة</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{kpis.totalOrdersCount}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">إجمالي قيمة الطلبات</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{formatCurrency(kpis.totalOrdersValue)}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">طلبات مكتملة / مسلّمة</span>
              <span className="font-bold text-emerald-600 text-sm font-mono">{kpis.completedOrdersCount}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">طلبات متأخرة</span>
              <span className="font-bold text-rose-600 text-sm font-mono">{kpis.overdueOrdersCount}</span>
            </div>
          </div>
        </div>

        {/* Services Revenue Distribution Table */}
        <div className="space-y-2">
          <div className="font-bold text-xs text-slate-800">توزيع المداخيل حسب نوع الخدمة:</div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0F2A4A] text-white">
                <tr>
                  <th className="py-2.5 px-3">اسم الخدمة الأكاديمية / الإحصائية</th>
                  <th className="py-2.5 px-3 text-center">عدد الطلبات</th>
                  <th className="py-2.5 px-3 text-left">المداخيل المحققة (د.ج)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {serviceRevenueMap.size === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">
                      لا توجد بيانات مسجلة لهذه الفترة.
                    </td>
                  </tr>
                ) : (
                  Array.from(serviceRevenueMap.entries())
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([name, val]) => (
                      <tr key={name}>
                        <td className="py-2 px-3 font-medium text-slate-900">{name}</td>
                        <td className="py-2 px-3 text-center font-mono">{val.count}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700 text-left">
                          {formatCurrency(val.total)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Footer & Approval Notice */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>SPSS SBA — سيدي بلعباس</span>
            <span className="mx-2">·</span>
            <span>هاتف: {settings.phone}</span>
          </div>

          <div className="text-center sm:text-left">
            <span>توقيع وختم الإدارة:</span>
            <div className="h-10 w-32 border-b border-dashed border-slate-300 mt-2 mx-auto sm:ml-auto sm:mr-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
