import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import Layout from '../components/Layout';
import ChangePasswordModal from '../components/Modals/ChangePasswordModal';
import api from '../utils/axios';


const getErrorMessage = (error, fallback) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return fallback;
};


export default function CouncilManagement({ judgeName, onLogout }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogMode, setDialogMode] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [fullName, setFullName] = useState('');

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const loadMembers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/council-members');
            setMembers(response.data);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể tải danh sách hội đồng xét xử.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Quản lý hội đồng xét xử';
        loadMembers();
    }, []);

    const filteredMembers = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase('vi');
        if (!keyword) return members;
        return members.filter((member) => member.full_name.toLocaleLowerCase('vi').includes(keyword));
    }, [members, searchTerm]);

    const openCreateDialog = () => {
        setDialogMode('create');
        setSelectedMember(null);
        setFullName('');
    };

    const openEditDialog = (member) => {
        setDialogMode('edit');
        setSelectedMember(member);
        setFullName(member.full_name);
    };

    const closeDialog = () => {
        setDialogMode(null);
        setSelectedMember(null);
        setFullName('');
    };

    const saveMember = async () => {
        if (fullName.trim().length < 2) {
            toast.warning('Vui lòng nhập đầy đủ họ tên.');
            return;
        }

        setBusy(true);
        try {
            const response = dialogMode === 'create'
                ? await api.post('/council-members', { full_name: fullName })
                : await api.patch(`/council-members/${selectedMember.id}`, { full_name: fullName });

            setMembers((current) => {
                const next = dialogMode === 'create'
                    ? [...current, response.data]
                    : current.map((member) => member.id === response.data.id ? response.data : member);
                return next.sort((a, b) => a.full_name.localeCompare(b.full_name, 'vi'));
            });
            closeDialog();
            toast.success(dialogMode === 'create' ? 'Đã thêm thành viên.' : 'Đã cập nhật thành viên.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể lưu thành viên.'));
        } finally {
            setBusy(false);
        }
    };

    const deleteMember = async (member) => {
        const confirmed = window.confirm(
            `Xóa “${member.full_name}” khỏi danh sách lựa chọn?\n\n` +
            'Tên thành viên trong các lịch xét xử đã tạo trước đây vẫn được giữ lại.'
        );
        if (!confirmed) return;

        try {
            await api.delete(`/council-members/${member.id}`);
            setMembers((current) => current.filter((item) => item.id !== member.id));
            toast.success('Đã xóa thành viên khỏi danh sách.');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Không thể xóa thành viên.'));
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
            await api.post('/change-password', {
                old_password: oldPassword,
                new_password: newPassword,
            });
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
                        <h1 className="m-0 text-2xl font-bold text-judicial-navy md:text-3xl">Quản lý hội đồng xét xử</h1>
                        <p className="mb-0 mt-2 text-sm text-outline">Quản lý danh sách hội thẩm xuất hiện khi đăng ký lịch xét xử.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateDialog}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-judicial-navy px-5 py-2.5 font-bold text-white shadow-sm transition hover:shadow-md"
                    >
                        <span className="material-symbols-outlined text-xl">person_add</span>
                        Thêm thành viên
                    </button>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-blue-700">info</span>
                        <p className="m-0">
                            Việc sửa hoặc xóa chỉ thay đổi danh sách lựa chọn cho lịch mới. Tên đã lưu trong lịch cũ được giữ nguyên để bảo toàn lịch sử.
                        </p>
                    </div>
                </div>

                <section className="overflow-hidden rounded-xl border border-seal-silver bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-seal-silver bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="m-0 text-lg font-bold text-judicial-navy">Danh sách thành viên</h2>
                            <p className="m-0 mt-1 text-xs text-outline">Tổng cộng {members.length} thành viên</p>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-outline">search</span>
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Tìm theo họ tên..."
                                className="w-full rounded-lg border border-seal-silver bg-white py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-gavel-gold/30"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-px bg-seal-silver sm:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            <div className="col-span-full bg-white px-5 py-14 text-center text-outline">Đang tải danh sách...</div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="col-span-full bg-white px-5 py-14 text-center text-outline">Không tìm thấy thành viên phù hợp.</div>
                        ) : filteredMembers.map((member, index) => (
                            <article key={member.id} className="flex items-center justify-between gap-3 bg-white p-4 hover:bg-surface-container-low/70">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-fixed font-bold text-judicial-navy">
                                        {member.full_name.split(' ').slice(-2).map((part) => part[0]).join('').toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="m-0 truncate font-bold text-judicial-navy">{member.full_name}</p>
                                        <p className="m-0 text-xs text-outline">Thành viên #{index + 1}</p>
                                    </div>
                                </div>
                                <div className="flex flex-none gap-1">
                                    <button
                                        type="button"
                                        onClick={() => openEditDialog(member)}
                                        title="Sửa họ tên"
                                        className="flex cursor-pointer items-center rounded-lg border border-seal-silver bg-white p-2 text-judicial-navy hover:bg-primary-fixed/40"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteMember(member)}
                                        title="Xóa thành viên"
                                        className="flex cursor-pointer items-center rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            {dialogMode && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-judicial-navy/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeDialog();
                    }}
                >
                    <div className="w-full max-w-md overflow-hidden rounded-xl border border-seal-silver bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-seal-silver bg-surface-container-low px-6 py-4">
                            <h2 className="m-0 flex items-center gap-2 text-xl font-bold text-judicial-navy">
                                <span className="material-symbols-outlined">{dialogMode === 'create' ? 'person_add' : 'edit'}</span>
                                {dialogMode === 'create' ? 'Thêm thành viên' : 'Sửa thành viên'}
                            </h2>
                            <button type="button" onClick={closeDialog} className="flex cursor-pointer border-none bg-transparent p-1 text-outline hover:text-error">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="space-y-3 px-6 py-6">
                            <label className="block space-y-1">
                                <span className="text-xs font-bold text-on-surface-variant">Họ và tên</span>
                                <input
                                    autoFocus
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') saveMember();
                                    }}
                                    placeholder="Nhập họ và tên thành viên"
                                    className="w-full rounded-lg border border-seal-silver bg-white px-3 py-2 text-base outline-none focus:border-gavel-gold focus:ring-2 focus:ring-gavel-gold/20"
                                />
                            </label>
                            {dialogMode === 'edit' && (
                                <p className="m-0 text-xs text-outline">Tên trong các lịch đã tạo trước đây sẽ không bị thay đổi.</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-seal-silver bg-surface-container-low px-6 py-4">
                            <button type="button" onClick={closeDialog} className="cursor-pointer rounded-lg border border-seal-silver bg-white px-5 py-2 font-semibold text-judicial-navy">Hủy</button>
                            <button type="button" disabled={busy} onClick={saveMember} className="cursor-pointer rounded-lg border-none bg-judicial-navy px-5 py-2 font-bold text-white disabled:opacity-60">
                                {busy ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
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
