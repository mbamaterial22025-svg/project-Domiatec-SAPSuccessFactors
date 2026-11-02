import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LockKeyhole, X } from 'lucide-react';

export default function PinModal() {
  const { t, pinModal, setPinModal, verifyAndUnlockAdmin } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (pinModal) {
      setPin('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [pinModal]);

  if (!pinModal) return null;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const result = await verifyAndUnlockAdmin(pin.trim());
    if (!result.success) {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-indigo-600" />
            <span>{t.pinModalTitle}</span>
          </h3>
          <button onClick={() => setPinModal(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{t.pinModalDesc}</p>

        <form onSubmit={handleVerify}>
          <input
            ref={inputRef}
            type="password"
            dir="ltr"
            placeholder="PIN (1234)"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            className="w-full px-3.5 py-2 text-center tracking-widest text-lg font-black border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {error && (
            <p className="text-xs font-bold text-rose-600 mt-1.5 text-center">
              {t.pinError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setPinModal(false)}
              className="px-4 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {t.btnUnlockAdmin}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

