import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Tag,
  DollarSign,
  FileText,
} from 'lucide-react';
import { ServiceItem, Order } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ServicesViewProps {
  services: ServiceItem[];
  orders: Order[];
  onSaveService: (service: ServiceItem) => void;
  onDeleteService: (serviceId: string) => void;
  onToggleServiceActive: (serviceId: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  orders,
  onSaveService,
  onDeleteService,
  onToggleServiceActive,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('أكاديمي وبحث علمي');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormName('');
    setFormDescription('');
    setFormCategory('أكاديمي وبحث علمي');
    setFormPrice(0);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingService(svc);
    setFormName(svc.name);
    setFormDescription(svc.description || '');
    setFormCategory(svc.category);
    setFormPrice(svc.estimatedPrice || 0);
    setFormIsActive(svc.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingService) {
      const updated: ServiceItem = {
        ...editingService,
        name: formName.trim(),
        description: formDescription.trim(),
        category: formCategory,
        estimatedPrice: formPrice > 0 ? Number(formPrice) : undefined,
        isActive: formIsActive,
        updatedAt: new Date().toISOString(),
      };
      onSaveService(updated);
    } else {
      const newSvc: ServiceItem = {
        id: `SRV-${(services.length + 1).toString().padStart(2, '0')}`,
        name: formName.trim(),
        description: formDescription.trim(),
        category: formCategory,
        estimatedPrice: formPrice > 0 ? Number(formPrice) : undefined,
        isActive: formIsActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveService(newSvc);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Top Header & Add Service */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            دليل الخدمات الأكاديمية والإحصائية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة وتخصيص أسعار وخدمات SPSS SBA مع إمكانية تحديد سعر مخصص لكل طلب.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-10 px-4 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة جديدة</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map((svc) => {
          const usedInOrders = orders.filter((o) => o.serviceIds.includes(svc.id)).length;

          return (
            <div
              key={svc.id}
              className={`bg-white rounded-2xl border p-4 shadow-2xs space-y-3 transition-colors ${
                svc.isActive ? 'border-slate-200/90 hover:border-[#0F2A4A]' : 'border-slate-200 bg-slate-50/60 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {svc.id}
                    </span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {svc.category}
                    </span>
                    {!svc.isActive && (
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                        معطلة مؤقتاً
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">{svc.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleServiceActive(svc.id)}
                    title={svc.isActive ? 'تعطيل الخدمة' : 'تفعيل الخدمة'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      svc.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {svc.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(svc)}
                    title="تعديل الخدمة"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {svc.description && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {svc.description}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">السعر التقديري الاسترشادي:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {svc.estimatedPrice ? formatCurrency(svc.estimatedPrice) : 'حسب الاتفاق'}
                  </span>
                </div>

                <div className="text-left text-slate-500 font-medium text-[11px]">
                  مستخدمة في {usedInOrders} طلبات
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#0F2A4A] text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">
                {editingService ? `تعديل خدمة (${editingService.id})` : 'إضافة خدمة جديدة'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخدمة *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: تحليل استبيان باستخدام SPSS..."
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تصنيف الخدمة</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                >
                  <option value="أكاديمي وبحث علمي">أكاديمي وبحث علمي</option>
                  <option value="إحصاء وتحليل بيانات">إحصاء وتحليل بيانات</option>
                  <option value="تصميم وهوية مهنية">تصميم وهوية مهنية</option>
                  <option value="تصميم وعروض">تصميم وعروض</option>
                  <option value="خدمات إدارية وتسجيل">خدمات إدارية وتسجيل</option>
                  <option value="تدقيق وتنسيق">تدقيق وتنسيق</option>
                  <option value="خدمات أخرى">خدمات أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">السعر التقديري الاسترشادي (د.ج)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formPrice || ''}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  placeholder="سعر تقديري (يمكن تغييره في كل طلب)"
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وصف الخدمة ونطاق العمل</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="معايير الإنجاز، الملفات المسلمة..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-[#0F2A4A] w-4 h-4"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                  الخدمة مفعلة ومتاحة للطلب
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
