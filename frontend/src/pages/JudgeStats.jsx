import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../utils/axios";
import { toast } from "react-toastify";
import { MONTHS, YEARS } from '../constants';
import { downloadJudgeStats, downloadSchedule } from "../utils/excel";

// UI Components
import Layout from "../components/Layout";
import JudgeStatsTable from "../components/Calendar/JudgeStatsTable";
import ScheduleListTable from "../components/Calendar/ScheduleListTable";
import ChangePasswordModal from "../components/Modals/ChangePasswordModal";

// Styles
import "../styles/JudgeCalendar.css";

export default function JudgeStats({ judgeName, onLogout }) {
    const navigate = useNavigate();
    const [reportMode, setReportMode] = useState("month");
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    
    const getTodayDateString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    const [customStartDate, setCustomStartDate] = useState(getTodayDateString());
    const [customEndDate, setCustomEndDate] = useState(getTodayDateString());
    const [selectedJudge, setSelectedJudge] = useState("");
    const [searchJudgeTerm, setSearchJudgeTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [judges, setJudges] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);

    // Password State
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");



    // Load judges
    useEffect(() => {
        const fetchJudges = async () => {
            try {
                const res = await api.get('/users');
                setJudges(res.data);
            } catch (err) {
                console.error("Lỗi tải danh sách thẩm phán:", err);
            }
        };
        fetchJudges();
    }, []);

    // Fetch report data
    const fetchReportData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const params = {};
            if (reportMode === 'month') {
                params.month = filterMonth + 1;
                params.year = filterYear;
            } else if (reportMode === 'custom') {
                params.start_date = customStartDate;
                params.end_date = customEndDate;
            }
            
            const res = await api.get("/schedule", { params });
            setSchedule(res.data);
        } catch (err) {
            console.error("Lỗi tải báo cáo:", err);
            if (!silent) toast.error("Không thể tải dữ liệu báo cáo!");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportMode, filterMonth, filterYear, customStartDate, customEndDate]);

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

    const removeVietnameseTones = (str) => {
        if (!str) return "";
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

    // Filter schedules based on judge selection and local search
    const filteredSchedules = useMemo(() => {
        let list = [...schedule];
        if (selectedJudge) {
            list = list.filter(s => s.user?.username === selectedJudge);
        }
        
        if (searchTerm) {
            const keyword = removeVietnameseTones(searchTerm.toLowerCase());
            list = list.filter(item => {
                const jurorsMatch = Array.isArray(item.jurors)
                    ? item.jurors.some(juror => removeVietnameseTones(juror.toLowerCase()).includes(keyword))
                    : removeVietnameseTones((item.jurors || "").toLowerCase()).includes(keyword);

                return (
                    removeVietnameseTones(item.room?.toLowerCase() || "").includes(keyword) ||
                    removeVietnameseTones(item.shift?.toLowerCase() || "").includes(keyword) ||
                    removeVietnameseTones(item.note?.toLowerCase() || "").includes(keyword) ||
                    removeVietnameseTones(item.dispute_relationship?.toLowerCase() || "").includes(keyword) ||
                    removeVietnameseTones(item.litigant?.toLowerCase() || "").includes(keyword) ||
                    removeVietnameseTones(item.start_time?.toLowerCase() || "").includes(keyword) ||
                    removeVietnameseTones(item.end_time?.toLowerCase() || "").includes(keyword) ||
                    removeVietnameseTones(item.user?.username?.toLowerCase() || "").includes(keyword) ||
                    jurorsMatch ||
                    removeVietnameseTones(item.date?.toLowerCase() || "").includes(keyword)
                );
            });
        }
        return list;
    }, [schedule, selectedJudge, searchTerm]);

    // Group statistics of judges in the selected range
    const stats = useMemo(() => {
        const todayNoTime = new Date();
        todayNoTime.setHours(0, 0, 0, 0);

        return schedule.reduce((acc, s) => {
            const name = s.user?.username || "Không rõ";
            if (!acc[name]) acc[name] = { done: 0, pending: 0, total: 0 };
            acc[name].total += 1;
            
            const parts = s.date.split("-").map(Number);
            const sDate = new Date(parts[0], parts[1] - 1, parts[2]);
            if (sDate < todayNoTime) acc[name].done += 1;
            else acc[name].pending += 1;
            return acc;
        }, {});
    }, [schedule]);

    const handleDownloadStats = () => {
        downloadJudgeStats(stats, searchJudgeTerm);
    };

    const handleDownloadScheds = () => {
        const success = downloadSchedule(filteredSchedules);
        if (!success) toast.warning("Không có lịch xét xử!");
    };

    const getReportTitle = () => {
        if (reportMode === 'month') {
            return `${MONTHS[filterMonth]} ${filterYear}`;
        } else {
            const startStr = customStartDate.split('-').reverse().join('/');
            const endStr = customEndDate.split('-').reverse().join('/');
            return `Từ ${startStr} đến ${endStr}`;
        }
    };

    const todayNoTime = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const doneCount = useMemo(() => {
        return filteredSchedules.filter(s => {
            const parts = s.date.split("-").map(Number);
            const sDate = new Date(parts[0], parts[1] - 1, parts[2]);
            return sDate < todayNoTime;
        }).length;
    }, [filteredSchedules, todayNoTime]);

    const pendingCount = useMemo(() => {
        return filteredSchedules.filter(s => {
            const parts = s.date.split("-").map(Number);
            const sDate = new Date(parts[0], parts[1] - 1, parts[2]);
            return sDate >= todayNoTime;
        }).length;
    }, [filteredSchedules, todayNoTime]);

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
                            Thống Kê Phiên Xét Xử - {getReportTitle()}
                        </h1>
                        <nav className="flex items-center gap-2 mt-2 text-caption text-outline">
                            <span>Hệ thống quản lý</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span>Thống kê phiên xử</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="text-judicial-navy font-bold">{getReportTitle()}</span>
                        </nav>
                    </div>
                    
                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-seal-silver">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-outline uppercase pl-1">Chế độ lọc</label>
                            <select 
                                value={reportMode} 
                                onChange={e => setReportMode(e.target.value)}
                                className="border border-seal-silver bg-surface-container-low rounded-lg px-2 py-1 text-body-md focus:ring-2 focus:ring-gavel-gold outline-none font-medium text-judicial-navy"
                            >
                                <option value="month">Theo tháng</option>
                                <option value="custom">Khoảng ngày</option>
                            </select>
                        </div>

                        {reportMode === 'month' && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Chọn tháng</label>
                                    <select 
                                        value={filterMonth} 
                                        onChange={e => setFilterMonth(parseInt(e.target.value))}
                                        className="border border-seal-silver bg-surface-container-low rounded-lg px-2 py-1 text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                                    >
                                        {MONTHS.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Chọn năm</label>
                                    <select 
                                        value={filterYear} 
                                        onChange={e => setFilterYear(parseInt(e.target.value))}
                                        className="border border-seal-silver bg-surface-container-low rounded-lg px-2 py-1 text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                                    >
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </>
                        )}



                        {reportMode === 'custom' && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Từ ngày</label>
                                    <input 
                                        type="date" 
                                        value={customStartDate} 
                                        onChange={e => setCustomStartDate(e.target.value)}
                                        className="border border-seal-silver bg-surface-container-low rounded-lg px-2 py-0.5 text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-outline uppercase pl-1">Đến ngày</label>
                                    <input 
                                        type="date" 
                                        value={customEndDate} 
                                        onChange={e => setCustomEndDate(e.target.value)}
                                        className="border border-seal-silver bg-surface-container-low rounded-lg px-2 py-0.5 text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-outline uppercase pl-1">Chọn thẩm phán</label>
                            <select 
                                value={selectedJudge} 
                                onChange={e => setSelectedJudge(e.target.value)}
                                className="border border-seal-silver bg-surface-container-low rounded-lg px-2 py-1 text-body-md focus:ring-2 focus:ring-gavel-gold outline-none font-medium text-judicial-navy"
                            >
                                <option value="">Tất cả thẩm phán</option>
                                {judges.map(j => <option key={j.id} value={j.username}>{j.username}</option>)}
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
                            <p className="text-caption text-outline margin-0">Tổng số phiên trong khoảng lọc</p>
                            <p className="text-title-lg font-bold text-judicial-navy margin-0">{filteredSchedules.length}</p>
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

                {/* Statistical summary table (only when viewing all judges) */}
                {!selectedJudge && (
                    <JudgeStatsTable
                        stats={stats}
                        searchJudgeTerm={searchJudgeTerm}
                        setSearchJudgeTerm={setSearchJudgeTerm}
                        onDownload={handleDownloadStats}
                    />
                )}

                {/* Detailed schedule list for the selected range/judge */}
                <ScheduleListTable
                    filteredSchedules={filteredSchedules}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onDownload={handleDownloadScheds}
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
