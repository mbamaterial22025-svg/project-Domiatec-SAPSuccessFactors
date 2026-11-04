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
  UploadCloud,
  LogOut,
  RefreshCw
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
    adminSidebarOpen,
    setAdminSidebarOpen,
    refreshData,
    handleLogout,
    isRefreshing,
    handleManualRefresh
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          
          {/* Brand & Project Title & Admin Drawer Toggle */}
          <div className="flex items-center gap-3">
            {/* Admin Animated Sidebar Toggle Button */}
            {isAdmin && (
              <button
                onClick={() => setAdminSidebarOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white shadow-md shadow-indigo-300/40 transition-all duration-300 transform hover:scale-102 active:scale-95 group shrink-0"
                title={lang === 'ar' ? 'فتح لوحة تحكم وإدارة النظام' : 'Open Admin Panel'}
              >
                <div className="relative flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                  <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="absolute -top-1 -end-1 w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="hidden sm:inline">{lang === 'ar' ? 'لوحة تحكم الأدمن' : 'Admin Panel'}</span>
              </button>
            )}

            {/* Domiatec Official Company Logo */}
            <div className="flex items-center ps-0.5 pe-2.5 py-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs shrink-0">
              <img
                src="/domiatec-logo.png"
                alt="Domiatec Agri-Group"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ٢٠٢٦
                </span>

                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {t.systemTag}
                </span>

                {!isAdmin && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{t.readOnlyBadge}</span>
                  </span>
                )}

                <span className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentDateStr}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <h1
                  onClick={() => isAdmin && setSettingsModal(true)}
                  className={`text-base sm:text-lg font-extrabold text-slate-900 transition flex items-center gap-1.5 ${
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
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 3 Views: Operational Workflow Board | Project Timeline | Executive Summary */}
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

            {/* Instant Cloud Sync Button (Always Available for Management & Admin) */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-indigo-700 border border-slate-200 transition shadow-2xs active:scale-95"
              title={lang === 'ar' ? 'تحديث فوري لجميع البيانات والمستجدات من السحابة' : 'Instant sync with cloud'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{lang === 'ar' ? 'تحديث فوري' : 'Live Sync'}</span>
            </button>

            {/* Quick Add Activity Button for Admin */}
            {isAdmin && (
              <button
                onClick={() => setTaskModal({ isOpen: true, taskId: null, defaultStatus: 'backlog' })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition transform hover:scale-102 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{t.btnAddActivity}</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
