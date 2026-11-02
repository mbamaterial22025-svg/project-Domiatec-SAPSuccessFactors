import React from 'react';
import { useApp } from '../context/AppContext';
import { FolderKanban, Users } from 'lucide-react';

export default function ExecutiveView() {
  const { lang, t, metrics } = useApp();

  const categoryBreakdown = metrics?.categoryBreakdown || [];
  const assigneeBreakdown = metrics?.assigneeBreakdown || [];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Category Points Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600" />
              <span>{t.execCategoryTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.execCategorySub}</p>
          </div>
        </div>

        <div className="space-y-4">
          {categoryBreakdown.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">{t.emptyColumn}</div>
          ) : (
            categoryBreakdown.map(cat => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${cat.colorClass}`}>
                      {lang === 'en' ? cat.nameEn : cat.nameAr}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({cat.taskCount} {t.activitiesWord})
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {cat.donePoints} / {cat.totalPoints} {t.pointsWord}{' '}
                    <span className="text-indigo-600 ms-1">({cat.completionPercent}%)</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.completionPercent}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team / Assignee Workload Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{t.execTeamTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.execTeamSub}</p>
          </div>
        </div>

        <div className="space-y-4">
          {assigneeBreakdown.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">{t.emptyColumn}</div>
          ) : (
            assigneeBreakdown.map((person, idx) => {
              const displayName = lang === 'en' ? person.nameEn || person.nameAr : person.nameAr || person.nameEn;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        {displayName ? displayName.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{displayName}</div>
                        <div className="text-[11px] text-slate-500">
                          {person.taskCount} {t.activitiesWord} • {t.statusProgressShort}:{' '}
                          <strong>
                            {person.inProgressPoints} {t.ptShort}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="text-xs font-extrabold text-emerald-700">
                        {person.donePoints} / {person.totalPoints} {t.pointsWord}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        {person.completionPercent}%
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${person.completionPercent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

