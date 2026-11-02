import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Flame,
  BellRing,
  Clock,
  CalendarCheck,
  ChevronRight,
  ChevronLeft,
  Edit3,
  Trash2
} from 'lucide-react';

const categoryStyles = {
  frontend: 'bg-violet-50 text-violet-700 border-violet-200',
  infra: 'bg-sky-50 text-sky-700 border-sky-200',
  security: 'bg-rose-50 text-rose-700 border-rose-200',
  database: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  management: 'bg-amber-50 text-amber-700 border-amber-200',
  qa: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

const statusOrder = ['backlog', 'inprogress', 'review', 'done'];

export default function TaskCard({ task }) {
  const { lang, t, role, moveTask, deleteTask, setTaskModal } = useApp();
  const isAdmin = role === 'admin';

  const title = lang === 'en' ? task.titleEn || task.titleAr : task.titleAr || task.titleEn;
  const assignee = lang === 'en' ? task.assigneeEn || task.assigneeAr : task.assigneeAr || task.assigneeEn;
  const notes = lang === 'en' ? task.notesEn || task.notesAr : task.notesAr || task.notesEn;
  const isDone = task.status === 'done';

  const currentIdx = statusOrder.indexOf(task.status);
  const prevStatus = currentIdx > 0 ? statusOrder[currentIdx - 1] : null;
  const nextStatus = currentIdx < statusOrder.length - 1 ? statusOrder[currentIdx + 1] : null;

  // Icons and directions according to Arabic / English
  const PrevIcon = lang === 'ar' ? ChevronRight : ChevronLeft;
  const NextIcon = lang === 'ar' ? ChevronLeft : ChevronRight;
  const arrowSymbol = lang === 'ar' ? '←' : '→';

  // Category display
  const catClass = categoryStyles[task.categoryId] || 'bg-slate-100 text-slate-700 border-slate-200';
  const catName = lang === 'en'
    ? task.categoryNameEn || task.categoryId
    : task.categoryNameAr || task.categoryId;

  // Deadline info
  const dl = task.deadlineInfo || { code: 'ontrack', labelAr: '', labelEn: '' };
  const dlLabel = lang === 'en' ? dl.labelEn || dl.labelAr : dl.labelAr || dl.labelEn;

  let dlBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let DlIcon = CalendarCheck;

  if (isDone) {
    dlBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    DlIcon = CheckCircle2;
  } else if (dl.code === 'overdue') {
    dlBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    DlIcon = Flame;
  } else if (dl.daysDiff === 0) {
    dlBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    DlIcon = BellRing;
  } else if (dl.code === 'soon') {
    dlBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
    DlIcon = Clock;
  }

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  const handleDragStart = (e) => {
    if (!isAdmin) return;
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={isAdmin}
      onDragStart={handleDragStart}
      className={`task-card bg-white rounded-xl p-3.5 border ${
        dl.code === 'overdue' && !isDone
          ? 'border-rose-300 ring-1 ring-rose-100'
          : 'border-slate-200/90'
      } shadow-xs ${isAdmin ? 'cursor-grab admin-draggable' : 'cursor-default'} flex flex-col gap-2.5`}
    >
      {/* Top Category & Points */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${catClass}`}>
          {catName}
        </span>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-black text-xs">
          <Sparkles className="w-3 h-3" />
          <span>{task.points}</span>
          <span className="text-[10px] font-bold">{t.pointsWord}</span>
        </div>
      </div>

      {/* Title & Notes */}
      <div>
        <h4
          className={`font-bold text-sm text-slate-900 leading-snug ${
            isDone ? 'line-through text-slate-400' : ''
          }`}
        >
          {title}
        </h4>
        {notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notes}</p>}
      </div>

      {/* Date Span & Deadline Pill */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatShortDate(task.startDate)}</span>
          <span>{arrowSymbol}</span>
          <span className="font-bold text-slate-700">{formatShortDate(task.dueDate)}</span>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${dlBadgeClass}`}>
          <DlIcon className="w-3 h-3" />
          <span>{dlLabel}</span>
        </span>
      </div>

      {/* Assignee & Controls */}
      <div className="pt-2.5 mt-0.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
            {assignee ? assignee.charAt(0) : '?'}
          </div>
          <span className="text-xs font-semibold text-slate-700 truncate max-w-[125px]">
            {assignee}
          </span>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-0.5">
            {prevStatus && (
              <button
                onClick={() => moveTask(task.id, prevStatus)}
                title="Shift Back"
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <PrevIcon className="w-4 h-4" />
              </button>
            )}

            {nextStatus && (
              <button
                onClick={() => moveTask(task.id, nextStatus)}
                title="Advance"
                className="p-1 rounded-lg hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition"
              >
                <NextIcon className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setTaskModal({ isOpen: true, taskId: task.id, defaultStatus: task.status })}
              title="Edit Task"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => deleteTask(task.id)}
              title="Delete Task"
              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

