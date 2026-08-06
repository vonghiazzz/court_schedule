import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import Layout from '../components/Layout';
import ChangePasswordModal from '../components/Modals/ChangePasswordModal';
import api from '../utils/axios';


const emptyCreateForm = {
    username: '',
    password: '',
    confirmPassword: '',
    is_admin: false,
};

const getErrorMessage = (error, fallback) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return fallback;
};

function Dialog({ title, icon, children, onClose, actions }) {
    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-judicial-navy/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-seal-silver bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-seal-silver bg-surface-container-low px-6 py-4">
                    <h2 className="m-0 flex items-center gap-2 text-xl font-bold text-judicial-navy">
                        <span className="material-symbols-outlined">{icon}</span>
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex cursor-pointer border-none bg-transparent p-1 text-outline hover:text-error"
                        aria-label="Đóng"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="space-y-4 px-6 py-6">{children}</div>
                <div className="flex justify-end gap-3 border-t border-seal-silver bg-surface-container-low px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg border border-seal-silver bg-white px-5 py-2 font-semibold text-judicial-navy hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    {actions}
                </div>
            </div>
        </div>
    );
}

const Field = ({ label, ...props }) => (
    <label className="block space-y-1">
        <span className="text-xs font-bold text-on-surface-variant">{label}</span>
        <input
            {...props}
            className="w-full rounded-lg border border-seal-silver bg-white px-3 py-2 text-base outline-none transition focus:border-gavel-gold focus:ring-2 focus:ring-gavel-gold/20"
        />
    </label>
);


