import React from 'react';
import { useApp } from '../context/AppContext';
import { CalendarRange, Edit3, Trash2 } from 'lucide-react';

const categoryStyles = {
  frontend: 'bg-violet-50 text-violet-700 border-violet-200',
  infra: 'bg-sky-50 text-sky-700 border-sky-200',
  security: 'bg-rose-50 text-rose-700 border-rose-200',
  database: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  management: 'bg-amber-50 text-amber-700 border-amber-200',
  qa: 'bg-indigo-50 text-indigo-700 border-indigo-200'
};

export default function TimelineView() {
  const { lang, t, role, tasks, timelineSort, setTimelineSort, setTaskModal, deleteTask } = useApp();
  const isAdmin = role === 'admin';

  const statusMap = {
    backlog: { name: t.colBacklog, badge: 'bg-slate-100 text-slate-700 border-slate-300' },
    inprogress: { name: t.colInProgress, badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    review: { name: t.colReview, badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    done: { name: t.colDone, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (timelineSort === 'dueDate') return a.dueDate.localeCompare(b.dueDate);
    if (timelineSort === 'startDate') return a.startDate.localeCompare(b.startDate);
    if (timelineSort === 'pointsDesc') return (Number(b.points) || 0) - (Number(a.points) || 0);
    return 0;
  });

  const allTimestamps = sortedTasks.flatMap(t => [
    new Date(t.startDate + 'T00:00:00').getTime(),
    new Date(t.dueDate + 'T00:00:00').getTime()
  ]);

  const minTime = allTimestamps.length > 0 ? Math.min(...allTimestamps) : Date.now();
  const maxTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : Date.now();
  const totalSpan = Math.max(maxTime - minTime, 86400000 * 7);

  const calculateDurationDays = (startStr, endStr) => {
    const s = new Date(startStr + 'T00:00:00');
    const e = new Date(endStr + 'T00:00:00');
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Top Timeline Bar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-indigo-600" />
            <span>{t.timelineHeaderTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{t.timelineHeaderSub}</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">{t.sortByLabel}</label>
          <select
            value={timelineSort}
            onChange={(e) => setTimelineSort(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="dueDate">{t.sortDueDate}</option>
            <option value="startDate">{t.sortStartDate}</option>
            <option value="pointsDesc">{t.sortPointsDesc}</option>
          </select>
        </div>
      </div>

      {/* Table & Gantt Roadmap */}
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 text-xs uppercase border-b border-slate-200">
              <th className="py-3.5 px-4 font-bold min-w-[230px] text-start">{t.thActivityCat}</th>
              <th className="py-3.5 px-3 font-bold text-center w-28">{t.thWeightPts}</th>
              <th className="py-3.5 px-3 font-bold w-36 text-start">{t.thAssignee}</th>
              <th className="py-3.5 px-3 font-bold w-36 text-start">{t.thStatus}</th>
              <th className="py-3.5 px-3 font-bold w-48 text-start">{t.thPeriod}</th>
              <th className="py-3.5 px-4 font-bold min-w-[280px] text-start">{t.thGanttBar}</th>
              {isAdmin && (
                <th className="py-3.5 px-3 font-bold text-center w-24">{t.thAction}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-10 text-center text-slate-400 text-sm">
                  {t.emptyColumn}
                </td>
              </tr>
            ) : (
              sortedTasks.map(task => {
                const title = lang === 'en' ? task.titleEn || task.titleAr : task.titleAr || task.titleEn;
                const assignee = lang === 'en' ? task.assigneeEn || task.assigneeAr : task.assigneeAr || task.assigneeEn;
                const catName = lang === 'en' ? task.categoryNameEn || task.categoryId : task.categoryNameAr || task.categoryId;
                const catClass = categoryStyles[task.categoryId] || 'bg-slate-100 text-slate-700 border-slate-200';
                const st = statusMap[task.status] || statusMap.backlog;
                const dl = task.deadlineInfo || { code: 'ontrack', labelAr: '', labelEn: '' };
                const dlLabel = lang === 'en' ? dl.labelEn || dl.labelAr : dl.labelAr || dl.labelEn;

                const startMs = new Date(task.startDate + 'T00:00:00').getTime();
                const dueMs = new Date(task.dueDate + 'T00:00:00').getTime();
                const offsetPercent = Math.max(0, Math.min(85, ((startMs - minTime) / totalSpan) * 100));
                const widthPercent = Math.max(12, Math.min(100 - offsetPercent, ((dueMs - startMs + 86400000) / totalSpan) * 100));

                let barColor = 'bg-indigo-500';
                if (task.status === 'done') barColor = 'bg-emerald-500';
                else if (dl.code === 'overdue') barColor = 'bg-rose-500';
                else if (dl.code === 'soon') barColor = 'bg-amber-500';

                let dlBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (dl.code === 'overdue' && task.status !== 'done') {
                  dlBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                } else if (dl.code === 'soon' && task.status !== 'done') {
                  dlBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
                }

                const posSide = lang === 'ar' ? 'right' : 'left';

                return (
                  <tr key={task.id} className="hover:bg-slate-50/90 transition">
                    <td className="py-3.5 px-4">
                      <div className={`font-bold text-slate-900 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                        {title}
                      </div>
                      <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${catClass}`}>
                        {catName}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-black text-xs">
                        {task.points} {t.pointsWord}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700 text-xs">
                      {assignee}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${st.badge}`}>
                        {st.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-xs text-slate-600 font-medium">
                      <div>{t.fromWord} <strong>{task.startDate}</strong></div>
                      <div>{t.toWord} <strong>{task.dueDate}</strong></div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md border ${dlBadgeClass}`}>
                          {dlLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          {calculateDurationDays(task.startDate, task.dueDate)} {t.workDays}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                        <div
                          className={`${barColor} h-full rounded-full absolute top-0`}
                          style={{
                            [posSide]: `${offsetPercent}%`,
                            width: `${widthPercent}%`
                          }}
                        />
                      </div>
                    </td>

                    {isAdmin && (
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setTaskModal({ isOpen: true, taskId: task.id, defaultStatus: task.status })}
                            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-indigo-600 transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

