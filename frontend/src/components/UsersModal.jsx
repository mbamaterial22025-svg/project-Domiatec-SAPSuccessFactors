import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, UserPlus, Edit3, Trash2, ShieldCheck, Eye, X, Check, KeySquare } from 'lucide-react';

export default function UsersModal() {
  const { lang, t, role, usersModal, setUsersModal, users, saveUser, deleteUser } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    fullName: '',
    password: '',
    pin: '',
    role: 'admin'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!usersModal || role !== 'admin') return null;

  const handleOpenAdd = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({
      id: '',
      username: '',
      fullName: '',
      password: '',
      pin: '',
      role: 'admin'
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (user) => {
    setErrorMsg('');
    setSuccessMsg('');
    setFormData({
      id: user.id,
      username: user.username,
      fullName: user.fullName || user.username,
      password: '',
      pin: user.pin || '',
      role: user.role || 'admin'
    });
    setIsEditing(true);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await saveUser(formData);
      setSuccessMsg(formData.id ? (lang === 'ar' ? 'تم تعديل المستخدم بنجاح!' : 'User updated successfully!') : (lang === 'ar' ? 'تم إنشاء المستخدم بنجاح!' : 'User created successfully!'));
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ في حفظ بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`${t.deleteUserConfirm} (${user.fullName || user.username})`)) return;

    try {
      await deleteUser(user.id);
      setSuccessMsg(lang === 'ar' ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'فشل حذف المستخدم');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>{t.userManagementTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.userManagementSub}</p>
          </div>
          <button
            onClick={() => { setUsersModal(false); setIsEditing(false); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
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

          {/* User Form (Add / Edit) */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>{formData.id ? t.modalEditUserTitle : t.modalAddUserTitle}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblUsername}</label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="e.g. yassin"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblFullName}</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="م. ياسين حسن"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.lblPassword} {formData.id && <span className="text-slate-400 text-[10px]">({t.lblPasswordHint})</span>}
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    required={!formData.id}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <KeySquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'ar' ? 'رمز PIN مخصص' : 'Custom PIN'}</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={8}
                    value={formData.pin}
                    onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="e.g. 5678"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.lblRole}</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-xl bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="admin">{t.roleAdmin}</option>
                    <option value="viewer">{t.roleViewer}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {loading ? '...' : t.btnSaveUser}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.btnAddUser}</span>
              </button>
            </div>
          )}

          {/* Users Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-start">{t.thFullName}</th>
                  <th className="py-2.5 px-3 text-start">{t.thUsername}</th>
                  <th className="py-2.5 px-3 text-start">PIN</th>
                  <th className="py-2.5 px-3 text-start">{t.thRole}</th>
                  <th className="py-2.5 px-3 text-start">{t.thCreatedAt}</th>
                  <th className="py-2.5 px-3 text-center">{t.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      لا يوجد مستخدمون حالياً
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          {u.fullName ? u.fullName.charAt(0) : 'U'}
                        </div>
                        <span>{u.fullName || u.username}</span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-600 font-semibold" dir="ltr">
                        @{u.username}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-700 font-bold" dir="ltr">
                        {u.pin ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-800">
                            {u.pin}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            u.role === 'admin'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <Eye className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{u.role === 'admin' ? t.roleAdmin : t.roleViewer}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-500">
                        {u.createdAt ? u.createdAt.split('T')[0].split(' ')[0] : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-indigo-600 transition"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
