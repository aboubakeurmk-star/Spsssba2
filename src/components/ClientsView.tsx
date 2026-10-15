import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Send,
  Calendar,
  FileText,
  CreditCard,
  Printer,
  X,
  Edit2,
  Trash2,
  Plus,
  BookOpen,
  School,
  ExternalLink,
} from 'lucide-react';
import { Client, Order, Payment } from '../types';
import { formatCurrency, formatDate, calculateOrderFinancials } from '../utils/calculations';

interface ClientsViewProps {
  clients: Client[];
  orders: Order[];
  payments: Payment[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onSelectOrder: (order: Order) => void;
  onOpenReceipt: (payment: Payment) => void;
  onOpenNewOrderForClient: (clientId: string) => void;
  selectedClientInitial?: Client | null;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  orders,
  payments,
  onSaveClient,
  onDeleteClient,
  onSelectOrder,
  onOpenReceipt,
  onOpenNewOrderForClient,
  selectedClientInitial,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(selectedClientInitial || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSocial, setFormSocial] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formInstitution, setFormInstitution] = useState('');
  const [formSource, setFormSource] = useState('Facebook');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormName('');
    setFormPhone('');
    setFormSocial('');
    setFormSpecialty('');
    setFormInstitution('');
    setFormSource('Facebook');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormPhone(client.phone);
    setFormSocial(client.socialHandle || '');
    setFormSpecialty(client.specialty || '');
    setFormInstitution(client.institution || '');
    setFormSource(client.source || 'Facebook');
    setFormNotes(client.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingClient) {
      const updated: Client = {
        ...editingClient,
        name: formName.trim(),
        phone: formPhone.trim(),
        socialHandle: formSocial.trim(),
        specialty: formSpecialty.trim(),
        institution: formInstitution.trim(),
        source: formSource,
        notes: formNotes.trim(),
        updatedAt: new Date().toISOString(),
      };
      onSaveClient(updated);
      setSelectedClient(updated);
    } else {
      const newClient: Client = {
        id: `CLI-${(clients.length + 1001).toString()}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        socialHandle: formSocial.trim(),
        specialty: formSpecialty.trim(),
        institution: formInstitution.trim(),
        source: formSource,
        firstContactDate: new Date().toISOString().split('T')[0],
        notes: formNotes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveClient(newClient);
      setSelectedClient(newClient);
    }

    setIsModalOpen(false);
  };

  // Search filter
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.specialty && c.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.institution && c.institution.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Search & Add Client Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالاسم، رقم الهاتف، التخصص، أو الجامعة..."
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

        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-11 px-4 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">لا يوجد عملاء يطابقون البحث</div>
          <p className="text-xs text-slate-400">يمكنك إضافة عميل جديد باستخدام الزر أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredClients.map((client) => {
            const clientOrders = orders.filter((o) => o.clientId === client.id);
            const totalBilled = clientOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.finalPrice : sum), 0);
            const clientPayments = payments.filter((p) => p.clientId === client.id && !p.isRefund);
            const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);
            const remainingDebt = Math.max(0, totalBilled - totalPaid);

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#0F2A4A] transition-all p-4 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3
                        onClick={() => setSelectedClient(client)}
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {client.name}
                      </h3>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {client.id}
                      </span>
                    </div>

                    {client.phone && (
                      <div className="text-xs text-slate-500 font-mono" dir="ltr">
                        {client.phone}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {client.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/\D/g, '').replace(/^0/, '213')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="محادثة واتساب"
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(client)}
                      title="تعديل العميل"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specialty / Institution Tags */}
                {(client.specialty || client.institution) && (
                  <div className="text-xs text-slate-600 flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                    {client.specialty && <span>{client.specialty}</span>}
                    {client.specialty && client.institution && <span>·</span>}
                    {client.institution && <span className="text-slate-500">{client.institution}</span>}
                  </div>
                )}

                {/* Financial Summary Strip for Client */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">الطلبات</span>
                    <span className="font-bold text-slate-800">{clientOrders.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">المسدد</span>
                    <span className="font-mono font-bold text-emerald-600">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">المتبقي</span>
                    <span className={`font-mono font-bold ${remainingDebt > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {formatCurrency(remainingDebt)}
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedClient(client)}
                    className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>كشف حساب وسجل المعاملات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenNewOrderForClient(client.id)}
                    className="px-2.5 py-1 bg-[#0F2A4A] text-white text-xs font-semibold rounded-lg hover:bg-[#16365C] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>طلب جديد</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Client Statement of Account Modal (كشف حساب العميل) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-[#0F2A4A] text-white p-4 sm:p-5 flex items-center justify-between gap-2">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-bold">{selectedClient.id}</span>
                <h3 className="text-base sm:text-lg font-bold">كشف حساب العميل: {selectedClient.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-right">
              {/* Client Profile Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 mb-0.5">رقم الهاتف:</div>
                  <div className="font-mono font-bold text-slate-900 text-sm" dir="ltr">
                    {selectedClient.phone || 'غير مسجل'}
                  </div>
                  {selectedClient.socialHandle && (
                    <div className="text-slate-600 mt-1">حساب التواصل: {selectedClient.socialHandle}</div>
                  )}
                </div>

                <div>
                  {selectedClient.specialty && (
                    <div className="text-slate-600">التخصص: <strong className="text-slate-900">{selectedClient.specialty}</strong></div>
                  )}
                  {selectedClient.institution && (
                    <div className="text-slate-600 mt-1">المؤسسة: {selectedClient.institution}</div>
                  )}
                  <div className="text-slate-400 mt-1">مصدر العميل: {selectedClient.source || 'Facebook'}</div>
                </div>
              </div>

              {/* Financial Balance Summary */}
              {(() => {
                const cOrders = orders.filter((o) => o.clientId === selectedClient.id);
                const totalBilled = cOrders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.finalPrice : sum), 0);
                const cPayments = payments.filter((p) => p.clientId === selectedClient.id && !p.isRefund);
                const totalPaid = cPayments.reduce((sum, p) => sum + p.amount, 0);
                const remaining = Math.max(0, totalBilled - totalPaid);

                return (
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">إجمالي المعاملات</span>
                      <span className="font-mono font-black text-slate-900 text-sm sm:text-base">
                        {formatCurrency(totalBilled)}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">إجمالي المسدد</span>
                      <span className="font-mono font-black text-emerald-600 text-sm sm:text-base">
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block">المبلغ المتبقي بذمته</span>
                      <span className={`font-mono font-black text-sm sm:text-base ${remaining > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Client Orders History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">سجل طلبات العميل</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const cId = selectedClient.id;
                      setSelectedClient(null);
                      onOpenNewOrderForClient(cId);
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    + إضافة طلب جديد
                  </button>
                </div>

                {orders.filter((o) => o.clientId === selectedClient.id).length === 0 ? (
                  <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl text-center">
                    لا توجد طلبات مسجلة لهذا العميل حتى الآن.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders
                      .filter((o) => o.clientId === selectedClient.id)
                      .map((ord) => {
                        const fin = calculateOrderFinancials(ord, payments);
                        return (
                          <div
                            key={ord.id}
                            onClick={() => {
                              setSelectedClient(null);
                              onSelectOrder(ord);
                            }}
                            className="p-3 rounded-xl border border-slate-200 hover:border-[#0F2A4A] cursor-pointer transition-colors bg-white flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{ord.title}</div>
                              <div className="text-[10px] text-slate-500">
                                {ord.id} · تاريخ البدء: {formatDate(ord.startDate)} · تسليم: {formatDate(ord.expectedDeliveryDate)}
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
              </div>

              {/* Client Payments History with Receipt Print */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900">سجل المدفوعات والوصولات للعميل</h4>
                {payments.filter((p) => p.clientId === selectedClient.id && !p.isRefund).length === 0 ? (
                  <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl text-center">
                    لم تسجل أي دفعات مالية لهذا العميل حتى الآن.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payments
                      .filter((p) => p.clientId === selectedClient.id && !p.isRefund)
                      .map((pay) => (
                        <div
                          key={pay.id}
                          className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-mono font-bold text-emerald-700">{formatCurrency(pay.amount)}</div>
                            <div className="text-[10px] text-slate-500">
                              رقم الوصل: <strong className="text-slate-800">{pay.receiptNo}</strong> · {formatDate(pay.date)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(pay)}
                            className="px-3 py-1.5 bg-[#0F2A4A] text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-[#16365C] transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة وصل الدفع</span>
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
                    onDeleteClient(selectedClient.id);
                    setSelectedClient(null);
                  }
                }}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف العميل</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#0F2A4A] text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">
                {editingClient ? `تعديل بيانات العميل (${editingClient.id})` : 'إضافة عميل جديد'}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل للعميل *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: محمد بوعلام..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (واتساب) *</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="مثال: 0655652572 أو 0550123456"
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حساب Facebook / Instagram</label>
                  <input
                    type="text"
                    value={formSocial}
                    onChange={(e) => setFormSocial(e.target.value)}
                    placeholder="اسم المستخدم..."
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مصدر العميل</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="إحالة وتوصية">إحالة وتوصية</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التخصص الأكاديمي</label>
                <input
                  type="text"
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  placeholder="مثال: علوم اقتصادية، علم النفس، بيولوجيا..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الجامعة أو الكلية أو المؤسسة</label>
                <input
                  type="text"
                  value={formInstitution}
                  onChange={(e) => setFormInstitution(e.target.value)}
                  placeholder="مثال: جامعة جيلالي ليابس - سيدي بلعباس"
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظات حول متطلبات العميل وتاريخ التواصل..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
