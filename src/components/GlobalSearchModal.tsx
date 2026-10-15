import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  User,
  FileText,
  CreditCard,
  Printer,
  ChevronLeft,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Client, Order, Payment } from '../types';
import { formatCurrency, formatDate, getDeadlineStatus, calculateOrderFinancials } from '../utils/calculations';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  orders: Order[];
  payments: Payment[];
  onSelectOrder: (order: Order) => void;
  onSelectClient: (client: Client) => void;
  onOpenReceipt: (payment: Payment) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  clients,
  orders,
  payments,
  onSelectOrder,
  onSelectClient,
  onOpenReceipt,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'orders' | 'clients' | 'payments'>('all');

  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        matchedClients: [],
        matchedOrders: [],
        matchedPayments: [],
      };
    }

    const q = query.trim().toLowerCase();

    const matchedClients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.specialty && c.specialty.toLowerCase().includes(q))
    );

    const matchedOrders = orders.filter((o) => {
      const client = clients.find((c) => c.id === o.clientId);
      return (
        o.id.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.serviceNames.some((s) => s.toLowerCase().includes(q)) ||
        (client && client.name.toLowerCase().includes(q)) ||
        (client && client.phone.includes(q))
      );
    });

    const matchedPayments = payments.filter((p) => {
      const client = clients.find((c) => c.id === p.clientId);
      return (
        p.receiptNo.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        (client && client.name.toLowerCase().includes(q))
      );
    });

    return { matchedClients, matchedOrders, matchedPayments };
  }, [query, clients, orders, payments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-16">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن عميل، رقم هاتف، رقم طلب، أو رقم وصل (REC-...)..."
            className="flex-1 h-10 bg-transparent text-sm sm:text-base outline-hidden text-right"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            إلغاء
          </button>
        </div>

        {/* Filter categories tabs */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filterType === 'all' ? 'bg-[#0F2A4A] text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => setFilterType('orders')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filterType === 'orders' ? 'bg-[#0F2A4A] text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            الطلبات ({results.matchedOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('clients')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filterType === 'clients' ? 'bg-[#0F2A4A] text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            العملاء ({results.matchedClients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('payments')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filterType === 'payments' ? 'bg-[#0F2A4A] text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            الوصولات ({results.matchedPayments.length})
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 text-right">
          {!query.trim() ? (
            <div className="py-12 text-center text-xs text-slate-400">
              اكتب للبحث السريع في قاعدة بيانات SPSS SBA (العملاء، المذكرات والتحليلات، الوصولات، وأرقام الهواتف).
            </div>
          ) : results.matchedOrders.length === 0 &&
            results.matchedClients.length === 0 &&
            results.matchedPayments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              لم يتم العثور على أي نتائج مطابقة لـ "{query}".
            </div>
          ) : (
            <>
              {/* Orders results */}
              {(filterType === 'all' || filterType === 'orders') && results.matchedOrders.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">الطلبات المطابقة:</span>
                  {results.matchedOrders.map((ord) => {
                    const client = clients.find((c) => c.id === ord.clientId);
                    const fin = calculateOrderFinancials(ord, payments);

                    return (
                      <div
                        key={ord.id}
                        onClick={() => {
                          onClose();
                          onSelectOrder(ord);
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-[#0F2A4A] bg-slate-50 hover:bg-white cursor-pointer transition-all flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>{ord.title}</span>
                            <span className="font-mono text-slate-400 text-[10px]">({ord.id})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            العميل: {client?.name || 'عميل'} · {ord.serviceNames.join(' + ')}
                          </div>
                        </div>

                        <div className="text-left font-mono">
                          <div className="font-bold text-slate-900">{formatCurrency(ord.finalPrice)}</div>
                          <div className="text-[10px] text-slate-500">
                            {fin.remainingAmount > 0 ? (
                              <span className="text-amber-600">متبقي: {formatCurrency(fin.remainingAmount)}</span>
                            ) : (
                              <span className="text-emerald-600">مسدد</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Clients results */}
              {(filterType === 'all' || filterType === 'clients') && results.matchedClients.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">العملاء المطابقون:</span>
                  {results.matchedClients.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onClose();
                        onSelectClient(c);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-[#0F2A4A] bg-slate-50 hover:bg-white cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono" dir="ltr">
                            {c.phone || c.id}
                          </div>
                        </div>
                      </div>

                      <div className="text-left text-slate-500 text-[11px]">
                        {c.specialty || 'تخصص عام'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payments / Receipts results */}
              {(filterType === 'all' || filterType === 'payments') && results.matchedPayments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">الوصولات والمدفوعات:</span>
                  {results.matchedPayments.map((p) => {
                    const client = clients.find((c) => c.id === p.clientId);

                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#0F2A4A]">{p.receiptNo}</span>
                            <span className="text-slate-400 font-mono text-[10px]">({formatDate(p.date)})</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            العميل: {client?.name || 'عميل'} · العملية: {p.id}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-emerald-700">{formatCurrency(p.amount)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenReceipt(p);
                            }}
                            className="px-2.5 py-1 bg-[#0F2A4A] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>عرض الوصل</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
