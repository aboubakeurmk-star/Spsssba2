import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Printer,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import { Payment, Expense, Order, Client, PaymentMethod, ExpenseCategory } from '../types';
import { formatCurrency, formatDate, calculateOrderFinancials } from '../utils/calculations';

interface FinanceViewProps {
  payments: Payment[];
  expenses: Expense[];
  orders: Order[];
  clients: Client[];
  onSavePayment: (payment: Payment) => void;
  onSaveExpense: (expense: Expense) => void;
  onOpenReceipt: (payment: Payment) => void;
  initialOrderIdForPayment?: string;
  initialTab?: 'payments' | 'expenses';
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  payments,
  expenses,
  orders,
  clients,
  onSavePayment,
  onSaveExpense,
  onOpenReceipt,
  initialOrderIdForPayment,
  initialTab = 'payments',
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(!!initialOrderIdForPayment);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  // Form states for new payment
  const [payOrderId, setPayOrderId] = useState(initialOrderIdForPayment || orders[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payTime, setPayTime] = useState(
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
  const [payMethod, setPayMethod] = useState<PaymentMethod>('baridimob');
  const [payNotes, setPayNotes] = useState('');

  // Form states for refund
  const [refundOrderId, setRefundOrderId] = useState(orders[0]?.id || '');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const [refundDate, setRefundDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states for new expense
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('software');
  const [expDescription, setExpDescription] = useState('');
  const [expMethod, setExpMethod] = useState<PaymentMethod>('cash');
  const [expNotes, setExpNotes] = useState('');

  const expenseCategoryLabels: Record<ExpenseCategory, string> = {
    software: 'اشتراكات وبرمجيات',
    internet: 'إنترنت واتصالات',
    marketing: 'إعلانات وتسويق',
    printing: 'طباعة ولوازم',
    supplies: 'أدوات مكتبية',
    other: 'مصاريف تشغيلية أخرى',
  };

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    cash: 'نقدًا (Espèces)',
    baridimob: 'بريدي موب (BaridiMob)',
    bank_transfer: 'تحويل بنكي / CCP',
    other: 'أخرى',
  };

  // When order changes in payment form, calculate remaining balance
  const selectedOrderForPay = orders.find((o) => o.id === payOrderId);
  const orderFinancials = selectedOrderForPay ? calculateOrderFinancials(selectedOrderForPay, payments) : null;

  // Handle saving new payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payOrderId || payAmount <= 0) return;

    const order = orders.find((o) => o.id === payOrderId);
    if (!order) return;

    const currentYear = new Date().getFullYear();
    const existingReceiptNos = payments.map((p) => p.receiptNo);
    const receiptNum = (existingReceiptNos.length + 1).toString().padStart(3, '0');
    const receiptNo = `REC-${currentYear}-${receiptNum}`;
    const txnId = `TXN-${(payments.length + 1001).toString()}`;

    const newPayment: Payment = {
      id: txnId,
      receiptNo,
      orderId: order.id,
      clientId: order.clientId,
      amount: Number(payAmount),
      date: payDate,
      time: payTime,
      method: payMethod,
      notes: payNotes,
      createdAt: new Date().toISOString(),
    };

    onSavePayment(newPayment);
    setIsAddPaymentOpen(false);
    // Automatically open receipt preview
    onOpenReceipt(newPayment);
  };

  // Handle saving refund
  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId || refundAmount <= 0) return;

    const order = orders.find((o) => o.id === refundOrderId);
    if (!order) return;

    const currentYear = new Date().getFullYear();
    const receiptNo = `REF-${currentYear}-${(payments.length + 1).toString().padStart(3, '0')}`;
    const txnId = `REF-${(payments.length + 1001).toString()}`;

    const refundPayment: Payment = {
      id: txnId,
      receiptNo,
      orderId: order.id,
      clientId: order.clientId,
      amount: Number(refundAmount),
      date: refundDate,
      method: 'cash',
      isRefund: true,
      refundReason,
      notes: `استرجاع مالي: ${refundReason}`,
      createdAt: new Date().toISOString(),
    };

