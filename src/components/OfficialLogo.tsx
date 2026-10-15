import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface OfficialLogoProps {
  logoDataUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  allowUpload?: boolean;
  onLogoUpload?: (base64: string) => void;
  className?: string;
  isPrintVersion?: boolean;
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  logoDataUrl,
  size = 'md',
  showSubtitle = true,
  allowUpload = false,
  onLogoUpload,
  className = '',
  isPrintVersion = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLogoUpload) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onLogoUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const dimensions = {
    sm: { img: 'h-8', text: 'text-sm', sub: 'text-[10px]' },
    md: { img: 'h-11', text: 'text-base font-bold', sub: 'text-xs' },
    lg: { img: 'h-16', text: 'text-xl font-extrabold', sub: 'text-sm' },
    xl: { img: 'h-20', text: 'text-2xl font-black', sub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {logoDataUrl ? (
        <div className="relative group shrink-0">
          <img
            src={logoDataUrl}
            alt="شعار SPSS SBA الرسمي"
            className={`${dimensions.img} w-auto object-contain transition-transform`}
          />
          {allowUpload && onLogoUpload && !isPrintVersion && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="تغيير الشعار الرسمي"
              aria-label="تغيير الشعار الرسمي"
              className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative group shrink-0">
          {/* Official Emblem Representation with Navy, Emerald & Cyan */}
          <div
            className={`${
              size === 'sm' ? 'w-8 h-8 text-[10px]' : size === 'md' ? 'w-11 h-11 text-xs' : size === 'lg' ? 'w-16 h-16 text-sm' : 'w-20 h-20 text-base'
            } rounded-xl bg-gradient-to-br from-[#0F2A4A] via-[#16365C] to-[#0A1D33] text-white flex flex-col items-center justify-center shadow-sm border border-emerald-500/30 select-none overflow-hidden relative`}
          >
            <div className="font-black tracking-tight text-white flex items-center gap-0.5">
              <span className="text-emerald-400">SPSS</span>
            </div>
            <span className="text-[8px] font-bold text-sky-300 tracking-wider">SBA</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500/20 rounded-full blur-xs" />
          </div>

          {allowUpload && onLogoUpload && !isPrintVersion && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="رفع الشعار الرسمي الخاص بك"
              aria-label="رفع الشعار الرسمي"
              className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow hover:bg-emerald-700 transition-colors"
            >
              <Upload className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      )}

      {showSubtitle && (
        <div className="flex flex-col text-right leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${isPrintVersion ? 'text-slate-900' : 'text-slate-900'} ${dimensions.text}`}>
              SPSS <span className="text-emerald-600 font-extrabold">SBA</span>
            </span>
          </div>
          <span className={`${dimensions.sub} text-slate-500 font-medium`}>
            خدمات أكاديمية وإحصائية وتصميمية
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/svg+xml, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
