import React, { useState } from 'react';
import { Search, Bell, Plus, FileText, UserPlus, CreditCard, DollarSign, Calendar as CalendarIcon, Settings as SettingsIcon, Smartphone } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import { AppSettings, Order } from '../types';
import { getDeadlineStatus } from '../utils/calculations';

interface TopHeaderProps {
  settings: AppSettings;
  orders: Order[];
  onOpenSearch: () => void;
  onOpenNewOrder: () => void;
  onOpenNewClient: () => void;
  onOpenNewPayment: () => void;
  onOpenNewExpense: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
  onUploadLogo?: (base64: string) => void;
  onOpenAndroidInstall: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  settings,
  orders,
  onOpenSearch,
  onOpenNewOrder,
  onOpenNewClient,
  onOpenNewPayment,
  onOpenNewExpense,
  onNavigate,
  activeView,
  onUploadLogo,
  onOpenAndroidInstall,
}) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Calculate overdue orders
  const overdueOrders = orders.filter((o) => {
    if (o.status === 'completed' || o.status === 'delivered' || o.status === 'cancelled') return false;
    const dl = getDeadlineStatus(o.expectedDeliveryDate, o.status);
    return dl.isOverdue;
  });

  return (
    <header className="top-header sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand & Logo Zone */}
        <div className="flex items-center gap-3">
          <OfficialLogo
            logoDataUrl={settings.logoDataUrl}
            size="sm"
            showSubtitle={true}
            allowUpload={true}
            onLogoUpload={onUploadLogo}
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'dashboard' ? 'bg-[#0F2A4A] text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            لوحة التحكم
          </button>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'orders' ? 'bg-[#0F2A4A] text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            الطلبات
          </button>
          <button
            type="button"
            onClick={() => onNavigate('clients')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'clients' ? 'bg-[#0F2A4A] text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            العملاء
          </button>
          <button
            type="button"
            onClick={() => onNavigate('finance')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'finance' ? 'bg-[#0F2A4A] text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            المدفوعات والمصاريف
          </button>
          <button
            type="button"
            onClick={() => onNavigate('calendar')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'calendar' ? 'bg-[#0F2A4A] text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            التقويم
          </button>
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'reports' ? 'bg-[#0F2A4A] text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            التقارير
          </button>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'services' ? 'bg-[#0F2A4A] text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            الخدمات
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'settings' ? 'bg-[#0F2A4A] text-white' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            الإعدادات
          </button>
        </nav>

        {/* Actions Zone: Search + Notifications + Quick Add + Android Install */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
          {/* Android 14 App Install Button */}
          <button
            type="button"
            onClick={onOpenAndroidInstall}
            title="تثبيت التطبيق على هاتف أندرويد (متوافق مع أندرويد 14)"
            className="h-9 sm:h-10 px-2.5 sm:px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">نسخة أندرويد 14</span>
          </button>

          {/* Global Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="البحث السريع"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Overdue Alerts Button */}
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            title={overdueOrders.length > 0 ? `يوجد ${overdueOrders.length} طلبات متأخرة عن موعد التسليم` : 'لا توجد طلبات متأخرة'}
            aria-label="تنبيهات المواعيد"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {overdueOrders.length > 0 && (
              <span className="absolute top-1.5 left-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {overdueOrders.length}
              </span>
            )}
          </button>

          {/* Quick Add CTA Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="h-9 sm:h-10 px-3 sm:px-4 bg-[#0F2A4A] hover:bg-[#16365C] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">إضافة</span>
            </button>

            {/* Quick Add Dropdown Modal */}
            {isQuickAddOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsQuickAddOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-right animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      onOpenNewOrder();
                    }}
                    className="w-full px-3 py-2.5 text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>إضافة طلب جديد</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      onOpenNewPayment();
                    }}
                    className="w-full px-3 py-2.5 text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>تسجيل دفعة مالية (وصل)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      onOpenNewClient();
                    }}
                    className="w-full px-3 py-2.5 text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-purple-600" />
                    <span>إضافة عميل جديد</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddOpen(false);
                      onOpenNewExpense();
                    }}
                    className="w-full px-3 py-2.5 text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <DollarSign className="w-4 h-4 text-amber-600" />
                    <span>تسجيل مصروف نشاط</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
