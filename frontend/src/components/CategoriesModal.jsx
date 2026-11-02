import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderKanban, Plus, Edit3, Trash2, X, Check } from 'lucide-react';

const colorOptions = [
  { label: 'بنفسجي (Violet)', value: 'bg-violet-50 text-violet-700 border-violet-200' },
  { label: 'سماوي (Sky)', value: 'bg-sky-50 text-sky-700 border-sky-200' },
  { label: 'وردي (Rose)', value: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'أخضر زمردي (Emerald)', value: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'كهرماني (Amber)', value: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'نيلي (Indigo)', value: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { label: 'رمادي (Slate)', value: 'bg-slate-100 text-slate-700 border-slate-200' }
];

export default function CategoriesModal() {
  const { lang, t, role, categoriesModal, setCategoriesModal, categories, saveCategory, deleteCategory } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nameAr: '',
    nameEn: '',
    colorClass: colorOptions[0].value,
    icon: 'folder',
    displayOrder: 10,
    isEdit: false
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!categoriesModal || role !== 'admin') return null;

  const handleOpenAdd = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({
      id: '',
      nameAr: '',
      nameEn: '',
      colorClass: colorOptions[0].value,
      icon: 'folder',
      displayOrder: (categories.length + 1) * 2,
      isEdit: false
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (cat) => {
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({
      id: cat.id,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      colorClass: cat.colorClass,
      icon: cat.icon,
      displayOrder: cat.displayOrder,
      isEdit: true
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await saveCategory(formData);
      setSuccessMsg(formData.isEdit ? 'تم تعديل الفئة بنجاح!' : 'تم إنشاء الفئة بنجاح!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ في حفظ الفئة');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`${t.deleteCatConfirm} (${lang === 'en' ? cat.nameEn : cat.nameAr})`)) return;

    try {
      await deleteCategory(cat.id);
      setSuccessMsg('تم حذف الفئة بنجاح');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'فشل حذف الفئة');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            <span>{t.modalCategoriesTitle}</span>
          </h3>
          <button
            onClick={() => { setCategoriesModal(false); setIsEditing(false); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900">
                {formData.isEdit ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblCatNameAr}</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                    placeholder="مثال: التصميم وتجربة المستخدم"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblCatNameEn}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="e.g. UI/UX Design"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblCatId}</label>
                  <input
                    type="text"
                    dir="ltr"
                    disabled={formData.isEdit}
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g. design"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نسق الألوان (Color Theme)</label>
                  <select
                    value={formData.colorClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, colorClass: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {colorOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {loading ? '...' : 'حفظ الفئة'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t.btnAddCategory}</span>
              </button>
            </div>
          )}

          {/* Categories List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-start">الفئة</th>
                  <th className="py-2.5 px-3 text-start">الاسم الإنجليزي</th>
                  <th className="py-2.5 px-3 text-start">المعرف (ID)</th>
                  <th className="py-2.5 px-3 text-center">{t.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md border ${cat.colorClass}`}>
                        {cat.nameAr}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600">
                      {cat.nameEn}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500" dir="ltr">
                      {cat.id}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-indigo-600 transition"
                          title="Edit Category"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

