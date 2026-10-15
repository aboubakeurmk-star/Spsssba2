import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Printer,
  ChevronLeft,
  X,
  Phone,
  FileText,
  User,
  ArrowRight,
  Send,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Order, Client, ServiceItem, Payment, OrderStatus, OrderPriority } from '../types';
import { formatCurrency, formatDate, getDeadlineStatus, calculateOrderFinancials } from '../utils/calculations';

interface OrdersViewProps {
  orders: Order[];
  clients: Client[];
  services: ServiceItem[];
  payments: Payment[];
  onSaveOrder: (order: Order, initialPayment?: { amount: number; method: any }) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenReceipt: (payment: Payment) => void;
  onOpenNewPayment: (orderId?: string) => void;
  onSelectClient: (client: Client) => void;
  selectedOrderInitial?: Order | null;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  clients,
  services,
  payments,
  onSaveOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onOpenReceipt,
  onOpenNewPayment,
  onSelectClient,
  selectedOrderInitial,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(selectedOrderInitial || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form states for creating/editing order
  const [formClientId, setFormClientId] = useState('');
  const [formServiceIds, setFormServiceIds] = useState<string[]>([]);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [formTotalPrice, setFormTotalPrice] = useState<number>(0);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formPriority, setFormPriority] = useState<OrderPriority>('medium');
  const [formInitialPayment, setFormInitialPayment] = useState<number>(0);
  const [formInitialPaymentMethod, setFormInitialPaymentMethod] = useState<'cash' | 'baridimob' | 'bank_transfer' | 'other'>('baridimob');

  const statusLabels: Record<OrderStatus, { label: string; bg: string; text: string }> = {
    new: { label: 'جديد', bg: 'bg-sky-50', text: 'text-sky-700' },
    in_progress: { label: 'قيد الإنجاز', bg: 'bg-blue-50', text: 'text-blue-700' },
    waiting_info: { label: 'بانتظار معلومات', bg: 'bg-amber-50', text: 'text-amber-700' },
    under_review: { label: 'بانتظار المراجعة', bg: 'bg-purple-50', text: 'text-purple-700' },
    completed: { label: 'مكتمل', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    delivered: { label: 'مسلّم للعميل', bg: 'bg-slate-100', text: 'text-slate-800' },
    cancelled: { label: 'ملغى', bg: 'bg-rose-50', text: 'text-rose-700' },
  };

  const priorityLabels: Record<OrderPriority, { label: string; dot: string }> = {
    low: { label: 'أولوية منخفضة', dot: 'bg-slate-400' },
    medium: { label: 'أولوية عادية', dot: 'bg-blue-500' },
    high: { label: 'أولوية مرتفعة', dot: 'bg-amber-500' },
    urgent: { label: 'عاجل جداً', dot: 'bg-rose-500' },
  };

  // Open modal for new order
  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setFormClientId(clients[0]?.id || '');
    setFormServiceIds([]);
    setFormTitle('');
    setFormDescription('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    // default delivery 7 days later
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    setFormDeliveryDate(futureDate.toISOString().split('T')[0]);
    setFormTotalPrice(0);
    setFormDiscount(0);
    setFormPriority('medium');
    setFormInitialPayment(0);
    setIsAddModalOpen(true);
  };

  // Open modal for editing order
  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setFormClientId(order.clientId);
    setFormServiceIds(order.serviceIds);
    setFormTitle(order.title);
    setFormDescription(order.description || '');
    setFormStartDate(order.startDate);
    setFormDeliveryDate(order.expectedDeliveryDate);
    setFormTotalPrice(order.totalPrice);
    setFormDiscount(order.discount);
    setFormPriority(order.priority);
    setFormInitialPayment(0);
    setIsAddModalOpen(true);
  };

  const handleToggleService = (svcId: string) => {
    if (formServiceIds.includes(svcId)) {
      setFormServiceIds(formServiceIds.filter((id) => id !== svcId));
    } else {
      const updated = [...formServiceIds, svcId];
      setFormServiceIds(updated);
      // Auto suggest price if editing new order
      const svc = services.find((s) => s.id === svcId);
      if (svc && svc.estimatedPrice && !editingOrder) {
        setFormTotalPrice((prev) => prev + (svc.estimatedPrice || 0));
      }
    }
  };

