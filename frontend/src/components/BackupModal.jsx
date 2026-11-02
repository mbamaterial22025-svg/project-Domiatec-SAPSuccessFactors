import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Globe,
  Link as LinkIcon,
  Copy,
  Rocket,
  DownloadCloud,
  UploadCloud,
  X
} from 'lucide-react';

export default function BackupModal() {
  const { lang, t, role, adminPin, backupModal, setBackupModal, refreshData } = useApp();
  const [copiedMgmt, setCopiedMgmt] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  if (!backupModal) return null;

  const copyRoleLink = (roleType) => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', roleType === 'management' ? 'view' : 'admin');
    url.searchParams.set('lang', lang);

    navigator.clipboard.writeText(url.toString());

    if (roleType === 'management') {
      setCopiedMgmt(true);
      setTimeout(() => setCopiedMgmt(false), 2000);
    } else {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2000);
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await api.exportJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kanban_project_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImportJSON = (e) => {
    if (role !== 'admin') {
      alert(lang === 'ar' ? 'يتطلب استيراد البيانات صلاحيات الأدمن' : 'Admin rights required to import');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await api.importJSON(json, adminPin);
        alert(lang === 'ar' ? 'تم استيراد البيانات بنجاح!' : 'Data imported successfully!');
        setBackupModal(false);
        refreshData();
      } catch (err) {
        alert(err.message || 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span>{t.hostingModalTitle}</span>
          </h3>
          <button
            onClick={() => setBackupModal(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-sm">
          {/* Direct Links Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span>{t.shareLinksHeader}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {t.mgmtLinkBadge}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{t.mgmtLinkDesc}</p>
                </div>
                <button
                  onClick={() => copyRoleLink('management')}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedMgmt ? t.copiedText : t.btnCopyMgmtLink}</span>
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {t.adminLinkBadge}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{t.adminLinkDesc}</p>
                </div>
                <button
                  onClick={() => copyRoleLink('admin')}
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAdmin ? t.copiedText : t.btnCopyAdminLink}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Free Hosting Step-by-Step Guide */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-emerald-600" />
              <span>{t.freeHostHeader}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="font-extrabold text-emerald-900 text-sm mb-1">
                  1. موقع Netlify Drop (الأسرع - بدون برمجة)
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>قم بتحميل التطبيق أو رفعه على Netlify Drop.</li>
                  <li>افتح موقع <strong>app.netlify.com/drop</strong> مجاناً.</li>
                  <li>اسحب مجلد الـ build (dist) وسيعطيك فوراً رابطاً مجانياً دائماً يعمل على كل الأجهزة!</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
                <div className="font-extrabold text-indigo-900 text-sm mb-1">
                  2. موقع GitHub Pages / Vercel (مجاني للأبد)
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>أنشئ مستودعاً مجانياً على <strong>GitHub.com</strong>.</li>
                  <li>ارفع الكود وشغّل أمر النشر أو فعّل Vercel / Render بنقرة واحدة.</li>
                  <li>أرسل للإدارة الرابط مع إضافة <code>?mode=view</code> في نهايته للوضع التنفيذي.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Backup / Restore JSON */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-600">
              <strong className="text-slate-800">{t.backupTitle} </strong>
              <span>{t.backupSub}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-xs"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.btnDownloadJson}</span>
              </button>

              {role === 'admin' && (
                <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer shadow-xs">
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.btnUploadJson}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