export default function UserManagement({ judgeName, onLogout, currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', is_admin: false });
    const [resetUser, setResetUser] = useState(null);
    const [resetPassword, setResetPassword] = useState('');
    const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể tải danh sách tài khoản.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Quản lý người dùng';
        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase('vi');
        if (!keyword) return users;
        return users.filter((user) => user.username.toLocaleLowerCase('vi').includes(keyword));
    }, [searchTerm, users]);

    const adminCount = users.filter((user) => user.is_admin).length;

    const openCreateDialog = () => {
        setCreateForm(emptyCreateForm);
        setShowCreate(true);
    };

    const createUser = async () => {
        if (!createForm.username.trim() || !createForm.password) {
            toast.warning('Vui lòng nhập tên đăng nhập và mật khẩu.');
            return;
        }
        if (createForm.password.length < 6) {
            toast.warning('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (createForm.password !== createForm.confirmPassword) {
            toast.warning('Mật khẩu xác nhận không khớp.');
            return;
        }

        setBusy(true);
        try {
            const response = await api.post('/admin/users', {
                username: createForm.username,
                password: createForm.password,
                is_admin: createForm.is_admin,
            });
            setUsers((current) => [...current, response.data].sort((a, b) => a.username.localeCompare(b.username, 'vi')));
            setShowCreate(false);
            toast.success('Tạo tài khoản thành công.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể tạo tài khoản.'));
        } finally {
            setBusy(false);
        }
    };

    const openEditDialog = (user) => {
        setEditingUser(user);
        setEditForm({ username: user.username, is_admin: Boolean(user.is_admin) });
    };

    const updateUser = async () => {
        if (!editForm.username.trim()) {
            toast.warning('Tên đăng nhập không được để trống.');
            return;
        }

        setBusy(true);
        try {
            const response = await api.patch(`/admin/users/${editingUser.id}`, {
                username: editForm.username,
                is_admin: editForm.is_admin,
            });
            setUsers((current) => current
                .map((user) => user.id === response.data.id ? response.data : user)
                .sort((a, b) => a.username.localeCompare(b.username, 'vi')));
            setEditingUser(null);
            toast.success('Cập nhật tài khoản thành công.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể cập nhật tài khoản.'));
        } finally {
            setBusy(false);
        }
    };

    const openResetDialog = (user) => {
        setResetUser(user);
        setResetPassword('');
        setResetPasswordConfirm('');
    };

    const resetUserPassword = async () => {
        if (resetPassword.length < 6) {
            toast.warning('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (resetPassword !== resetPasswordConfirm) {
            toast.warning('Mật khẩu xác nhận không khớp.');
            return;
        }

        setBusy(true);
        try {
            await api.post(`/admin/users/${resetUser.id}/reset-password`, { new_password: resetPassword });
            setResetUser(null);
            toast.success(`Đã đặt lại mật khẩu cho ${resetUser.username}.`);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể đặt lại mật khẩu.'));
        } finally {
            setBusy(false);
        }
    };

    const deleteUser = async (user) => {
        if (!window.confirm(`Bạn có chắc muốn xóa tài khoản “${user.username}”?`)) return;

        try {
            await api.delete(`/admin/users/${user.id}`);
            setUsers((current) => current.filter((item) => item.id !== user.id));
            toast.success('Đã xóa tài khoản.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể xóa tài khoản.'));
        }
    };

    const openChangePassword = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangePasswordOpen(true);
    };

    const submitChangePassword = async () => {
        if (!oldPassword || newPassword.length < 6) {
            toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.warning('Mật khẩu xác nhận không khớp.');
            return;
        }
        try {
            await api.post('/change-password', { old_password: oldPassword, new_password: newPassword });
            setIsChangePasswordOpen(false);
            toast.success('Đổi mật khẩu thành công.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể đổi mật khẩu.'));
        }
    };

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) onLogout();
    };

    return (
        <Layout
            judgeName={judgeName}
            onLogout={handleLogout}
            onChangePassword={openChangePassword}
            isAdmin
        >
            <div className="space-y-6 p-4 md:p-10">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="m-0 text-2xl font-bold text-judicial-navy md:text-3xl">Quản lý người dùng</h1>
                        <p className="mb-0 mt-2 text-sm text-outline">Tạo tài khoản, phân quyền và hỗ trợ đặt lại mật khẩu.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateDialog}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-judicial-navy px-5 py-2.5 font-bold text-white shadow-sm transition hover:shadow-md"
                    >
                        <span className="material-symbols-outlined text-xl">person_add</span>
                        Thêm tài khoản
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-seal-silver bg-white p-5 shadow-sm">
                        <p className="m-0 text-sm text-outline">Tổng tài khoản</p>
                        <p className="m-0 mt-1 text-3xl font-black text-judicial-navy">{users.length}</p>
                    </div>
                    <div className="rounded-xl border border-seal-silver bg-white p-5 shadow-sm">
                        <p className="m-0 text-sm text-outline">Quản trị viên</p>
                        <p className="m-0 mt-1 text-3xl font-black text-gavel-gold">{adminCount}</p>
                    </div>
                    <div className="rounded-xl border border-seal-silver bg-white p-5 shadow-sm">
                        <p className="m-0 text-sm text-outline">Người dùng thường</p>
                        <p className="m-0 mt-1 text-3xl font-black text-judicial-navy">{users.length - adminCount}</p>
                    </div>
                </div>

                <section className="overflow-hidden rounded-xl border border-seal-silver bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-seal-silver bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="m-0 text-lg font-bold text-judicial-navy">Danh sách tài khoản</h2>
                        <div className="relative w-full sm:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-outline">search</span>
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Tìm theo tên đăng nhập..."
                                className="w-full rounded-lg border border-seal-silver bg-white py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-gavel-gold/30"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse">
                            <thead>
                                <tr className="border-b border-seal-silver text-left text-xs uppercase tracking-wide text-outline">
                                    <th className="px-5 py-3">Tài khoản</th>
                                    <th className="px-5 py-3">Vai trò</th>
                                    <th className="px-5 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="px-5 py-12 text-center text-outline">Đang tải danh sách...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="3" className="px-5 py-12 text-center text-outline">Không tìm thấy tài khoản phù hợp.</td></tr>
                                ) : filteredUsers.map((user) => {
                                    const isCurrentUser = user.id === currentUser?.id;
                                    return (
                                        <tr key={user.id} className="border-b border-seal-silver/70 last:border-b-0 hover:bg-surface-container-low/60">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed font-bold text-judicial-navy">
                                                        {user.username.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="m-0 font-bold text-judicial-navy">{user.username}</p>
                                                        <p className="m-0 text-xs text-outline">ID: {user.id}{isCurrentUser ? ' · Tài khoản của bạn' : ''}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${user.is_admin ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
                                                    {user.is_admin ? 'Quản trị viên' : 'Người dùng'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditDialog(user)}
                                                        disabled={isCurrentUser}
                                                        title={isCurrentUser ? 'Không thể sửa tài khoản đang đăng nhập' : 'Sửa tài khoản'}
                                                        className="flex cursor-pointer items-center rounded-lg border border-seal-silver bg-white p-2 text-judicial-navy hover:bg-primary-fixed/40 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openResetDialog(user)}
                                                        title="Đặt lại mật khẩu"
                                                        className="flex cursor-pointer items-center rounded-lg border border-seal-silver bg-white p-2 text-judicial-navy hover:bg-primary-fixed/40"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">lock_reset</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteUser(user)}
                                                        disabled={isCurrentUser}
                                                        title={isCurrentUser ? 'Không thể tự xóa tài khoản' : 'Xóa tài khoản'}
                                                        className="flex cursor-pointer items-center rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {showCreate && (
                <Dialog
                    title="Thêm tài khoản"
                    icon="person_add"
                    onClose={() => setShowCreate(false)}
                    actions={(
                        <button type="button" disabled={busy} onClick={createUser} className="cursor-pointer rounded-lg border-none bg-judicial-navy px-5 py-2 font-bold text-white disabled:opacity-60">
                            {busy ? 'Đang tạo...' : 'Tạo tài khoản'}
                        </button>
                    )}
                >
                    <Field label="Tên đăng nhập" autoFocus value={createForm.username} onChange={(event) => setCreateForm({ ...createForm, username: event.target.value })} placeholder="Nhập tên đăng nhập" />
                    <Field label="Mật khẩu (ít nhất 6 ký tự)" type="password" value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} placeholder="Nhập mật khẩu" />
                    <Field label="Xác nhận mật khẩu" type="password" value={createForm.confirmPassword} onChange={(event) => setCreateForm({ ...createForm, confirmPassword: event.target.value })} placeholder="Nhập lại mật khẩu" />
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-seal-silver bg-surface-container-low p-3">
                        <input type="checkbox" checked={createForm.is_admin} onChange={(event) => setCreateForm({ ...createForm, is_admin: event.target.checked })} className="rounded text-judicial-navy focus:ring-gavel-gold" />
                        <span><strong className="block text-sm text-judicial-navy">Quyền quản trị viên</strong><small className="text-outline">Cho phép quản lý các tài khoản khác.</small></span>
                    </label>
                </Dialog>
            )}

            {editingUser && (
                <Dialog
                    title="Cập nhật tài khoản"
                    icon="manage_accounts"
                    onClose={() => setEditingUser(null)}
                    actions={(
                        <button type="button" disabled={busy} onClick={updateUser} className="cursor-pointer rounded-lg border-none bg-judicial-navy px-5 py-2 font-bold text-white disabled:opacity-60">
                            {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    )}
                >
                    <Field label="Tên đăng nhập" autoFocus value={editForm.username} onChange={(event) => setEditForm({ ...editForm, username: event.target.value })} />
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-seal-silver bg-surface-container-low p-3">
                        <input type="checkbox" checked={editForm.is_admin} onChange={(event) => setEditForm({ ...editForm, is_admin: event.target.checked })} className="rounded text-judicial-navy focus:ring-gavel-gold" />
                        <span><strong className="block text-sm text-judicial-navy">Quyền quản trị viên</strong><small className="text-outline">Cho phép truy cập trang quản lý người dùng.</small></span>
                    </label>
                </Dialog>
            )}

            {resetUser && (
                <Dialog
                    title={`Đặt lại mật khẩu`}
                    icon="lock_reset"
                    onClose={() => setResetUser(null)}
                    actions={(
                        <button type="button" disabled={busy} onClick={resetUserPassword} className="cursor-pointer rounded-lg border-none bg-judicial-navy px-5 py-2 font-bold text-white disabled:opacity-60">
                            {busy ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                        </button>
                    )}
                >
                    <p className="m-0 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Tài khoản: <strong>{resetUser.username}</strong></p>
                    <Field label="Mật khẩu mới (ít nhất 6 ký tự)" autoFocus type="password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} placeholder="Nhập mật khẩu mới" />
                    <Field label="Xác nhận mật khẩu mới" type="password" value={resetPasswordConfirm} onChange={(event) => setResetPasswordConfirm(event.target.value)} placeholder="Nhập lại mật khẩu mới" />
                </Dialog>
            )}

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                oldPassword={oldPassword}
                setOldPassword={setOldPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                submitChangePassword={submitChangePassword}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </Layout>
    );
}
