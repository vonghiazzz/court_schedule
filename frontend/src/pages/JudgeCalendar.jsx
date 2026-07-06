import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../utils/axios";
import { toast } from "react-toastify";


// Constants
import { MONTHS, YEARS } from '../constants';

// Hooks
import { useCalendarData } from "../hooks/useCalendarData";

// UI Components
import Layout from "../components/Layout";
import ChangePasswordModal from "../components/Modals/ChangePasswordModal";
import RegisterModal from "../components/Modals/RegisterModal";
import CalendarGrid from "../components/Calendar/CalendarGrid";



// Styles
import "../styles/JudgeCalendar.css";

const getVietnameseDayOfWeek = (dateStr) => {
    try {
        const date = new Date(dateStr);
        const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        return days[date.getDay()];
    } catch (e) {
        return "";
    }
};

export default function JudgeScheduleCalendar({ judgeName, onLogout }) {
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [filterMonth, setFilterMonth] = useState(currentDate.getMonth());
    const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
    const [searchTerm, setSearchTerm] = useState("");


    // Hook for data logic
    const { schedule, filteredSchedules, stats, fetchSchedule, loading } = useCalendarData(
        currentDate, filterMonth, filterYear, searchTerm
    );

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    });
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedJurors, setSelectedJurors] = useState([]);
    const [selectedShift, setSelectedShift] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [litigant, setLitigant] = useState("");
    const [dispute_relationship, setDispute_relationship] = useState("");
    const [note, setNote] = useState("");
    const [editScheduleId, setEditScheduleId] = useState(null);

    // Password State
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    useEffect(() => {
        document.title = "Lịch Đăng Ký Phiên Xét Xử";
        if (sessionStorage.getItem("justLoggedIn") === "true") {
            toast.success("Đăng nhập thành công!");
            sessionStorage.removeItem("justLoggedIn");
        }
    }, []);

    // Sync selectedDate when month/year changes
    useEffect(() => {
        const [year, month] = selectedDate.split('-').map(Number);
        if (year !== filterYear || month !== (filterMonth + 1)) {
            setSelectedDate(`${filterYear}-${String(filterMonth + 1).padStart(2, '0')}-01`);
        }
        setIsModalOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterMonth, filterYear]);

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

    const openRegisterModal = (dateStr) => {
        setSelectedDate(dateStr);
        setSelectedRoom("");
        setSelectedShift("");
        setNote("");
        setDispute_relationship("");
        setLitigant("");
        setEndTime("");
        setStartTime("");
        setSelectedJurors([]);
        setEditScheduleId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditScheduleId(item.id);
        setSelectedDate(item.date);
        setSelectedRoom(item.room);
        setSelectedShift(item.shift);
        setSelectedJurors(item.jurors);
        setNote(item.note || "");
        setDispute_relationship(item.dispute_relationship || "");
        setLitigant(item.litigant || "");
        setStartTime(item.start_time || "");
        setEndTime(item.end_time || "");
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        const itemDate = new Date(item.date);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (itemDate < todayDate) {
            toast.warning("⛔ Không thể xoá lịch trong quá khứ!");
            return;
        }
        if (item.user?.username !== judgeName) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xoá lịch xử vào ngày ${item.date} không?`)) return;

        try {
            await api.delete(`/schedule/${item.id}`);
            toast.success("Xoá lịch thành công!");
            await fetchSchedule(true);
        } catch (err) {
            console.error("Lỗi xoá:", err);
            toast.warning("Không thể xoá lịch này!");
        }
    };

    const handleRegister = async () => {
        if (!selectedRoom || !selectedShift || !selectedJurors.length || !selectedDate || !startTime || !endTime) {
            toast.warning("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        if (selectedShift === "Sáng" && (startTime > "12:00" || endTime > "12:00")) {
            toast.warning("Buổi sáng chỉ được chọn giờ từ 00:00 đến 12:00");
            return;
        } else if (selectedShift === "Chiều" && (startTime < "12:01" || endTime < "12:01")) {
            toast.warning("Buổi chiều chỉ được chọn giờ từ 12:01 đến 23:59");
            return;
        }

        const count = schedule.filter(s => s.date === selectedDate && s.room === selectedRoom && s.shift === selectedShift).length;
        if (!editScheduleId && count >= 2) {
            toast.warning("Mỗi buổi tại một hội trường chỉ được đăng ký tối đa 2 vụ xử!");
            return;
        }

        if (selectedJurors.length < 2) {
            toast.warning("Vui lòng chọn ít nhất 2 hội thẩm.");
            return;
        }

        const payload = {
            date: selectedDate,
            room: selectedRoom,
            shift: selectedShift,
            jurors: selectedJurors,
            note,
            litigant,
            dispute_relationship,
            start_time: startTime,
            end_time: endTime,
        };

        try {
            if (editScheduleId) {
                await api.put(`/schedule/${editScheduleId}`, payload);
                toast.success("Cập nhật lịch thành công!");
            } else {
                await api.post("/schedule/", payload);
                toast.success("Đăng ký lịch thành công!");
            }
            setIsModalOpen(false);
            await fetchSchedule(true); // Silent reload after mutation
        } catch (err) {
            toast.warning(err.response?.data?.detail || "Lỗi khi đăng ký/cập nhật phiên xử!");
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

    // Calendar Helper Functions
    const daysInMonth = new Date(filterYear, filterMonth + 1, 0).getDate();
    const firstDayWeekday = new Date(filterYear, filterMonth, 1).getDay();
    const calendarDays = [];
    const startDayOffset = (firstDayWeekday + 6) % 7;
    for (let i = 0; i < startDayOffset; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const formatDateStr = (d) => `${filterYear}-${String(filterMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const getDaySchedule = (dateStr) => schedule.filter(s => s.date === dateStr);

    const isToday = (day) => {
        const today = new Date();
        return today.getFullYear() === filterYear && today.getMonth() === filterMonth && today.getDate() === day;
    };

    const isPastDayOrToDay = (day) => {
        const date = new Date(filterYear, filterMonth, day);
        const todayNoTime = new Date();
        todayNoTime.setHours(0, 0, 0, 0);
        return date < todayNoTime;
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

            {/* Dashboard area */}
            <div className="p-4 md:p-10 space-y-6">
                
                {/* Header / Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg text-judicial-navy font-bold">
                            Lịch Đăng Ký Phiên Xét Xử - {MONTHS[filterMonth]} {filterYear}
                        </h1>
                        <nav className="flex items-center gap-2 mt-2 text-caption text-outline">
                            <span>Hệ thống quản lý</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span>Lịch phiên tòa</span>
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
                            <p className="text-title-lg font-bold text-status-completed margin-0">
                                {schedule.filter(s => new Date(s.date) < today).length}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-seal-silver flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-status-scheduled">event_repeat</span>
                        </div>
                        <div>
                            <p className="text-caption text-outline margin-0">Đang chờ</p>
                            <p className="text-title-lg font-bold text-status-scheduled margin-0">
                                {schedule.filter(s => new Date(s.date) >= today).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Calendar Grid */}
                <CalendarGrid
                    calendarDays={calendarDays}
                    isToday={isToday}
                    isPastDayOrToDay={isPastDayOrToDay}
                    formatDate={formatDateStr}
                    getDaySchedule={getDaySchedule}
                    setSelectedDate={setSelectedDate}
                    openRegisterModal={openRegisterModal}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    judgeName={judgeName}
                />

                {/* Detailed Panel for selected date (Interactive Section) */}
                {selectedDate && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gavel-gold border border-seal-silver mt-8 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <h3 className="font-title-lg text-title-lg text-judicial-navy flex items-center gap-2 font-bold">
                                <span className="material-symbols-outlined">event_available</span>
                                Chi tiết phiên xử: {getVietnameseDayOfWeek(selectedDate)}, ngày {new Date(selectedDate).toLocaleDateString("vi-VN")}
                            </h3>
                            
                            {new Date(selectedDate) >= today && (
                                <button 
                                    onClick={() => openRegisterModal(selectedDate)}
                                    className="bg-judicial-navy text-white px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all text-xs border-none cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Đăng ký phiên xử mới
                                </button>
                            )}
                        </div>

                        {/* Desktop View (Table) */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border border-seal-silver">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-caption font-bold uppercase tracking-wider text-outline">
                                        <th className="px-4 py-3 border-b border-seal-silver">Giờ xử</th>
                                        <th className="px-4 py-3 border-b border-seal-silver">Hội trường</th>
                                        <th className="px-4 py-3 border-b border-seal-silver">Buổi</th>
                                        <th className="px-4 py-3 border-b border-seal-silver">Thẩm phán</th>
                                        <th className="px-4 py-3 border-b border-seal-silver">Đương sự</th>
                                        <th className="px-4 py-3 border-b border-seal-silver">Quan hệ tranh chấp</th>
                                        <th className="px-4 py-3 border-b border-seal-silver">Hội thẩm</th>
                                        <th className="px-4 py-3 border-b border-seal-silver">Ghi chú</th>
                                        <th className="px-4 py-3 border-b border-seal-silver text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="text-body-md">
                                    {getDaySchedule(selectedDate).map((ev, i) => {
                                        const isOwnEvent = ev.user?.username === judgeName;
                                        const isFuture = new Date(ev.date) >= today;
                                        
                                        return (
                                            <tr key={i} className="hover:bg-surface-container-low/40 transition-colors border-b border-seal-silver last:border-none">
                                                <td className="px-4 py-3 font-semibold text-gray-700">{ev.start_time?.slice(0, 5)} - {ev.end_time?.slice(0, 5)}</td>
                                                <td className="px-4 py-3 font-bold text-judicial-navy">{ev.room}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        ev.shift === 'Sáng' 
                                                            ? 'bg-green-50 text-status-completed border border-status-completed/20' 
                                                            : ev.shift === 'Chiều'
                                                                ? 'bg-orange-50 text-status-pending border border-status-pending/20'
                                                                : 'bg-blue-50 text-status-scheduled border border-status-scheduled/20'
                                                    }`}>
                                                        {ev.shift}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-judicial-navy">{ev.user?.username}</td>
                                                <td className="px-4 py-3 text-gray-700 font-medium">{ev.litigant}</td>
                                                <td className="px-4 py-3 text-gray-600">{ev.dispute_relationship}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {Array.isArray(ev.jurors) ? ev.jurors.join(", ") : ev.jurors}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 italic max-w-xs truncate" title={ev.note}>{ev.note || ""}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {isOwnEvent && isFuture ? (
                                                        <div className="flex gap-2 justify-center">
                                                            <button 
                                                                onClick={() => handleEdit(ev)}
                                                                className="p-1 hover:bg-gray-100 text-blue-600 border-none bg-none cursor-pointer flex items-center rounded"
                                                                title="Sửa"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(ev)}
                                                                className="p-1 hover:bg-red-50 text-red-600 border-none bg-none cursor-pointer flex items-center rounded"
                                                                title="Xóa"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-caption text-outline">Không khả dụng</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {getDaySchedule(selectedDate).length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="text-center py-6 text-outline bg-gray-50 font-semibold">
                                                Không có lịch xét xử nào đăng ký cho ngày này.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View (Cards list) */}
                        <div className="block md:hidden space-y-4">
                            {getDaySchedule(selectedDate).map((ev, i) => {
                                const isOwnEvent = ev.user?.username === judgeName;
                                const isFuture = new Date(ev.date) >= today;
                                return (
                                    <div key={i} className="bg-surface-container-lowest p-4 rounded-xl border border-seal-silver shadow-sm space-y-3 relative">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-outline uppercase">Thời gian & Phòng</span>
                                                <span className="font-bold text-judicial-navy text-sm">{ev.room} ({ev.start_time?.slice(0, 5)} - {ev.end_time?.slice(0, 5)})</span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                ev.shift === 'Sáng' 
                                                    ? 'bg-green-50 text-status-completed border border-status-completed/20' 
                                                    : ev.shift === 'Chiều'
                                                        ? 'bg-orange-50 text-status-pending border border-status-pending/20'
                                                        : 'bg-blue-50 text-status-scheduled border border-status-scheduled/20'
                                            }`}>
                                                {ev.shift}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="block text-outline text-[10px] uppercase font-bold">Thẩm phán</span>
                                                <span className="font-bold text-gray-800">{ev.user?.username}</span>
                                            </div>
                                            <div>
                                                <span className="block text-outline text-[10px] uppercase font-bold">Đương sự</span>
                                                <span className="font-semibold text-gray-800">{ev.litigant}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs">
                                            <span className="block text-outline text-[10px] uppercase font-bold">Quan hệ tranh chấp</span>
                                            <span className="text-gray-700">{ev.dispute_relationship}</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="block text-outline text-[10px] uppercase font-bold">Hội thẩm nhân dân</span>
                                            <span className="text-gray-700">{Array.isArray(ev.jurors) ? ev.jurors.join(", ") : ev.jurors}</span>
                                        </div>
                                        {ev.note && (
                                            <div className="text-xs italic text-gray-500 bg-gray-50 p-2 rounded">
                                                * {ev.note}
                                            </div>
                                        )}
                                        {isOwnEvent && isFuture && (
                                            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                                                <button 
                                                    onClick={() => handleEdit(ev)}
                                                    className="px-3 py-1.5 hover:bg-gray-100 text-blue-600 border border-blue-200 bg-white cursor-pointer flex items-center gap-1 rounded-md text-xs font-semibold"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                                    Sửa
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(ev)}
                                                    className="px-3 py-1.5 hover:bg-red-50 text-red-600 border border-red-200 bg-white cursor-pointer flex items-center gap-1 rounded-md text-xs font-semibold"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {getDaySchedule(selectedDate).length === 0 && (
                                <div className="text-center py-6 text-outline bg-gray-50 font-semibold rounded-lg border border-dashed border-slate-300 text-sm">
                                    Không có lịch xét xử nào đăng ký cho ngày này.
                                </div>
                            )}
                        </div>
                    </div>
                )}




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

            <RegisterModal
                isOpen={isModalOpen}
                selectedDate={selectedDate}
                selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom}
                selectedShift={selectedShift} setSelectedShift={setSelectedShift}
                startTime={startTime} setStartTime={setStartTime}
                endTime={endTime} setEndTime={setEndTime}
                selectedJurors={selectedJurors} setSelectedJurors={setSelectedJurors}
                litigant={litigant} setLitigant={setLitigant}
                dispute_relationship={dispute_relationship} setDispute_relationship={setDispute_relationship}
                note={note} setNote={setNote}
                handleRegister={handleRegister}
                onClose={() => setIsModalOpen(false)}
            />
        </Layout>
    );
}
