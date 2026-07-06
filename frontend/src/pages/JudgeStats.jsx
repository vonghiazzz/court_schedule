import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../utils/axios";
import { toast } from "react-toastify";
import { MONTHS, YEARS } from '../constants';
import { useCalendarData } from "../hooks/useCalendarData";
import { downloadJudgeStats } from "../utils/excel";

// UI Components
import Layout from "../components/Layout";
import JudgeStatsTable from "../components/Calendar/JudgeStatsTable";
import ChangePasswordModal from "../components/Modals/ChangePasswordModal";

// Styles
import "../styles/JudgeCalendar.css";

export default function JudgeStats({ judgeName, onLogout }) {
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [filterMonth, setFilterMonth] = useState(currentDate.getMonth());
    const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
    const [searchJudgeTerm, setSearchJudgeTerm] = useState("");

    // Fetch calendar statistics
    const { schedule, stats, loading } = useCalendarData(
        currentDate, filterMonth, filterYear, ""
    );

    // Password State
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        document.title = "Thống Kê Phiên Xét Xử";
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

    const handleDownloadStats = () => {
        downloadJudgeStats(stats, searchJudgeTerm);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doneCount = schedule.filter(s => new Date(s.date) < today).length;
    const pendingCount = schedule.filter(s => new Date(s.date) >= today).length;

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

            {/* Statistics Area */}
            <div className="p-4 md:p-10 space-y-6">
                
                {/* Header / Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg text-judicial-navy font-bold">
                            Thống Kê Phiên Xét Xử - {MONTHS[filterMonth]} {filterYear}
                        </h1>
                        <nav className="flex items-center gap-2 mt-2 text-caption text-outline">
                            <span>Hệ thống quản lý</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span>Thống kê phiên xử</span>
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

                {/* Legend and Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-seal-silver flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded bg-primary-fixed flex items-center justify-center">
                            <span className="material-symbols-outlined text-judicial-navy">gavel</span>
                        </div>
                        <div>
                            <p className="text-caption text-outline margin-0">Tổng số phiên trong tháng</p>
                            <p className="text-title-lg font-bold text-judicial-navy margin-0">{schedule.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-seal-silver flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-status-completed">check_circle</span>
                        </div>
                        <div>
                            <p className="text-caption text-outline margin-0">Đã hoàn thành</p>
                            <p className="text-title-lg font-bold text-status-completed margin-0">{doneCount}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-seal-silver flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-status-scheduled">event_repeat</span>
                        </div>
                        <div>
                            <p className="text-caption text-outline margin-0">Đang chờ</p>
                            <p className="text-title-lg font-bold text-status-scheduled margin-0">{pendingCount}</p>
                        </div>
                    </div>
                </div>

                {/* Statistical summary table */}
                <JudgeStatsTable
                    stats={stats}
                    searchJudgeTerm={searchJudgeTerm}
                    setSearchJudgeTerm={setSearchJudgeTerm}
                    onDownload={handleDownloadStats}
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
