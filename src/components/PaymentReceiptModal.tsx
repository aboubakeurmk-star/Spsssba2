import React from 'react';
import { Printer, X, Download, Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Payment, Order, Client, AppSettings } from '../types';
import { formatCurrency, formatDate, amountToArabicWords } from '../utils/calculations';
import { OfficialLogo } from './OfficialLogo';

interface PaymentReceiptModalProps {
  payment: Payment;
  order: Order;
  client: Client;
  allOrderPayments: Payment[];
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onUploadLogo?: (base64: string) => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  order,
  client,
  allOrderPayments,
  settings,
  isOpen,
  onClose,
  onUploadLogo,
}) => {
  if (!isOpen) return null;

  // Calculate cumulative payments up to and including THIS payment
  const paymentsUpToThis = allOrderPayments.filter(
    (p) => !p.isRefund && new Date(p.createdAt).getTime() <= new Date(payment.createdAt).getTime()
  );
  const totalPaidUpToThis = paymentsUpToThis.reduce((sum, p) => sum + p.amount, 0);
  const remainingAfterThis = Math.max(0, order.finalPrice - totalPaidUpToThis);
  const isFullyPaidNow = remainingAfterThis === 0 && order.finalPrice > 0;

  const paymentMethodLabels: Record<string, string> = {
    cash: 'دفع نقدًا (Espèces)',
    baridimob: 'تحويل بريدي موب (BaridiMob)',
    bank_transfer: 'تحويل بنكي / CCP',
    other: 'طريقة دفع أخرى',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!client.phone) return;
    const cleanPhone = client.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? `213${cleanPhone.slice(1)}` : cleanPhone;
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته ${client.name}،\n\n` +
      `وصل استلام مبلغ مالي من SPSS SBA\n` +
      `رقم الوصل: ${payment.receiptNo}\n` +
      `رقم الطلب: ${order.id} (${order.title})\n` +
      `المبلغ المستلم: ${formatCurrency(payment.amount)}\n` +
      `تاريخ الدفع: ${formatDate(payment.date)}\n` +
      `المبلغ المتبقي: ${formatCurrency(remainingAfterThis)}\n` +
      `${isFullyPaidNow ? '✅ تم تسديد كامل المبلغ.' : '⏳ جاري متابعة العمل.'}\n\n` +
      `شكراً لثقتكم في SPSS SBA!`
    );
    window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Never Printed) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">معاينة وصل استلام مبلغ مالي</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/40">
              {payment.receiptNo}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {client.phone && (
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="إرسال إشعار الوصل للعميل عبر واتساب"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">إرسال للعميل</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوصل</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-50 printable-area">
          {/* Printable Document Container */}
          <div
            id="official-receipt-print"
            className="w-full bg-white border border-slate-300 rounded-xl p-6 sm:p-8 text-slate-900 shadow-sm print:shadow-none print:border-none print:p-0"
          >
            {/* Header with Official Logo, Title & Official Details */}
            <div className="border-b-2 border-[#0F2A4A] pb-5 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Official Logo */}
                <div>
                  <OfficialLogo
                    logoDataUrl={settings.logoDataUrl}
                    size="lg"
                    showSubtitle={true}
                    allowUpload={true}
                    onLogoUpload={onUploadLogo}
                    isPrintVersion={true}
                  />
                </div>

                {/* Receipt Title Box */}
                <div className="text-center sm:text-left flex flex-col items-center sm:items-end">
                  <div className="inline-block bg-[#0F2A4A] text-white px-4 py-1.5 rounded-lg text-sm font-bold tracking-wide">
                    وصل استلام مبلغ مالي
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5 font-medium">
                    رقم الوصل: <span className="font-mono font-bold text-slate-900">{payment.receiptNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    رقم العملية: <span className="font-mono text-slate-700">{payment.id}</span>
                  </div>
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <span>سيدي بلعباس — الجزائر</span>
                <span>هاتف / واتساب: {settings.phone}</span>
                <span>تاريخ التحرير: {formatDate(payment.date)} {payment.time || ''}</span>
              </div>
            </div>

            {/* Client & Order Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1.5 text-xs">
                <div className="text-slate-500 font-medium">بيانات العميل:</div>
                <div className="text-sm font-bold text-slate-900">{client.name}</div>
                {client.phone && (
                  <div className="text-slate-600">
                    رقم الهاتف: <span className="font-mono font-semibold" dir="ltr">{client.phone}</span>
                  </div>
                )}
                {client.specialty && (
                  <div className="text-slate-600">التخصص: {client.specialty}</div>
                )}
                {client.institution && (
                  <div className="text-slate-600">الجامعة / المؤسسة: {client.institution}</div>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-slate-500 font-medium">بيانات الطلب والخدمة:</div>
                <div className="text-sm font-bold text-slate-900">
                  {order.id} — {order.title}
                </div>
                <div className="text-slate-600">
                  نوع الخدمة: <span className="font-medium text-slate-800">{order.serviceNames.join(' + ')}</span>
                </div>
                <div className="text-slate-600">
                  تاريخ تسجيل الطلب: {formatDate(order.registrationDate)}
                </div>
                <div className="text-slate-600">
                  موعد التسليم المتوقع: {formatDate(order.expectedDeliveryDate)}
                </div>
              </div>
            </div>

            {/* Received Amount Highlight Box */}
            <div className="mb-6 p-5 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/60 text-right">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-900">المبلغ المستلم في هذه الدفعة:</span>
                <span className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="text-xs font-semibold text-emerald-800 border-t border-emerald-200 pt-2">
                المبلغ كتابة: <span className="font-normal text-slate-800">{amountToArabicWords(payment.amount)}</span>
              </div>
              <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                <span>طريقة الدفع:</span>
                <span className="font-semibold text-slate-900">{paymentMethodLabels[payment.method] || payment.method}</span>
              </div>
            </div>

            {/* Financial Ledger Summary Table */}
            <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0F2A4A] text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">البيان المالي</th>
                    <th className="py-2.5 px-3 font-semibold text-left">المبلغ (د.ج)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="py-2 px-3 text-slate-600">السعر الإجمالي للطلب المتفق عليه</td>
                    <td className="py-2 px-3 font-mono text-left">{formatCurrency(order.totalPrice)}</td>
                  </tr>
                  {order.discount > 0 && (
                    <tr className="text-amber-800 bg-amber-50/30">
                      <td className="py-2 px-3">الخصم الممنوح</td>
                      <td className="py-2 px-3 font-mono text-left">- {formatCurrency(order.discount)}</td>
                    </tr>
                  )}
                  <tr className="font-semibold bg-slate-50">
                    <td className="py-2 px-3 text-slate-900">السعر النهائي للطلب بعد الخصم</td>
                    <td className="py-2 px-3 font-mono text-left">{formatCurrency(order.finalPrice)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-700">
                      مجموع ما تم تسديده حتى هذه الدفعة ({paymentsUpToThis.length} دفعات)
                    </td>
                    <td className="py-2 px-3 font-mono text-emerald-700 font-semibold text-left">
                      {formatCurrency(totalPaidUpToThis)}
                    </td>
                  </tr>
                  <tr className={`font-bold ${isFullyPaidNow ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                    <td className="py-2.5 px-3">
                      {isFullyPaidNow ? 'المبلغ المتبقي بذمة العميل' : 'المبلغ المتبقي لتسديد الطلب'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-left text-sm">
                      {formatCurrency(remainingAfterThis)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Notice / Stamp */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-lg border border-slate-200 text-xs">
              {isFullyPaidNow ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>تم تسديد كامل المبلغ المستحق لهذا الطلب.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    هذا الوصل يثبت استلام <strong>المبلغ المستلم في هذه الدفعة فقط</strong> ({formatCurrency(payment.amount)}) وليس كامل قيمة الطلب.
                  </span>
                </div>
              )}

              {payment.notes && (
                <div className="text-slate-500 italic max-w-xs text-left">
                  ملاحظة: {payment.notes}
                </div>
              )}
            </div>

            {/* Signatures & Official Stamp */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
              <div className="text-center space-y-8">
                <span className="font-bold text-slate-800">توقيع العميل / المستلم</span>
                <div className="h-10 border-b border-dashed border-slate-300 w-32 mx-auto" />
              </div>

              <div className="text-center space-y-3">
                <span className="font-bold text-slate-800">ختم وتوقيع الإدارة (SPSS SBA)</span>
                <div className="w-36 h-20 border-2 border-dashed border-[#0F2A4A]/40 rounded-lg mx-auto flex flex-col items-center justify-center bg-slate-50/50">
                  <span className="font-black text-[#0F2A4A] text-xs">SPSS SBA</span>
                  <span className="text-[10px] text-slate-500">سيدي بلعباس</span>
                  <span className="text-[9px] text-emerald-700 font-semibold">وصل مقبوضات معتمد</span>
                </div>
                <div className="text-[10px] text-slate-400">حرر بتاريخ: {formatDate(payment.date)}</div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              يعتبر هذا المستند وصلاً داخلياً لإثبات استلام الدفعة المالية المذكورة أعلاه لنشاط SPSS SBA.
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (no-print) */}
        <div className="no-print bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            يمكنك طباعة هذا الوصل أو إرساله مباشرة للعميل بصيغة رسالة نصية عبر واتساب.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة A4</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
