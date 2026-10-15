import React, { useState } from 'react';
import { LayoutDashboard, FileText, Users, Wallet, MoreHorizontal, Calendar, BarChart3, Wrench, Settings, X } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  overdueOrdersCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onNavigate,
  overdueOrdersCount,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'orders', label: 'الطلبات', icon: FileText, badge: overdueOrdersCount > 0 ? overdueOrdersCount : undefined },
    { id: 'clients', label: 'العملاء', icon: Users },
    { id: 'finance', label: 'المالية', icon: Wallet },
  ];

  const handleSelectMore = (view: string) => {
    setIsMoreMenuOpen(false);
    onNavigate(view);
  };

  const isMoreActive = ['reports', 'calendar', 'services', 'settings'].includes(activeView);

  return (
    <>
      {/* More Bottom Sheet Drawer */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl border-t border-slate-200 p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">الأقسام الإضافية</span>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-right">
              <button
                type="button"
                onClick={() => handleSelectMore('reports')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  activeView === 'reports'
                    ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 text-[#0F2A4A] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-right">
                  <div className="text-xs font-bold">التقارير المالية</div>
                  <div className="text-[10px] text-slate-500">تقارير شهرية وسنوية</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMore('calendar')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  activeView === 'calendar'
                    ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 text-[#0F2A4A] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-right">
                  <div className="text-xs font-bold">تقويم المواعيد</div>
                  <div className="text-[10px] text-slate-500">مواعيد التسليم</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMore('services')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  activeView === 'services'
                    ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 text-[#0F2A4A] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Wrench className="w-5 h-5 text-purple-600 shrink-0" />
                <div className="text-right">
                  <div className="text-xs font-bold">إدارة الخدمات</div>
                  <div className="text-[10px] text-slate-500">قائمة الأسعار والخدمات</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMore('settings')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  activeView === 'settings'
                    ? 'border-[#0F2A4A] bg-[#0F2A4A]/5 text-[#0F2A4A] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Settings className="w-5 h-5 text-slate-600 shrink-0" />
                <div className="text-right">
                  <div className="text-xs font-bold">الإعدادات والنسخ</div>
                  <div className="text-[10px] text-slate-500">الشعار والنسخ الاحتياطي</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg no-print">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onNavigate(tab.id);
                }}
                className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0F2A4A]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold text-[#0F2A4A]' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-5 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              isMoreActive || isMoreMenuOpen ? 'text-[#0F2A4A]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-[10px] mt-1 font-medium ${isMoreActive ? 'font-bold text-[#0F2A4A]' : 'text-slate-500'}`}>
              المزيد
            </span>
            {isMoreActive && (
              <span className="absolute bottom-1 w-5 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