  const handleSaveOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId || !formTitle) return;

    const selectedServiceObjects = services.filter((s) => formServiceIds.includes(s.id));
    const serviceNames = selectedServiceObjects.map((s) => s.name);
    const finalPrice = Math.max(0, formTotalPrice - formDiscount);

    if (editingOrder) {
      const updatedOrder: Order = {
        ...editingOrder,
        clientId: formClientId,
        serviceIds: formServiceIds,
        serviceNames: serviceNames.length > 0 ? serviceNames : ['خدمة عامة'],
        title: formTitle,
        description: formDescription,
        startDate: formStartDate,
        expectedDeliveryDate: formDeliveryDate,
        totalPrice: Number(formTotalPrice),
        discount: Number(formDiscount),
        finalPrice,
        priority: formPriority,
        updatedAt: new Date().toISOString(),
      };
      onSaveOrder(updatedOrder);
      setSelectedOrder(updatedOrder);
    } else {
      const newOrder: Order = {
        id: `ORD-${new Date().getFullYear()}-${(orders.length + 1).toString().padStart(3, '0')}`,
        clientId: formClientId,
        serviceIds: formServiceIds,
        serviceNames: serviceNames.length > 0 ? serviceNames : ['خدمة عامة'],
        title: formTitle,
        description: formDescription,
        registrationDate: new Date().toISOString().split('T')[0],
        startDate: formStartDate,
        expectedDeliveryDate: formDeliveryDate,
        totalPrice: Number(formTotalPrice),
        discount: Number(formDiscount),
        finalPrice,
        status: 'new',
        priority: formPriority,
        timeline: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            type: 'created',
            description: 'تم تسجيل الطلب في النظام',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const initialPay = formInitialPayment > 0 ? {
        amount: Number(formInitialPayment),
        method: formInitialPaymentMethod,
      } : undefined;

      onSaveOrder(newOrder, initialPay);
      setSelectedOrder(newOrder);
    }

    setIsAddModalOpen(false);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    // Search query
    const client = clients.find((c) => c.id === o.clientId);
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client && client.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') {
      const dl = getDeadlineStatus(o.expectedDeliveryDate, o.status);
      return dl.isOverdue;
    }
    if (statusFilter === 'unpaid') {
      const fin = calculateOrderFinancials(o, payments);
      return fin.remainingAmount > 0 && o.status !== 'cancelled';
    }
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Top Controls: Search, Filters & Add Order Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث برقم الطلب، اسم العميل، الهاتف، أو العنوان..."
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

        {/* Add Order Button */}
        <button
          type="button"
          onClick={handleOpenNewOrder}
          className="h-11 px-4 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة طلب جديد</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { id: 'all', label: `الكل (${orders.length})` },
          { id: 'in_progress', label: 'قيد الإنجاز' },
          { id: 'overdue', label: 'متأخرة عن الموعد' },
          { id: 'unpaid', label: 'متبقي عليها مبالغ' },
          { id: 'new', label: 'جديدة' },
          { id: 'completed', label: 'مكتملة' },
          { id: 'delivered', label: 'مسلّمة' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors min-h-[38px] ${
              statusFilter === tab.id
                ? 'bg-[#0F2A4A] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List / Cards (Mobile-first vertical flow) */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">لا توجد طلبات تطابق معايير البحث أو التصفية</div>
          <p className="text-xs text-slate-400">يمكنك إضافة طلب جديد أو تعديل كلمات البحث.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const client = clients.find((c) => c.id === ord.clientId);
            const fin = calculateOrderFinancials(ord, payments);
            const dl = getDeadlineStatus(ord.expectedDeliveryDate, ord.status);
            const st = statusLabels[ord.status];
            const pr = priorityLabels[ord.priority];

            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#0F2A4A] transition-all overflow-hidden"
              >
                {/* Header Strip */}
                <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-800">
                      {ord.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${pr.dot}`} />
                    <span className="text-[11px]">{pr.label}</span>
                  </div>
                </div>

                {/* Main Card Body */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  {/* Title & Service */}
                  <div>
                    <h3
                      onClick={() => setSelectedOrder(ord)}
                      className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {ord.title}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      {ord.serviceNames.join(' · ')}
                    </div>
                  </div>

                  {/* Client & Date Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold truncate">{client?.name || 'عميل'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>تسليم: {formatDate(ord.expectedDeliveryDate)}</span>
                    </div>
                  </div>

                  {/* Deadline Notice if Overdue or Due Today */}
                  {(dl.isOverdue || dl.isDueToday || dl.isDueTomorrow) && (
                    <div
                      className={`text-xs p-2 rounded-lg flex items-center gap-1.5 font-semibold ${
                        dl.isOverdue
                          ? 'bg-rose-50 text-rose-700'
                          : dl.isDueToday
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{dl.label}</span>
                    </div>
                  )}

                  {/* Financial Breakdown Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">السعر النهائي:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(ord.finalPrice)}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-slate-500 block text-[10px]">المتبقي:</span>
                      {fin.remainingAmount > 0 ? (
                        <span className="font-mono font-bold text-amber-600 text-sm">
                          {formatCurrency(fin.remainingAmount)}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>مسدد بالكامل</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (Thumb friendly) */}
                <div className="bg-slate-50 px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(ord)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1"
                  >
                    <span>تفاصيل وسجل الطلب</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {fin.remainingAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenNewPayment(ord.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>تسجيل دفعة</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEditOrder(ord)}
                      title="تعديل الطلب"
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold block">{selectedOrder.id}</span>
                <h3 className="text-sm sm:text-base font-bold">{selectedOrder.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-right">
              {/* Quick Status Updater */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">تحديث حالة الطلب:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newSt = e.target.value as OrderStatus;
                    onUpdateOrderStatus(selectedOrder.id, newSt);
                    setSelectedOrder({ ...selectedOrder, status: newSt });
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="new">جديد</option>
                  <option value="in_progress">قيد الإنجاز</option>
                  <option value="waiting_info">بانتظار معلومات/ملفات</option>
                  <option value="under_review">بانتظار المراجعة</option>
                  <option value="completed">مكتمل</option>
                  <option value="delivered">مسلّم للعميل</option>
                  <option value="cancelled">ملغى</option>
                </select>
              </div>

              {/* Client Profile Box */}
              {(() => {
                const client = clients.find((c) => c.id === selectedOrder.clientId);
                if (!client) return null;
                return (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">العميل المرتبط</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(null);
                          onSelectClient(client);
                        }}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        عرض ملف العميل وكشف الحساب
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{client.name}</div>
                        <div className="text-xs text-slate-500" dir="ltr">{client.phone}</div>
                      </div>
                      {client.phone && (
                        <a
                          href={`https://wa.me/${client.phone.replace(/\D/g, '').replace(/^0/, '213')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Financial Box */}
              {(() => {
                const fin = calculateOrderFinancials(selectedOrder, payments);
                const orderPayments = payments.filter((p) => p.orderId === selectedOrder.id && !p.isRefund);

                return (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">الحالة المالية للطلب</span>
                      {fin.remainingAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(null);
                            onOpenNewPayment(selectedOrder.id);
                          }}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>تسجيل دفعة</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">السعر النهائي</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedOrder.finalPrice)}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">المسدد</span>
                        <span className="font-mono font-bold text-emerald-600">{formatCurrency(fin.totalPaid)}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">المتبقي</span>
                        <span className="font-mono font-bold text-amber-600">{formatCurrency(fin.remainingAmount)}</span>
                      </div>
                    </div>

                    {/* Payments List for this order with receipt button */}
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">دفعات الطلب المسجلة:</span>
                      {orderPayments.length === 0 ? (
                        <div className="text-xs text-slate-400">لم يتم تسجيل أي دفعة لهذا الطلب حتى الآن.</div>
                      ) : (
                        orderPayments.map((p) => (
                          <div key={p.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-mono font-bold text-emerald-700">{formatCurrency(p.amount)}</div>
                              <div className="text-[10px] text-slate-400">رقم الوصل: {p.receiptNo} · {formatDate(p.date)}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => onOpenReceipt(p)}
                              className="px-2.5 py-1 bg-[#0F2A4A] text-white rounded-md text-[11px] font-semibold flex items-center gap-1 hover:bg-[#16365C]"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>طباعة الوصل</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Order Timeline Log (السجل الزمني) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">السجل الزمني للطلب (Timeline)</span>
                <div className="border-r-2 border-slate-200 pr-3 space-y-3">
                  {selectedOrder.timeline.map((event) => (
                    <div key={event.id} className="relative text-xs">
                      <div className="absolute -right-4.5 top-1 w-2.5 h-2.5 rounded-full bg-[#0F2A4A]" />
                      <div className="font-semibold text-slate-800">{event.description}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toLocaleString('ar-DZ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
                    onDeleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }
                }}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الطلب</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#0F2A4A] text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">
                {editingOrder ? `تعديل الطلب (${editingOrder.id})` : 'تسجيل طلب جديد'}
              </span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right">
              {/* Client Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العميل المرتبط *</label>
                <select
                  required
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
                >
                  <option value="">-- اختر العميل --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || c.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Selection (Multi-select) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الخدمات المقدمة في هذا الطلب *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {services.filter((s) => s.isActive).map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        formServiceIds.includes(s.id)
                          ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 font-bold text-[#0F2A4A]'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formServiceIds.includes(s.id)}
                        onChange={() => handleToggleService(s.id)}
                        className="rounded text-[#0F2A4A]"
                      />
                      <span className="truncate">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الطلب / الموضوع *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: تحليل استبيان الحوكمة، أو تنسيق مذكرة تخرج..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                >
                </input>
              </div>

              {/* Description & Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل وملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="عدد الصفحات، حجم العينة، الشروط الخاصة..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">موعد التسليم المتوقع *</label>
                  <input
                    type="date"
                    required
                    value={formDeliveryDate}
                    onChange={(e) => setFormDeliveryDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Pricing & Discount */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">السعر الإجمالي (د.ج)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formTotalPrice}
                    onChange={(e) => setFormTotalPrice(Number(e.target.value))}
                    className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">الخصم (د.ج)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(Number(e.target.value))}
                    className="w-full h-10 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">النهائي بعد الخصم</label>
                  <div className="h-10 px-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-800 flex items-center">
                    {formatCurrency(Math.max(0, formTotalPrice - formDiscount))}
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">درجة الأولوية</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {(['low', 'medium', 'high', 'urgent'] as OrderPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormPriority(p)}
                      className={`py-2 rounded-lg font-semibold border transition-colors ${
                        formPriority === p
                          ? 'bg-[#0F2A4A] text-white border-[#0F2A4A]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {priorityLabels[p].label.replace('أولوية ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Payment (Only for new order) */}
              {!editingOrder && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                  <label className="block text-xs font-bold text-emerald-900">
                    هل استلمت تسبيقاً / دفعة أولى الآن؟ (اختياري)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={formInitialPayment}
                      onChange={(e) => setFormInitialPayment(Number(e.target.value))}
                      placeholder="المبلغ المستلم بالدينار..."
                      className="h-10 px-3 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold"
                    />
                    <select
                      value={formInitialPaymentMethod}
                      onChange={(e) => setFormInitialPaymentMethod(e.target.value as any)}
                      className="h-10 px-2 bg-white border border-emerald-300 rounded-lg text-xs"
                    >
                      <option value="baridimob">بريدي موب (BaridiMob)</option>
                      <option value="cash">نقدًا (Espèces)</option>
                      <option value="bank_transfer">تحويل بنكي / CCP</option>
                      <option value="other">طريقة أخرى</option>
                    </select>
                  </div>
                  {formInitialPayment > 0 && (
                    <div className="text-[11px] text-emerald-800">
                      سيتم إصدار وصل استلام رسمي فوري بمبلغ {formatCurrency(formInitialPayment)}.
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingOrder ? 'حفظ التعديلات' : 'تسجيل الطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
