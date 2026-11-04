import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, Edit, X } from 'lucide-react';

export default function TaskModal() {
  const { lang, t, role, taskModal, setTaskModal, tasks, categories, saveTask } = useApp();
  const { isOpen, taskId, defaultStatus } = taskModal;

  const [formData, setFormData] = useState({
    id: '',
    titleAr: '',
    titleEn: '',
    categoryId: 'frontend',
    points: 3,
    startDate: '',
    dueDate: '',
    assigneeAr: '',
    assigneeEn: '',
    status: 'backlog',
    notesAr: '',
    notesEn: ''
  });

  const [dateError, setDateError] = useState(false);
  const initializedForRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      initializedForRef.current = null;
      return;
    }

    const sessionKey = taskId ? `edit_${taskId}` : `new_${defaultStatus || 'backlog'}`;
    if (initializedForRef.current === sessionKey) {
      return; // Already initialized for this modal session! Protect user's typing
    }

    initializedForRef.current = sessionKey;
    setDateError(false);

    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setFormData({
          id: task.id,
          titleAr: task.titleAr || '',
          titleEn: task.titleEn || '',
          categoryId: task.categoryId || 'frontend',
          points: task.points || 3,
          startDate: task.startDate || '',
          dueDate: task.dueDate || '',
          assigneeAr: task.assigneeAr || '',
          assigneeEn: task.assigneeEn || '',
          status: task.status || 'backlog',
          notesAr: task.notesAr || '',
          notesEn: task.notesEn || ''
        });
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];
      setFormData({
        id: '',
        titleAr: '',
        titleEn: '',
        categoryId: 'frontend',
        points: 3,
        startDate: today,
        dueDate: nextWeek,
        assigneeAr: '',
        assigneeEn: '',
        status: defaultStatus || 'backlog',
        notesAr: '',
        notesEn: ''
      });
    }
  }, [isOpen, taskId, defaultStatus]);

  if (!isOpen || role !== 'admin') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.dueDate < formData.startDate) {
      setDateError(true);
      return;
    }
    setDateError(false);
    saveTask(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            {taskId ? <Edit className="w-5 h-5 text-indigo-600" /> : <PlusCircle className="w-5 h-5 text-indigo-600" />}
            <span>{taskId ? t.modalEditTitle : t.modalAddTitle}</span>
          </h3>
          <button
            onClick={() => setTaskModal({ isOpen: false, taskId: null, defaultStatus: 'backlog' })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Bilingual Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblTitleAr}</label>
              <input
                type="text"
                required
                value={formData.titleAr}
                onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                placeholder="مثال: تطوير نظام الصلاحيات"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblTitleEn}</label>
              <input
                type="text"
                dir="ltr"
                value={formData.titleEn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                placeholder="e.g. Auth & RBAC Development"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblCategory}</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {lang === 'en' ? cat.nameEn : cat.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblPoints}</label>
              <select
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl bg-white text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1 (Very Light / بسيط جداً)</option>
                <option value="2">2 (Light / خفيف)</option>
                <option value="3">3 (Medium / متوسط)</option>
                <option value="5">5 (Large / كبير)</option>
                <option value="8">8 (Complex / معقد)</option>
                <option value="13">13 (Critical / ضخم وحرج)</option>
              </select>
            </div>
          </div>

          {/* Start Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblStartDate}</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblDueDate}</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Bilingual Assignee & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblAssigneeAr}</label>
              <input
                type="text"
                required
                value={formData.assigneeAr}
                onChange={(e) => setFormData(prev => ({ ...prev, assigneeAr: e.target.value }))}
                placeholder="م. أحمد طارق"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblAssigneeEn}</label>
              <input
                type="text"
                dir="ltr"
                value={formData.assigneeEn}
                onChange={(e) => setFormData(prev => ({ ...prev, assigneeEn: e.target.value }))}
                placeholder="Eng. Ahmed Tarek"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblStatus}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="backlog">{t.colBacklog}</option>
                <option value="inprogress">{t.colInProgress}</option>
                <option value="review">{t.colReview}</option>
                <option value="done">{t.colDone}</option>
              </select>
            </div>
          </div>

          {/* Bilingual Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblNotesAr}</label>
              <textarea
                rows="2"
                value={formData.notesAr}
                onChange={(e) => setFormData(prev => ({ ...prev, notesAr: e.target.value }))}
                placeholder="أي تفاصيل إضافية..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblNotesEn}</label>
              <textarea
                rows="2"
                dir="ltr"
                value={formData.notesEn}
                onChange={(e) => setFormData(prev => ({ ...prev, notesEn: e.target.value }))}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {dateError && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {t.dateError}
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setTaskModal({ isOpen: false, taskId: null, defaultStatus: 'backlog' })}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition"
            >
              {t.btnSaveTask}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

