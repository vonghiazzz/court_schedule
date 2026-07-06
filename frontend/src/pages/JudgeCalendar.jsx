import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../utils/axios";
import { toast } from "react-toastify";
import { downloadJudgeStats, downloadSchedule } from "../utils/excel";

// Hooks
import { useCalendarData } from "../hooks/useCalendarData";

// UI Components
import ChangePasswordModal from "../components/Modals/ChangePasswordModal";
import RegisterModal from "../components/Modals/RegisterModal";
import CalendarHeader from "../components/Calendar/CalendarHeader";
import CalendarGrid from "../components/Calendar/CalendarGrid";
import JudgeStatsTable from "../components/Calendar/JudgeStatsTable";
import ScheduleListTable from "../components/Calendar/ScheduleListTable";

// Styles
import "../styles/JudgeCalendar.css";

export default function JudgeScheduleCalendar({ judgeName, onLogout }) {
    const navigate = useNavigate();
    const [currentDate] = useState(new Date());
    const [filterMonth, setFilterMonth] = useState(currentDate.getMonth());
    const [filterYear, setFilterYear] = useState(currentDate.getFullYear());
    const [searchTerm, setSearchTerm] = useState("");
    const [searchJudgeTerm, setSearchJudgeTerm] = useState("");

    // Hook for data logic
    const { schedule, filteredSchedules, stats, fetchSchedule, loading } = useCalendarData(
        currentDate, filterMonth, filterYear, searchTerm
    );

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
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

    useEffect(() => {
        document.title = "Lịch Đăng Ký Phiên Xét Xử";
        if (sessionStorage.getItem("justLoggedIn") === "true") {
            toast.success("Đăng nhập thành công!");
            sessionStorage.removeItem("justLoggedIn");
        }
    }, []);

    useEffect(() => {
        setSelectedDate("");
        setIsModalOpen(false);
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

    const handleDownloadStats = () => {
        downloadJudgeStats(stats, searchJudgeTerm);
    };

    const handleDownloadSched = () => {
        const success = downloadSchedule(filteredSchedules);
        if (!success) toast.warning("Không có lịch xét xử!");
    };

    return (
        <div className="calendar-page-container">
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            <CalendarHeader
                filterMonth={filterMonth} setFilterMonth={setFilterMonth}
                filterYear={filterYear} setFilterYear={setFilterYear}
                judgeName={judgeName}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
            />

            <CalendarGrid
                calendarDays={calendarDays}
                isToday={isToday}
                isPastDayOrToDay={isPastDayOrToDay}
                formatDate={formatDateStr}
                getDaySchedule={getDaySchedule}
                openRegisterModal={openRegisterModal}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                judgeName={judgeName}
            />

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

            <JudgeStatsTable
                stats={stats}
                searchJudgeTerm={searchJudgeTerm}
                setSearchJudgeTerm={setSearchJudgeTerm}
                onDownload={handleDownloadStats}
            />

            <ScheduleListTable
                filteredSchedules={filteredSchedules}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onDownload={handleDownloadSched}
            />
        </div>
    );
}
