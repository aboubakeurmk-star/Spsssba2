import React, { useState, useEffect } from 'react';
import {
  loadDatabase,
  saveDatabase,
  clearDemoDataAndStartFresh,
  resetToDemoData,
} from './utils/storage';
import { AppDatabase, Order, Client, Payment, Expense, ServiceItem, AppSettings, OrderStatus } from './types';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { ContactFooter } from './components/ContactFooter';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { ClientsView } from './components/ClientsView';
import { FinanceView } from './components/FinanceView';
import { ReportsView } from './components/ReportsView';
import { CalendarView } from './components/CalendarView';
import { ServicesView } from './components/ServicesView';
import { SettingsView } from './components/SettingsView';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { getDeadlineStatus } from './utils/calculations';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Modals & Active selections
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [selectedClientForView, setSelectedClientForView] = useState<Client | null>(null);
  const [quickPaymentOrderId, setQuickPaymentOrderId] = useState<string | undefined>(undefined);
  const [financeInitialTab, setFinanceInitialTab] = useState<'payments' | 'expenses'>('payments');

  // Sync state to localStorage whenever db changes
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  // Handle Logo Upload
  const handleUploadLogo = (base64: string) => {
    setDb((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        logoDataUrl: base64,
      },
    }));
  };

  const handleRemoveLogo = () => {
    setDb((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        logoDataUrl: undefined,
      },
    }));
  };

  // Order Handlers
  const handleSaveOrder = (order: Order, initialPayment?: { amount: number; method: any }) => {
    setDb((prev) => {
      const exists = prev.orders.some((o) => o.id === order.id);
      let updatedOrders: Order[];
      let updatedPayments = [...prev.payments];

      if (exists) {
        updatedOrders = prev.orders.map((o) => (o.id === order.id ? order : o));
      } else {
        updatedOrders = [order, ...prev.orders];

        // If an initial down payment was received with the new order
        if (initialPayment && initialPayment.amount > 0) {
          const currentYear = new Date().getFullYear();
          const receiptNo = `REC-${currentYear}-${(prev.payments.length + 1).toString().padStart(3, '0')}`;
          const txnId = `TXN-${(prev.payments.length + 1001).toString()}`;
          const newPayment: Payment = {
            id: txnId,
            receiptNo,
            orderId: order.id,
            clientId: order.clientId,
            amount: initialPayment.amount,
            date: order.registrationDate,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            method: initialPayment.method,
            notes: 'دفعة أولى (تسبيق) عند تسجيل الطلب',
            createdAt: new Date().toISOString(),
          };
          updatedPayments = [newPayment, ...updatedPayments];

          // Auto open receipt for this payment
          setTimeout(() => {
            setActiveReceiptPayment(newPayment);
          }, 300);
        }
      }

      return {
        ...prev,
        orders: updatedOrders,
        payments: updatedPayments,
      };
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setDb((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== orderId) return o;
        const statusEvent = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: 'status_change' as const,
          description: `تغيير حالة الطلب إلى: ${newStatus}`,
        };
        return {
          ...o,
          status: newStatus,
          timeline: [...o.timeline, statusEvent],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  const handleDeleteOrder = (orderId: string) => {
    setDb((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== orderId),
      // Keep payments or cascade
      payments: prev.payments.filter((p) => p.orderId !== orderId),
    }));
  };

  // Client Handlers
  const handleSaveClient = (client: Client) => {
    setDb((prev) => {
      const exists = prev.clients.some((c) => c.id === client.id);
      return {
        ...prev,
        clients: exists
          ? prev.clients.map((c) => (c.id === client.id ? client : c))
          : [client, ...prev.clients],
      };
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setDb((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== clientId),
    }));
  };

  // Payment Handlers
  const handleSavePayment = (payment: Payment) => {
    setDb((prev) => {
      // Add payment to payments ledger
      const updatedPayments = [payment, ...prev.payments];

      // Append event to associated order's timeline
      const updatedOrders = prev.orders.map((o) => {
        if (o.id !== payment.orderId) return o;
        const event = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: (payment.isRefund ? 'refund' : 'payment_added') as any,
          description: payment.isRefund
            ? `استرجاع مالي بمبلغ ${payment.amount} د.ج`
            : `تسجيل دفعة مالية بمبلغ ${payment.amount} د.ج (وصل: ${payment.receiptNo})`,
        };
        return {
          ...o,
          timeline: [...o.timeline, event],
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        ...prev,
        payments: updatedPayments,
        orders: updatedOrders,
      };
    });
  };

  // Expense Handlers
  const handleSaveExpense = (expense: Expense) => {
    setDb((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));
  };

  // Service Handlers
  const handleSaveService = (service: ServiceItem) => {
    setDb((prev) => {
      const exists = prev.services.some((s) => s.id === service.id);
      return {
        ...prev,
        services: exists
          ? prev.services.map((s) => (s.id === service.id ? service : s))
          : [...prev.services, service],
      };
    });
  };

  const handleDeleteService = (serviceId: string) => {
    setDb((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== serviceId),
    }));
  };

  const handleToggleServiceActive = (serviceId: string) => {
    setDb((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === serviceId ? { ...s, isActive: !s.isActive } : s)),
    }));
  };

  // Settings Handlers
  const handleSaveSettings = (settings: AppSettings) => {
    setDb((prev) => ({
      ...prev,
      settings,
    }));
  };

  // Demo Data Handlers
  const handleClearDemoData = () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات التجريبية والبدء ببيانات جديدة فارغة؟')) {
      const fresh = clearDemoDataAndStartFresh();
      setDb(fresh);
    }
  };

  const handleResetDemoData = () => {
    if (confirm('هل تريد إعادة شحن البيانات التجريبية للاختبار؟')) {
      const demo = resetToDemoData();
      setDb(demo);
    }
  };

  const handleRestoreBackup = (restoredDb: AppDatabase) => {
    setDb(restoredDb);
    saveDatabase(restoredDb);
  };

  // Overdue count for top badges
  const overdueCount = db.orders.filter((o) => {
    if (o.status === 'completed' || o.status === 'delivered' || o.status === 'cancelled') return false;
    const dl = getDeadlineStatus(o.expectedDeliveryDate, o.status);
    return dl.isOverdue;
  }).length;

  // Selected Order for Receipt preview
  const activeReceiptOrder = activeReceiptPayment
    ? db.orders.find((o) => o.id === activeReceiptPayment.orderId)
    : null;
  const activeReceiptClient = activeReceiptPayment
    ? db.clients.find((c) => c.id === activeReceiptPayment.clientId)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* Top Application Header */}
      <TopHeader
        settings={db.settings}
        orders={db.orders}
        activeView={activeView}
        onNavigate={(v) => {
          setSelectedOrderForView(null);
          setSelectedClientForView(null);
          setActiveView(v);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNewOrder={() => {
          setActiveView('orders');
          setSelectedOrderForView(null);
        }}
        onOpenNewClient={() => {
          setActiveView('clients');
          setSelectedClientForView(null);
        }}
        onOpenNewPayment={() => {
          setActiveView('finance');
          setFinanceInitialTab('payments');
        }}
        onOpenNewExpense={() => {
          setActiveView('finance');
          setFinanceInitialTab('expenses');
        }}
        onUploadLogo={handleUploadLogo}
        onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeView === 'dashboard' && (
          <DashboardView
            orders={db.orders}
            payments={db.payments}
            expenses={db.expenses}
            clients={db.clients}
            services={db.services}
            isDemoData={db.isDemoData}
            onClearDemoData={handleClearDemoData}
            onSelectOrder={(ord) => {
              setSelectedOrderForView(ord);
              setActiveView('orders');
            }}
            onSelectClient={(client) => {
              setSelectedClientForView(client);
              setActiveView('clients');
            }}
            onOpenReceipt={(payment) => setActiveReceiptPayment(payment)}
            onNavigate={(v) => {
              setSelectedOrderForView(null);
              setSelectedClientForView(null);
              setActiveView(v);
            }}
            onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
          />
        )}

        {activeView === 'orders' && (
          <OrdersView
            orders={db.orders}
            clients={db.clients}
            services={db.services}
            payments={db.payments}
            onSaveOrder={handleSaveOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onOpenReceipt={(payment) => setActiveReceiptPayment(payment)}
            onOpenNewPayment={(orderId) => {
              setQuickPaymentOrderId(orderId);
              setActiveView('finance');
            }}
            onSelectClient={(client) => {
              setSelectedClientForView(client);
              setActiveView('clients');
            }}
            selectedOrderInitial={selectedOrderForView}
          />
        )}

        {activeView === 'clients' && (
          <ClientsView
            clients={db.clients}
            orders={db.orders}
            payments={db.payments}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
            onSelectOrder={(ord) => {
              setSelectedOrderForView(ord);
              setActiveView('orders');
            }}
            onOpenReceipt={(payment) => setActiveReceiptPayment(payment)}
            onOpenNewOrderForClient={(clientId) => {
              setActiveView('orders');
            }}
            selectedClientInitial={selectedClientForView}
          />
        )}

        {activeView === 'finance' && (
          <FinanceView
            payments={db.payments}
            expenses={db.expenses}
            orders={db.orders}
            clients={db.clients}
            onSavePayment={handleSavePayment}
            onSaveExpense={handleSaveExpense}
            onOpenReceipt={(payment) => setActiveReceiptPayment(payment)}
            initialOrderIdForPayment={quickPaymentOrderId}
            initialTab={financeInitialTab}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            orders={db.orders}
            payments={db.payments}
            expenses={db.expenses}
            clients={db.clients}
            services={db.services}
            settings={db.settings}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView
            orders={db.orders}
            clients={db.clients}
            onSelectOrder={(ord) => {
              setSelectedOrderForView(ord);
              setActiveView('orders');
            }}
          />
        )}

        {activeView === 'services' && (
          <ServicesView
            services={db.services}
            orders={db.orders}
            onSaveService={handleSaveService}
            onDeleteService={handleDeleteService}
            onToggleServiceActive={handleToggleServiceActive}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            settings={db.settings}
            db={db}
            onSaveSettings={handleSaveSettings}
            onUploadLogo={handleUploadLogo}
            onRemoveLogo={handleRemoveLogo}
            onClearDemoData={handleClearDemoData}
            onResetDemoData={handleResetDemoData}
            onRestoreBackup={handleRestoreBackup}
            onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
          />
        )}
      </main>

      {/* Social Media Contact Footer (Constant at bottom, non-intrusive) */}
      <ContactFooter />

      {/* Mobile Bottom Navigation Bar (Thumb zone) */}
      <BottomNav
        activeView={activeView}
        onNavigate={(v) => {
          setSelectedOrderForView(null);
          setSelectedClientForView(null);
          setActiveView(v);
        }}
        overdueOrdersCount={overdueCount}
      />

      {/* Official Payment Receipt Modal */}
      {activeReceiptPayment && activeReceiptOrder && activeReceiptClient && (
        <PaymentReceiptModal
          payment={activeReceiptPayment}
          order={activeReceiptOrder}
          client={activeReceiptClient}
          allOrderPayments={db.payments.filter((p) => p.orderId === activeReceiptOrder.id)}
          settings={db.settings}
          isOpen={true}
          onClose={() => setActiveReceiptPayment(null)}
          onUploadLogo={handleUploadLogo}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        clients={db.clients}
        orders={db.orders}
        payments={db.payments}
        onSelectOrder={(ord) => {
          setSelectedOrderForView(ord);
          setActiveView('orders');
        }}
        onSelectClient={(client) => {
          setSelectedClientForView(client);
          setActiveView('clients');
        }}
        onOpenReceipt={(payment) => setActiveReceiptPayment(payment)}
      />

      {/* Android 14 APK / WebAPK Installation Center Modal */}
      <AndroidInstallModal
        isOpen={isAndroidInstallOpen}
        onClose={() => setIsAndroidInstallOpen(false)}
      />
    </div>
  );
}
