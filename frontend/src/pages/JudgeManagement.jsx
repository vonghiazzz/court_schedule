import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../utils/axios";
import { toast } from "react-toastify";
import { MONTHS, YEARS } from '../constants';
import { useCalendarData } from "../hooks/useCalendarData";
import { downloadSchedule } from "../utils/excel";

// UI Components
import Layout from "../components/Layout";
import ScheduleListTable from "../components/Calendar/ScheduleListTable";
import ChangePasswordModal from "../components/Modals/ChangePasswordModal";

// Styles
import "../styles/JudgeCalendar.css";

export default function JudgeManagement({ judgeName, onLogout }) {
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [filterMonth, setFilterMonth] = useState(currentDate.getMonth());
    const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch calendar statistics & schedules list
    const { filteredSchedules, loading } = useCalendarData(
        currentDate, filterMonth, filterYear, searchTerm
    );

    // Password State
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        document.title = "Quản Lý Phiên Tòa";
    }, []);

    const handleChangePassword = () => {
        setIsChangePasswordOpen(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const submitChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.warning("Vui lòng nhập đủ thông tin!");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.warning("Mật khẩu mới không khớp!");
            return;
        }
        try {
            await api.post("/change-password", { old_password: oldPassword, new_password: newPassword });
            toast.success("Đổi mật khẩu thành công!");
            setIsChangePasswordOpen(false);
        } catch (err) {
            toast.warning(err.response?.data?.detail || "Đổi mật khẩu thất bại!");
        }
    };

    const handleLogout = () => {
        if (!window.confirm("Bạn có chắc chắn muốn đăng xuất?")) return;
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("username");
            toast.success("Đăng xuất thành công!");
            navigate('/login');
        }
    };

    const handleDownloadSched = () => {
        const success = downloadSchedule(filteredSchedules);
        if (!success) toast.warning("Không có lịch xét xử!");
    };

    return (
        <Layout 
            judgeName={judgeName} 
            onLogout={handleLogout} 
            onChangePassword={handleChangePassword}
        >
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            {/* Management Area */}
            <div className="p-4 md:p-10 space-y-6">
                
                {/* Header / Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg text-judicial-navy font-bold">
                            Quản Lý Phiên Tòa - {MONTHS[filterMonth]} {filterYear}
                        </h1>
                        <nav className="flex items-center gap-2 mt-2 text-caption text-outline">
                            <span>Hệ thống quản lý</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span>Quản lý phiên tòa</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="text-judicial-navy font-bold">Tháng {String(filterMonth + 1).padStart(2, '0')}/{filterYear}</span>
                        </nav>
                    </div>
                    
                    {/* Filter controls */}
                    <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-lg shadow-sm border border-seal-silver">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-outline uppercase pl-1">Chọn tháng</label>
                            <select 
                                value={filterMonth} 
                                onChange={e => setFilterMonth(parseInt(e.target.value))}
                                className="border-none bg-surface-container-low rounded px-3 py-1 text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                            >
                                {MONTHS.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-outline uppercase pl-1">Chọn năm</label>
                            <select 
                                value={filterYear} 
                                onChange={e => setFilterYear(parseInt(e.target.value))}
                                className="border-none bg-surface-container-low rounded px-3 py-1 text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                            >
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Trial Schedules List table */}
                <ScheduleListTable
                    filteredSchedules={filteredSchedules}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onDownload={handleDownloadSched}
                />
            </div>

            {/* Modals */}
            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                oldPassword={oldPassword} setOldPassword={setOldPassword}
                newPassword={newPassword} setNewPassword={setNewPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                submitChangePassword={submitChangePassword}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </Layout>
    );
}
