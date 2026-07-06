import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from 'react-router-dom';
import api from "../utils/axios";
import { toast } from "react-toastify";
import { MONTHS, YEARS } from '../constants';
import { useCalendarData } from "../hooks/useCalendarData";

// UI Components
import Layout from "../components/Layout";
import ChangePasswordModal from "../components/Modals/ChangePasswordModal";

// Styles
import "../styles/JudgeCalendar.css";

export default function JudgeOverview({ judgeName, onLogout }) {
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [filterMonth, setFilterMonth] = useState(currentDate.getMonth());
    const [filterYear, setFilterYear] = useState(currentDate.getFullYear());

    // Fetch schedules list for statistics
    const { schedule, loading } = useCalendarData(
        currentDate, filterMonth, filterYear, ""
    );

    // Password State
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        document.title = "Tổng Quan Hệ Thống";
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. KPI Calculations
    const totalTrials = schedule.length;
    
    const myTrials = useMemo(() => {
        return schedule.filter(s => s.user?.username?.toLowerCase() === judgeName?.toLowerCase()).length;
    }, [schedule, judgeName]);

    const completedTrials = useMemo(() => {
        return schedule.filter(s => new Date(s.date) < today).length;
    }, [schedule, today]);

    const pendingTrials = totalTrials - completedTrials;
    const completionRate = totalTrials > 0 ? Math.round((completedTrials / totalTrials) * 100) : 0;

    // 2. Room Utilization calculations
    const roomStats = useMemo(() => {
        const rooms = schedule.reduce((acc, s) => {
            if (s.room) {
                acc[s.room] = (acc[s.room] || 0) + 1;
            }
            return acc;
        }, {});
        
        // Convert to array and sort by frequency descending
        return Object.entries(rooms)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [schedule]);

    const maxRoomTrials = roomStats.length > 0 ? roomStats[0].count : 1;

    // 3. Next 5 Upcoming Trials
    const upcomingTrials = useMemo(() => {
        return [...schedule]
            .filter(s => new Date(s.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
    }, [schedule, today]);

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

            <div className="p-4 md:p-10 space-y-6">
                
                {/* Header / Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg text-judicial-navy font-bold">
                            Tổng Quan Hệ Thống - {MONTHS[filterMonth]} {filterYear}
                        </h1>
                        <nav className="flex items-center gap-2 mt-2 text-caption text-outline">
                            <span>Hệ thống quản lý</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="text-judicial-navy font-bold">Tổng quan Dashboard</span>
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

                {/* Dashboard KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-seal-silver flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-judicial-navy text-2xl">balance</span>
                        </div>
                        <div>
                            <p className="text-caption text-outline margin-0 font-medium">Tổng phiên tòa chung</p>
                            <p className="text-2xl font-black text-judicial-navy margin-0">{totalTrials} vụ</p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-seal-silver flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-gavel-gold text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                        </div>
                        <div>
                            <p className="text-caption text-outline margin-0 font-medium font-semibold">Lịch xét xử của tôi</p>
                            <p className="text-2xl font-black text-gavel-gold margin-0">{myTrials} vụ</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-seal-silver flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-status-scheduled text-2xl">meeting_room</span>
                        </div>
                        <div>
                            <p className="text-caption text-outline margin-0 font-medium">Phòng xử đang dùng</p>
                            <p className="text-2xl font-black text-status-scheduled margin-0">{roomStats.length} phòng</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-seal-silver flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-status-completed text-2xl">percent</span>
                        </div>
                        <div>
                            <p className="text-caption text-outline margin-0 font-medium">Tỷ lệ hoàn thành</p>
                            <p className="text-2xl font-black text-status-completed margin-0">{completionRate}%</p>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Rows */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left 2 Columns: Upcoming Trials */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-seal-silver shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-title-lg text-title-lg text-judicial-navy font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined">event_upcoming</span>
                                    Lịch xét xử sắp tới trong tháng
                                </h3>
                                <p className="text-caption text-outline mt-1">Các vụ án chuẩn bị diễn ra gần nhất</p>
                            </div>
                            <Link 
                                to="/lich-tham-phan" 
                                className="text-xs font-bold text-gavel-gold hover:underline flex items-center gap-1 no-underline"
                            >
                                Xem toàn bộ lịch
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="space-y-3 flex-1">
                            {upcomingTrials.map((item) => (
                                <div key={item.id} className="p-4 rounded-lg bg-surface-container-lowest border border-seal-silver hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-judicial-navy">
                                                {new Date(item.date).toLocaleDateString("vi-VN")}
                                            </span>
                                            <span className="text-xs text-outline font-medium">
                                                ({item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)})
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                item.shift === 'Sáng' 
                                                    ? 'bg-green-50 text-status-completed border border-status-completed/20' 
                                                    : item.shift === 'Chiều'
                                                        ? 'bg-orange-50 text-status-pending border border-status-pending/20'
                                                        : 'bg-blue-50 text-status-scheduled border border-status-scheduled/20'
                                            }`}>
                                                {item.shift}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-700 font-semibold margin-0">
                                            Đương sự: <span className="text-gray-900 font-bold">{item.litigant}</span>
                                        </p>
                                        <p className="text-[11px] text-gray-500 margin-0">
                                            Tranh chấp: {item.dispute_relationship}
                                        </p>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1 text-xs">
                                        <div className="flex items-center gap-1 bg-primary-fixed/20 text-judicial-navy px-2 py-1 rounded font-bold">
                                            <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                                            {item.room}
                                        </div>
                                        <div className="text-[11px] text-outline font-medium">
                                            Thẩm phán: <span className="font-bold text-gray-700">{item.user?.username}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {upcomingTrials.length === 0 && (
                                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                    <span className="material-symbols-outlined text-4xl text-outline mb-2">event_busy</span>
                                    <p className="text-body-md text-outline font-bold margin-0">Không có phiên xét xử sắp tới nào được lên lịch.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Room Utilizations */}
                    <div className="bg-white p-6 rounded-xl border border-seal-silver shadow-sm flex flex-col">
                        <h3 className="font-title-lg text-title-lg text-judicial-navy font-bold flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined">analytics</span>
                            Tần suất sử dụng hội trường
                        </h3>
                        <p className="text-caption text-outline mb-6">Mật độ các phiên tòa diễn ra tại mỗi hội trường</p>

                        <div className="space-y-4 flex-1">
                            {roomStats.slice(0, 5).map((room) => {
                                const percentage = Math.round((room.count / maxRoomTrials) * 100);
                                return (
                                    <div key={room.name} className="space-y-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-gray-800">{room.name}</span>
                                            <span className="font-extrabold text-judicial-navy">{room.count} phiên</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-gavel-gold h-full rounded-full transition-all duration-500" 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {roomStats.length === 0 && (
                                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                    <span className="material-symbols-outlined text-4xl text-outline mb-2">bar_chart</span>
                                    <p className="text-body-md text-outline font-bold margin-0">Chưa có dữ liệu phòng xử.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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
