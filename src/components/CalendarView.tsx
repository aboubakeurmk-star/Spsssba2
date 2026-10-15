import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
} from 'lucide-react';
import { Order, Client } from '../types';
import { formatDate, getDeadlineStatus, formatCurrency } from '../utils/calculations';

interface CalendarViewProps {
  orders: Order[];
  clients: Client[];
  onSelectOrder: (order: Order) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  orders,
  clients,
  onSelectOrder,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayOrders, setSelectedDayOrders] = useState<Order[] | null>(null);
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
    'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayOrders(null);
    setSelectedDayString(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayOrders(null);
    setSelectedDayString(null);
  };

  const today = () => {
    setCurrentDate(new Date());
    setSelectedDayOrders(null);
    setSelectedDayString(null);
  };

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map orders by delivery date
  const ordersByDate = new Map<string, Order[]>();
  for (const o of orders) {
    if (!o.expectedDeliveryDate) continue;
    const existing = ordersByDate.get(o.expectedDeliveryDate) || [];
    existing.push(o);
    ordersByDate.set(o.expectedDeliveryDate, existing);
  }

  // Days array
  const calendarCells: { dayNumber: number | null; dateString: string | null }[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ dayNumber: null, dateString: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    calendarCells.push({ dayNumber: d, dateString: dStr });
  }

  const handleDayClick = (dateStr: string | null) => {
    if (!dateStr) return;
    const dayOrders = ordersByDate.get(dateStr) || [];
    setSelectedDayOrders(dayOrders);
    setSelectedDayString(dateStr);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Calendar Header with navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#0F2A4A]" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={today}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            اليوم
          </button>
          <button
            type="button"
            onClick={prevMonth}
            aria-label="الشهر السابق"
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="الشهر القادم"
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Calendar Grid */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] sm:text-xs text-slate-500 pb-2 border-b border-slate-100">
          {daysOfWeek.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
          {calendarCells.map((cell, idx) => {
            if (!cell.dayNumber || !cell.dateString) {
              return <div key={`empty-${idx}`} className="h-14 sm:h-20 bg-slate-50/40 rounded-xl" />;
            }

            const dayOrders = ordersByDate.get(cell.dateString) || [];
            const isToday =
              new Date().toISOString().split('T')[0] === cell.dateString;
            const isSelected = selectedDayString === cell.dateString;

            const hasOverdue = dayOrders.some((o) => {
              const dl = getDeadlineStatus(o.expectedDeliveryDate, o.status);
              return dl.isOverdue;
            });
            const hasCompleted = dayOrders.some((o) => o.status === 'completed' || o.status === 'delivered');

            return (
              <button
                key={cell.dateString}
                type="button"
                onClick={() => handleDayClick(cell.dateString)}
                className={`h-14 sm:h-20 p-1 rounded-xl border text-right flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 ring-2 ring-[#0F2A4A]/20'
                    : isToday
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : dayOrders.length > 0
                    ? 'border-slate-300 bg-white hover:border-slate-400'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] sm:text-xs font-mono font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center'
                        : 'text-slate-700'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {dayOrders.length > 0 && (
                    <span className="text-[9px] font-bold text-slate-500 hidden sm:inline">
                      {dayOrders.length} طلب
                    </span>
                  )}
                </div>

                {/* Badges / dots on mobile and titles on desktop */}
                {dayOrders.length > 0 && (
                  <div className="w-full flex sm:flex-col gap-1 items-end sm:items-stretch overflow-hidden">
                    <div className="sm:hidden flex items-center gap-0.5 justify-end w-full">
                      {hasOverdue && <span className="w-2 h-2 rounded-full bg-rose-600" />}
                      {!hasOverdue && hasCompleted && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      {!hasOverdue && !hasCompleted && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>

                    <div className="hidden sm:block text-[9px] truncate rounded px-1 font-semibold text-slate-800 bg-slate-100">
                      {dayOrders[0].title}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Drawer */}
      {selectedDayString && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              مواعيد تسليم يوم {formatDate(selectedDayString)} ({selectedDayOrders?.length || 0} طلبات)
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelectedDayOrders(null);
                setSelectedDayString(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              إغلاق
            </button>
          </div>

          {!selectedDayOrders || selectedDayOrders.length === 0 ? (
            <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl text-center">
              لا توجد طلبات مجدولة للتسليم في هذا اليوم.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayOrders.map((ord) => {
                const client = clients.find((c) => c.id === ord.clientId);
                const dl = getDeadlineStatus(ord.expectedDeliveryDate, ord.status);

                return (
                  <div
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-[#0F2A4A] cursor-pointer transition-colors bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{ord.title}</span>
                        <span className="font-mono text-[10px] text-slate-400">({ord.id})</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        العميل: {client?.name || 'عميل'} · {ord.serviceNames[0]}
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="font-mono font-bold text-slate-900">{formatCurrency(ord.finalPrice)}</div>
                      <div className="text-[10px] font-semibold mt-0.5">
                        {dl.isOverdue ? (
                          <span className="text-rose-600">متأخر</span>
                        ) : ord.status === 'completed' || ord.status === 'delivered' ? (
                          <span className="text-emerald-600">مكتمل</span>
                        ) : (
                          <span className="text-blue-600">قيد الإنجاز</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