    onSavePayment(refundPayment);
    setIsRefundModalOpen(false);
  };

  // Handle saving new expense
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0 || !expDescription.trim()) return;

    const newExpense: Expense = {
      id: `EXP-${(expenses.length + 1001).toString()}`,
      amount: Number(expAmount),
      date: expDate,
      category: expCategory,
      description: expDescription.trim(),
      method: expMethod,
      notes: expNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveExpense(newExpense);
    setIsAddExpenseOpen(false);
    setExpAmount(0);
    setExpDescription('');
    setExpNotes('');
  };

  // Financial totals
  const totalReceived = payments.filter((p) => !p.isRefund).reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.isRefund).reduce((sum, p) => sum + p.amount, 0);
  const netReceived = totalReceived - totalRefunded;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = netReceived - totalExpenses;

  // Filtered lists
  const filteredPayments = payments.filter((p) => {
    const client = clients.find((c) => c.id === p.clientId);
    const order = orders.find((o) => o.id === p.orderId);
    return (
      p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order && order.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const filteredExpenses = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expenseCategoryLabels[e.category].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Cash Flow Top Mini-Banner */}
      <div className="bg-gradient-to-r from-[#0F2A4A] to-[#1a4473] text-white p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-emerald-400 font-bold block">موقف السيولة والتدفق النقدي الفعلي</span>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight mt-0.5">
              {formatCurrency(netCashFlow)}
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              إجمالي المقبوضات ({formatCurrency(netReceived)}) − إجمالي المصاريف ({formatCurrency(totalExpenses)})
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setIsAddPaymentOpen(true)}
              className="flex-1 sm:flex-initial h-10 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل دفعة (وصل)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex-1 sm:flex-initial h-10 px-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مصروف</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Payments vs Expenses */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'payments'
                ? 'bg-[#0F2A4A] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            سجل المدفوعات والوصولات ({payments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
              activeTab === 'expenses'
                ? 'bg-[#0F2A4A] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            سجل المصاريف ({expenses.length})
          </button>
        </div>

        {activeTab === 'payments' && (
          <button
            type="button"
            onClick={() => setIsRefundModalOpen(true)}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تسجيل استرجاع</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'payments' ? 'البحث برقم الوصل، رقم الطلب، أو اسم العميل...' : 'البحث في المصاريف...'}
          className="w-full h-11 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#0F2A4A] transition-colors"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content depending on Active Tab */}
      {activeTab === 'payments' ? (
        <div className="space-y-3">
          {filteredPayments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">لا توجد عمليات دفع مسجلة</div>
              <p className="text-xs text-slate-400">سجل دفعة جديدة بالضغط على زر تسجيل دفعة أعلاه.</p>
            </div>
          ) : (
            filteredPayments.map((p) => {
              const client = clients.find((c) => c.id === p.clientId);
              const order = orders.find((o) => o.id === p.orderId);

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border p-4 shadow-2xs space-y-3 transition-colors ${
                    p.isRefund ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/90 hover:border-[#0F2A4A]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {p.receiptNo}
                        </span>
                        {p.isRefund ? (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            استرجاع مالي
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            مقبوضات مقبولة
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">{formatDate(p.date)}</span>
                      </div>

                      <div className="text-sm font-bold text-slate-900 mt-1">
                        {client?.name || 'عميل'} · <span className="font-normal text-slate-600">{order?.title || p.orderId}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        طريقة الدفع: {paymentMethodLabels[p.method] || p.method}
                      </div>
                    </div>

                    <div className="text-left">
                      <div
                        className={`text-base sm:text-lg font-black font-mono ${
                          p.isRefund ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {p.isRefund ? `- ${formatCurrency(p.amount)}` : formatCurrency(p.amount)}
                      </div>
                    </div>
                  </div>

                  {p.notes && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                      ملاحظة: {p.notes}
                    </div>
                  )}

                  {/* Print Receipt Action */}
                  {!p.isRefund && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        عملية رقم: <span className="font-mono">{p.id}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => onOpenReceipt(p)}
                        className="px-3.5 py-1.5 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة / معاينة وصل الدفع</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Expenses List */
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">لا توجد مصاريف مسجلة</div>
              <p className="text-xs text-slate-400">يمكنك تسجيل مصاريف النشاط لتتبع التدفق المالي بدقة.</p>
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2 text-right"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {expenseCategoryLabels[exp.category]}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{exp.description}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">
                      التاريخ: {formatDate(exp.date)} · طريقة الدفع: {paymentMethodLabels[exp.method]}
                    </div>
                  </div>

                  <div className="font-mono font-bold text-slate-900 text-base">
                    - {formatCurrency(exp.amount)}
                  </div>
                </div>

                {exp.notes && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                    {exp.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Payment Modal */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#0F2A4A] text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">تسجيل استلام دفعة مالية جديدة وإصدار وصل</span>
              <button
                type="button"
                onClick={() => setIsAddPaymentOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right">
              {/* Order selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الطلب المرتبط *</label>
                <select
                  required
                  value={payOrderId}
                  onChange={(e) => setPayOrderId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
                >
                  <option value="">-- اختر الطلب --</option>
                  {orders.map((o) => {
                    const cl = clients.find((c) => c.id === o.clientId);
                    return (
                      <option key={o.id} value={o.id}>
                        {o.id} — {o.title} ({cl?.name || 'عميل'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Order balance info */}
              {orderFinancials && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>السعر النهائي للطلب:</span>
                    <span className="font-mono font-bold">{formatCurrency(orderFinancials.finalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>المسدد مسبقاً ({orderFinancials.paymentsCount} دفعات):</span>
                    <span className="font-mono font-bold">{formatCurrency(orderFinancials.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-amber-700">
                    <span>المتبقي حالياً:</span>
                    <span className="font-mono">{formatCurrency(orderFinancials.remainingAmount)}</span>
                  </div>
                </div>
              )}

              {/* Amount received */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المستلم في هذه الدفعة (د.ج) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  placeholder="المبلغ بالدينار الجزائري..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold"
                />
                {orderFinancials && payAmount > orderFinancials.remainingAmount && (
                  <div className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>تنبيه: المبلغ المدخل يتجاوز المبلغ المتبقي المستحق ({formatCurrency(orderFinancials.remainingAmount)})!</span>
                  </div>
                )}
              </div>

              {/* Payment Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الدفع الفعلي</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">وقت الدفع</label>
                  <input
                    type="time"
                    value={payTime}
                    onChange={(e) => setPayTime(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة استلام المبلغ</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
                >
                  <option value="baridimob">تحويل عبر بريدي موب (BaridiMob)</option>
                  <option value="cash">دفع نقدًا (Espèces)</option>
                  <option value="bank_transfer">تحويل بنكي / CCP</option>
                  <option value="other">طريقة دفع أخرى</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات على الوصل (اختياري)</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="مثال: تسبيق 50% أو استلام الشطر الثاني عند المراجعة..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>تأكيد تسجيل الدفعة وإصدار الوصل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#0F2A4A] text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">تسجيل مصروف جديد</span>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ المصروف (د.ج) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="50"
                  value={expAmount || ''}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  placeholder="المبلغ المدفوع..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف المصروف</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                >
                  <option value="software">اشتراكات برمجيات وأدوات</option>
                  <option value="internet">إنترنت وباقات اتصالات</option>
                  <option value="marketing">إعلانات وتسويق ممول</option>
                  <option value="printing">طباعة وتغليف ولوازم</option>
                  <option value="supplies">أدوات مكتبية</option>
                  <option value="other">مصاريف أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البيان / الوصف *</label>
                <input
                  type="text"
                  required
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="مثال: باقة 4G للعمل، شراء حبر طابعة..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المصروف</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as PaymentMethod)}
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="cash">نقدًا (Espèces)</option>
                    <option value="baridimob">بريدي موب (BaridiMob)</option>
                    <option value="bank_transfer">تحويل بنكي / CCP</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="ملاحظات حول الفاتورة أو المستلم..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  تسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-rose-900 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">تسجيل استرجاع مالي لعميل</span>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الطلب المعني بالاسترجاع *</label>
                <select
                  required
                  value={refundOrderId}
                  onChange={(e) => setRefundOrderId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المسترجع (د.ج) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  value={refundAmount || ''}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  placeholder="المبلغ المسترجع للعميل..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-rose-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سبب الاسترجاع المالي *</label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="مثال: إلغاء الطلب من قبل العميل، تعديل في نطاق العمل..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الاسترجاع</label>
                <input
                  type="date"
                  required
                  value={refundDate}
                  onChange={(e) => setRefundDate(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  توثيق الاسترجاع المالي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
