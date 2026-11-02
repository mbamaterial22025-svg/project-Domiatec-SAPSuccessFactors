import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw } from 'lucide-react';

export default function ResetModal() {
  const { t, role, resetModal, setResetModal, resetData } = useApp();

  if (!resetModal || role !== 'admin') return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-600">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">{t.resetModalTitle}</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{t.resetModalDesc}</p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setResetModal(false)}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            {t.btnCancel}
          </button>
          <button
            onClick={resetData}
            className="px-4 py-1.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white"
          >
            {t.btnConfirmReset}
          </button>
        </div>
      </div>
    </div>
  );
}

