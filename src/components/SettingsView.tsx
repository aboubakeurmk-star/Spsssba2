import React, { useRef, useState } from 'react';
import {
  Settings,
  Upload,
  Download,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AppSettings, AppDatabase } from '../types';
import { OfficialLogo } from './OfficialLogo';
import { exportDatabaseBackup } from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  db: AppDatabase;
  onSaveSettings: (settings: AppSettings) => void;
  onUploadLogo: (base64: string) => void;
  onRemoveLogo: () => void;
  onClearDemoData: () => void;
  onResetDemoData: () => void;
  onRestoreBackup: (db: AppDatabase) => void;
  onOpenAndroidInstall?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  db,
  onSaveSettings,
  onUploadLogo,
  onRemoveLogo,
  onClearDemoData,
  onResetDemoData,
  onRestoreBackup,
  onOpenAndroidInstall,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [brandName, setBrandName] = useState(settings.brandName);
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [facebookAccount, setFacebookAccount] = useState(settings.facebookAccount);
  const [instagramAccount, setInstagramAccount] = useState(settings.instagramAccount);
  const [signatoryTitle, setSignatoryTitle] = useState(settings.signatoryTitle);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUploadLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (parsed.data && parsed.data.orders) {
            onRestoreBackup(parsed.data);
            alert('تم استعادة النسخة الاحتياطية بنجاح!');
          } else if (parsed.orders) {
            onRestoreBackup(parsed);
            alert('تم استعادة النسخة الاحتياطية بنجاح!');
          } else {
            alert('الملف المحدد غير صالح كنسخة احتياطية لتطبيق SPSS SBA.');
          }
        } catch (err) {
          alert('خطأ أثناء قراءة ملف النسخة الاحتياطية.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      brandName,
      brandTagline,
      phone,
      whatsappNumber,
      facebookAccount,
      instagramAccount,
      signatoryTitle,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-8 text-right max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          إعدادات النظام، الشعار، والنسخ الاحتياطي
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          تخصيص الهوية البصرية، بيانات التواصل، وإدارة أمان البيانات وحفظها.
        </p>
      </div>

      {/* 1. Official Logo Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">الشعار الرسمي لـ SPSS SBA</h3>
            <p className="text-xs text-slate-500">
              يظهر هذا الشعار على رأس التطبيق، وفي وصولات الدفع المطبوعة، والتقارير الرسمية.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <OfficialLogo
              logoDataUrl={settings.logoDataUrl}
              size="lg"
              showSubtitle={true}
              isPrintVersion={false}
            />
          </div>

          <div className="space-y-2 text-center sm:text-right flex-1">
            <div className="text-xs text-slate-700">
              {settings.logoDataUrl ? (
                <span className="text-emerald-700 font-bold flex items-center justify-center sm:justify-start gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>تم تعيين شعارك الرسمي المخصص بنجاح</span>
                </span>
              ) : (
                <span className="text-slate-600">
                  يتم حالياً استخدام الرمز الرسمي المعتمد. يمكنك رفع ملف الشعار المرفق (PNG / SVG / JPG).
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>رفع الشعار الرسمي المرفق</span>
              </button>

              {settings.logoDataUrl && (
                <button
                  type="button"
                  onClick={onRemoveLogo}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                >
                  استعادة الرمز الافتراضي
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Android 14 App Installation & APK Management */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">نسخة أندرويد 14 (Android APK / WebAPK)</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                Android 14 Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تثبيت التطبيق مباشرة كحزمة أندرويد مستقلة بكامل الشاشة وشاشة بدء وأيقونة في قائمة التطبيقات.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-[#0F2A4A] text-white p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 block">التثبيت المباشر على الهاتف دون متجر</span>
            <p className="text-[11px] text-slate-300">
              متوافق 100% مع معايير WebAPK لنظام Android 14، ويعمل في وضع عدم الاتصال (Offline) مع حفظ كامل للبيانات.
            </p>
          </div>

          {onOpenAndroidInstall && (
            <button
              type="button"
              onClick={onOpenAndroidInstall}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <Smartphone className="w-4 h-4" />
              <span>فتح مركز تثبيت أندرويد</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Demo Data Control Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">إدارة بيانات الاختبار والتجربة</h3>
            <p className="text-xs text-slate-500">
              التحكم في البيانات النموذجية لضمان عدم اختلاطها ببيانات العمل الحقيقية.
            </p>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              db.isDemoData ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {db.isDemoData ? 'بيئة تجريبية مفعلة' : 'بيئة عمل حقيقية'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-600">
            {db.isDemoData ? (
              <span>
                التطبيق يحتوي حالياً على <strong>بيانات تجريبية</strong> لعملاء وطلبات ومصاريف. عند الاستعداد لبدء العمل الفعلي، يمكنك مسحها بنقرة واحدة.
              </span>
            ) : (
              <span>
                أنت الآن في <strong>وضع البيانات الفعلية</strong>. جميع السجلات المدخلة حقيقية.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClearDemoData}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح كل البيانات والبدء من الصفر</span>
            </button>

            <button
              type="button"
              onClick={onResetDemoData}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>إعادة شحن البيانات التجريبية</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Backup and Restore */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">النسخ الاحتياطي واستعادة البيانات</h3>
          <p className="text-xs text-slate-500">
            يتم تخزين بياناتك بشكل آمن ودائم في متصفحك. يمكنك تنزيل نسخة احتياطية كاملة ونقلها لأي جهاز.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                حفظ ملف يحتوي على كل العملاء، الطلبات، المدفوعات، الوصولات والمصاريف على جهازك.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportDatabaseBackup(db)}
              className="w-full h-10 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل ملف النسخة الاحتياطية</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>استعادة نسخة احتياطية</span>
              </div>
              <p className="text-[11px] text-slate-500">
                استرجاع بيانات سابقة من ملف JSON سبق تصديره من هذا النظام.
              </p>
            </div>
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              className="w-full h-10 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>اختيار ملف النسخة واستعادتها</span>
            </button>
            <input
              ref={backupInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleBackupUpload}
            />
          </div>
        </div>
      </div>

      {/* 4. Activity Details & Social Media */}
      <form onSubmit={handleFormSubmit} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">بيانات النشاط وحسابات التواصل الرسمية</h3>
          <p className="text-xs text-slate-500">
            تطابق هذه البيانات ما يظهر في أسفل التطبيق وعلى وصولات الدفع.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم النشاط</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">الشعار النصي الفرعي</label>
            <input
              type="text"
              value={brandTagline}
              onChange={(e) => setBrandTagline(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الهاتف و WhatsApp (الرسمي)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl font-mono text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">صفحة Facebook الرسمية</label>
            <input
              type="text"
              value={facebookAccount}
              onChange={(e) => setFacebookAccount(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">حساب Instagram الرسمي</label>
            <input
              type="text"
              value={instagramAccount}
              onChange={(e) => setInstagramAccount(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">المسمى المعتمد على الختم في الوصولات</label>
            <input
              type="text"
              value={signatoryTitle}
              onChange={(e) => setSignatoryTitle(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>تم حفظ الإعدادات بنجاح</span>
            </span>
          ) : <span />}

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0F2A4A] hover:bg-[#16365C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
