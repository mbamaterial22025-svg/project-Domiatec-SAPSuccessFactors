import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SlidersHorizontal, X } from 'lucide-react';

export default function SettingsModal() {
  const { t, role, project, adminPin, settingsModal, setSettingsModal, saveSettings } = useApp();

  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [wipLimit, setWipLimit] = useState(15);
  const [pin, setPin] = useState('1234');

  useEffect(() => {
    if (settingsModal) {
      setTitleAr(project.titleAr || '');
      setTitleEn(project.titleEn || '');
      setWipLimit(project.wipLimit || 15);
      setPin(adminPin || '1234');
    }
  }, [settingsModal, project, adminPin]);

  if (!settingsModal || role !== 'admin') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings({
      titleAr: titleAr.trim() || project.titleAr,
      titleEn: titleEn.trim() || project.titleEn,
      wipLimit: Number(wipLimit) || 15,
      adminPin: pin.trim() || '1234'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            <span>{t.settingsModalTitle}</span>
          </h3>
          <button
            onClick={() => setSettingsModal(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblProjTitleAr}</label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblProjTitleEn}</label>
            <input
              type="text"
              dir="ltr"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblWipLimit}</label>
              <input
                type="number"
                min="1"
                max="200"
                value={wipLimit}
                onChange={(e) => setWipLimit(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblAdminPin}</label>
              <input
                type="text"
                maxLength="8"
                dir="ltr"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSettingsModal(false)}
              className="px-4 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {t.btnSaveSettings}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

