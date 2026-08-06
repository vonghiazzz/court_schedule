import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../utils/axios";
import { toast } from "react-toastify";
import { MONTHS, YEARS } from '../constants';
import { downloadSchedule } from "../utils/excel";

// UI Components
import Layout from "../components/Layout";
import ScheduleListTable from "../components/Calendar/ScheduleListTable";
import ChangePasswordModal from "../components/Modals/ChangePasswordModal";

// Styles
import "../styles/JudgeCalendar.css";

export default function JudgeManagement({ judgeName, onLogout, isAdmin }) {
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
    const [judges, setJudges] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
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
            console.error("Lỗi tải báo cáo quản lý:", err);
            if (!silent) toast.error("Không thể tải dữ liệu lịch!");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportMode, filterMonth, filterYear, customStartDate, customEndDate]);

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

    const removeVietnameseTones = (str) => {
        if (!str) return "";
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

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

    const handleDownloadSched = () => {
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

    return (
        <Layout 
            judgeName={judgeName} 
            onLogout={handleLogout} 
            onChangePassword={handleChangePassword}
            isAdmin={isAdmin}
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
                            Quản Lý Phiên Tòa - {getReportTitle()}
                        </h1>
                        <nav className="flex items-center gap-2 mt-2 text-caption text-outline">
                            <span>Hệ thống quản lý</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span>Quản lý phiên tòa</span>
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
