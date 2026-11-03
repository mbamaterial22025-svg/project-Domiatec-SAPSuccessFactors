import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Kanban,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Download,
  Calendar,
  Eye,
  PenLine,
  Columns4,
  GanttChart,
  PieChart,
  Users,
  FolderKanban,
  DownloadCloud,
  UploadCloud
} from 'lucide-react';

export default function Header() {
  const {
    lang,
    t,
    role,
    project,
    tasks,
    categories,
    currentView,
    setCurrentView,
    setTaskModal,
    setSettingsModal,
    setUsersModal,
    setCategoriesModal,
    setResetModal,
    refreshData
  } = useApp();

  const fileInputRef = useRef(null);
  const isAdmin = role === 'admin';
  const projectTitle = lang === 'en' ? project.titleEn : project.titleAr;

  const today = new Date();
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  const currentDateStr = today.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleExportCSV = () => {
    try {
      const isAr = lang === 'ar';
      const headers = isAr
        ? ['المعرف', 'عنوان النشاط (عربي)', 'عنوان النشاط (إنجليزي)', 'المرحلة / القسم', 'الوزن النسبي', 'الحالة', 'تاريخ البدء', 'تاريخ الاستحقاق', 'المسؤول']
        : ['ID', 'Title (AR)', 'Title (EN)', 'Category', 'Weight', 'Status', 'Start Date', 'Due Date', 'Assignee'];

      const statusMap = {
        backlog: isAr ? 'قيد الانتظار' : 'Backlog',
        in_progress: isAr ? 'قيد التنفيذ' : 'In Progress',
        testing: isAr ? 'قيد المراجعة والاختبار' : 'Testing/Review',
        completed: isAr ? 'مكتمل' : 'Completed'
      };

      const categoryMap = {};
      (categories || []).forEach(c => {
        categoryMap[c.key] = isAr ? c.nameAr : c.nameEn;
      });

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      };

      const rows = (tasks || []).map(task => [
        escapeCSV(task.id),
        escapeCSV(task.titleAr || ''),
        escapeCSV(task.titleEn || task.titleAr || ''),
        escapeCSV(categoryMap[task.category] || task.category || ''),
        escapeCSV(task.weight || 1),
        escapeCSV(statusMap[task.status] || task.status),
        escapeCSV(task.startDate || ''),
        escapeCSV(task.dueDate || ''),
        escapeCSV(task.assignedTo || '')
      ]);

      const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Domiatec_SAP_Activities_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Client CSV Export error:', err);
      window.location.href = api.getCSVUrl(lang);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const data = await api.exportJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `Domiatec_SAP_Full_Backup_${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(lang === 'ar' ? 'فشل تحميل النسخة الاحتياطية: ' + err.message : 'Failed to download backup: ' + err.message);
    }
  };

  const handleRestoreFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(lang === 'ar'
      ? 'هل أنت متأكد من استرجاع البيانات من هذا الملف؟ سيتم تحديث وتعديل كافة الأنشطة والمستخدمين.'
      : 'Are you sure you want to restore data from this backup file? All activities and users will be updated.')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await api.importJSON(json);
        alert(lang === 'ar' ? '✅ تم استرجاع النسخة الاحتياطية بنجاح!' : '✅ Backup restored successfully!');
        await refreshData();
      } catch (err) {
        alert(lang === 'ar' ? 'فشل استرجاع النسخة: ' + (err.message || 'ملف غير صالح') : 'Failed to restore backup: ' + (err.message || 'Invalid file'));
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <Kanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {t.systemTag}
                </span>

                {!isAdmin && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{t.readOnlyBadge}</span>
                  </span>
                )}

                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentDateStr}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <h1
                  onClick={() => isAdmin && setSettingsModal(true)}
                  className={`text-lg sm:text-xl font-extrabold text-slate-900 transition flex items-center gap-1.5 ${
                    isAdmin ? 'cursor-pointer hover:text-indigo-600' : ''
                  }`}
                >
                  <span>{projectTitle}</span>
                  {isAdmin && <PenLine className="w-4 h-4 text-slate-400 hover:text-indigo-600" />}
                </h1>
              </div>
            </div>
          </div>

          {/* View Switcher & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 3 Views: Kanban Board | Timeline | Executive Summary */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setCurrentView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
                  currentView === 'kanban'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns4 className="w-4 h-4" />
                <span>{t.tabKanban}</span>
              </button>

              <button
                onClick={() => setCurrentView('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
                  currentView === 'timeline'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GanttChart className="w-4 h-4" />
                <span>{t.tabTimeline}</span>
              </button>

              <button
                onClick={() => setCurrentView('executive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
                  currentView === 'executive'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>{t.tabExecutive}</span>
              </button>
            </div>

            {/* Admin-Only Controls */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Manage Users Button */}
                <button
                  onClick={() => setUsersModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                  title={t.userManagementTitle}
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">{t.manageUsersBtn}</span>
                </button>

                {/* Manage Categories Button */}
                <button
                  onClick={() => setCategoriesModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition"
                  title={t.modalCategoriesTitle}
                >
                  <FolderKanban className="w-4 h-4 text-violet-600" />
                  <span className="hidden sm:inline">{t.manageCategoriesBtn}</span>
                </button>

                {/* WIP Limit & Settings */}
                <button
                  onClick={() => setSettingsModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                  <span>
                    {t.wipLimitLabel} <strong>{project.wipLimit}</strong> {t.ptShort}
                  </span>
                </button>

                {/* Export CSV (Admin Only - Hidden in Executive Management View) */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                  title={t.btnExportCSV}
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">{t.btnExportCSV}</span>
                </button>

                {/* Take Full Backup Button */}
                <button
                  onClick={handleDownloadBackup}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition"
                  title={lang === 'ar' ? 'أخذ نسخة احتياطية كاملة (تحميل ملف JSON)' : 'Take Full Backup (JSON)'}
                >
                  <DownloadCloud className="w-4 h-4 text-sky-600" />
                  <span className="hidden sm:inline">{lang === 'ar' ? 'نسخة احتياطية' : 'Backup'}</span>
                </button>

                {/* Restore Backup Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleRestoreFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
                  title={lang === 'ar' ? 'استرجاع النظام من نسخة احتياطية (ملف JSON)' : 'Restore from Backup (JSON)'}
                >
                  <UploadCloud className="w-4 h-4 text-purple-600" />
                  <span className="hidden sm:inline">{lang === 'ar' ? 'استرجاع نسخة' : 'Restore'}</span>
                </button>

                {/* Reset Default Data */}
                <button
                  onClick={() => setResetModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition"
                  title="Reset Default Data"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Add New Activity Button */}
                <button
                  onClick={() => setTaskModal({ isOpen: true, taskId: null, defaultStatus: 'backlog' })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.btnAddActivity}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
