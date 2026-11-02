import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TaskCard from './TaskCard';
import { Plus, AlertOctagon, Inbox } from 'lucide-react';

export default function KanbanBoard() {
  const { t, role, tasks, project, moveTask, setTaskModal } = useApp();
  const isAdmin = role === 'admin';
  const [dragOverCol, setDragOverCol] = useState(null);

  const columns = [
    {
      id: 'backlog',
      title: t.colBacklog,
      colorDot: 'bg-slate-400',
      badgeClass: 'bg-slate-800 text-white'
    },
    {
      id: 'inprogress',
      title: t.colInProgress,
      colorDot: 'bg-indigo-500 animate-pulse',
      badgeClass: 'bg-indigo-600 text-white'
    },
    {
      id: 'review',
      title: t.colReview,
      colorDot: 'bg-amber-400',
      badgeClass: 'bg-amber-500 text-white'
    },
    {
      id: 'done',
      title: t.colDone,
      colorDot: 'bg-emerald-500',
      badgeClass: 'bg-emerald-600 text-white'
    }
  ];

  const handleDragOver = (e, colId) => {
    if (!isAdmin) return;
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = (e, colId) => {
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e, colId) => {
    if (!isAdmin) return;
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, colId);
    }
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 items-start">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        const colPoints = colTasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
        const isWipCol = col.id === 'inprogress';
        const isWipExceeded = isWipCol && colPoints > (project.wipLimit || 15);
        const isDraggingOver = dragOverCol === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`bg-slate-100/90 rounded-2xl border border-slate-200/80 flex flex-col max-h-[75vh] transition ${
              isDraggingOver ? 'drag-over' : ''
            } ${isWipExceeded ? 'ring-2 ring-rose-400' : ''}`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200/80 bg-white/60 rounded-t-2xl flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${col.colorDot}`} />
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    {col.title}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-xs ${
                      isWipExceeded ? 'bg-rose-600 text-white' : col.badgeClass
                    }`}
                  >
                    {isWipCol
                      ? `${colPoints} / ${project.wipLimit || 15} ${t.ptShort}`
                      : `${colPoints} ${t.pointsWord}`}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => setTaskModal({ isOpen: true, taskId: null, defaultStatus: col.id })}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                      title="Add Activity to Column"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* In Progress WIP Exceeded Banner */}
              {isWipExceeded && (
                <div className="text-xs px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 font-bold flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.wipOverloadBanner}</span>
                </div>
              )}
            </div>

            {/* Column Card Body */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[220px]">
              {colTasks.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Inbox className="w-6 h-6 stroke-1" />
                  <span>{t.emptyColumn}</span>
                </div>
              ) : (
                colTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

