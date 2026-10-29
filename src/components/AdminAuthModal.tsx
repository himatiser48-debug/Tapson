import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, X, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === (correctPin || '1234').trim()) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-slideUp text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">دخول إدارة المتجر</h3>
              <p className="text-[11px] text-slate-300">خاص بمالك المتجر فقط 🔒</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            اللوحة محمية برمز سري لمنع العملاء والزوار من التعديل في الأسعار أو الاطلاع على الفواتير والإحصائيات.
          </p>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>الرمز السري للمدير (PIN):</span>
            </label>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                placeholder="أدخل الرمز السري..."
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full bg-slate-50 border rounded-2xl py-3 px-4 pr-11 text-center font-mono font-black text-lg focus:outline-none focus:bg-white transition ${
                  error
                    ? 'border-rose-400 ring-2 ring-rose-100 text-rose-700'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error ? (
              <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>الرمز السري غير صحيح. الرمز الافتراضي هو <strong>1234</strong></span>
              </p>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-2.5 text-[11px] text-slate-500 flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  الرمز الافتراضي الحالي هو <strong className="font-mono text-emerald-700">1234</strong> (يمكنك تغييره من إعدادات المتجر).
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md transition"
            >
              دخول الإدارة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
