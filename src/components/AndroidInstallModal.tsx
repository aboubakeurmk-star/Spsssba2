import React from 'react';
import {
  Smartphone,
  Download,
  CheckCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install, isAndroid, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-right">
        {/* Header */}
        <div className="bg-[#0F2A4A] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                تثبيت نسخة التطبيق على أندرويد (متوافقة مع Android 14)
              </h3>
              <p className="text-[11px] text-slate-300">
                WebAPK / تطبيق مثبت متكامل يعمل دون متصفح ودون إنترنت
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Status Badge */}
          {isInstalled ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>التطبيق مثبت بالفعل على جهازك!</strong> يعمل حالياً في وضع مستقل (Standalone) بكامل المزايا.
              </span>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 rounded-2xl text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>تثبيت فوري ومباشر على الهاتف</span>
                </span>
                <span className="bg-emerald-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                  Android 14 Ready
                </span>
              </div>

              <p className="text-slate-700 leading-relaxed">
                في نظام <strong>Android 14</strong>، يقوم محرك <strong>WebAPK</strong> المدمج من Google بتوليد حزمة تطبيق حقيقية وتثبيتها مباشرة في قائمة تطبيقات هاتفك، دون الحاجة لتحميل ملفات APK مجهولة المصدر أو تفعيل خيارات الأمان المعقدة.
              </p>

              {/* Install Trigger Button */}
              {isInstallable ? (
                <button
                  type="button"
                  onClick={async () => {
                    const success = await install();
                    if (success) onClose();
                  }}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>اضغط هنا لتثبيت التطبيق على هاتف أندرويد الآن</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  إذا لم يظهر زر التثبيت التلقائي أعلاه في متصفحك الحالي، يمكنك التثبيت في ثوانٍ عبر الخطوات البسيطة أدناه.
                </div>
              )}
            </div>
          )}

          {/* Features Comparison */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800">مزايا النسخة المثبتة على أندرويد 14:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>أيقونة خاصة في شاشة الهاتف الرئيسية</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>واجهة كاملة الشاشة بدون شريط المتصفح</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>يعمل بدون إنترنت (Offline Caching)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>شاشة بدء (Splash Screen) رسمية لـ SPSS SBA</span>
              </div>
            </div>
          </div>

          {/* Manual Steps for Android 14 */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800">
              خطوات التثبيت اليدوي على متصفح Chrome أو Samsung Internet في أندرويد 14:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
              <li>
                افتح رابط التطبيق في متصفح <strong>Google Chrome</strong> على هاتفك الأندرويد.
              </li>
              <li>
                اضغط على زر القائمة (<strong>الثلاث نقاط ⋮</strong>) في أعلى أو أسفل المتصفح.
              </li>
              <li>
                اختر <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home screen)</strong>.
              </li>
              <li>
                اضغط على <strong>«تثبيت» (Install)</strong> لتأكيد العملية؛ سيقوم أندرويد 14 فورًا بتثبيت التطبيق رسميًا.
              </li>
            </ol>
          </div>

          {/* Technical Note about Packaging into Raw .APK */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>ملاحظة للمطورين وتوليد ملف APK خام:</span>
            </div>
            <p>
              التطبيق مهيأ بملف <code>manifest.webmanifest</code> ورموز Maskable بمقاسات 192 و 512 بكسل كاملة المعايير. لتحويل التطبيق إلى ملف <code>.apk</code> خام جاهز للرفع على Google Play أو المشاركة اليدوية، يمكنك إدخال رابط هذا التطبيق مباشرة في أداة <strong>PWABuilder</strong> الرسمية من Microsoft أو أداة <strong>Bubblewrap CLI</strong> من Google لتنزيل ملف APK فوري.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            متوافق مع أندرويد 14 وكافة هواتف سامسونج، شاومي، وهواوي
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
