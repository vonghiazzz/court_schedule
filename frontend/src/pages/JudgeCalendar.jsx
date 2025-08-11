import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../utils/axios";
import { toast } from "react-toastify";

const ROOMS = ["Hội trường 1", "Hội trường 2", "Hội trường 3", "Hội trường 4", "Hội trường 5", "Hội trường 6", "Hội trường 7", "Hội trường 8", "Hội trường 9", "Hội trường 10"];
const SHIFTS = ["Sáng", "Chiều"];
const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const JUROR = ["Nguyen Văn A", "Nguyen Văn B", "Nguyen Văn C","Nguyen Văn D", "Nguyen Văn E","Nguyen Văn F","Nguyen Văn G","Nguyen Văn H", "Nguyen Văn I", "Nguyen Văn K"]


export default function JudgeScheduleCalendar({ judgeName, onLogoutPropsChange }) {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedJurors, setSelectedJurors] = useState([]);
    const [selectedShift, setSelectedShift] = useState("");
    const [note, setNote] = useState("");
    const [endTime, setEndTime] = useState("");
    const [startTime, setStartTime] = useState("");
    const [searchJudgeTerm, setSearchJudgeTerm] = useState("");


    // Tạo mảng năm (vd 2020-2030) để chọn
    const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);

    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const [filterMonth, setFilterMonth] = useState(month);
    const [filterYear, setFilterYear] = useState(year);

    today.setHours(0, 0, 0, 0); // Đặt giờ về 0 để so sánh ngày chính xác

    // const daysInMonth = new Date(year, month + 1, 0).getDate();
    // const firstDayWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(filterYear, filterMonth + 1, 0).getDate();
    const firstDayWeekday = new Date(filterYear, filterMonth, 1).getDay();


    const thStyle = {
        border: "1px solid #ccc",
        padding: "8px",
        textAlign: "left"
    };

    const tdStyle = {
        border: "1px solid #ccc",
        padding: "8px"
    };

    const calendarDays = [];
    for (let i = 0; i < firstDayWeekday; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const formatDate = (d) => {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    };

    // Lọc lịch trình chỉ trong tháng hiện tại
    // const scheduleInMonth = schedule.filter(item => {
    //     const itemDate = new Date(item.date);
    //     return itemDate.getFullYear() === year && itemDate.getMonth() === month;
    // });
    const scheduleInMonth = schedule.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === filterYear && itemDate.getMonth() === filterMonth;
    });



    // Gom thống kê theo tất cả thẩm phán trong tháng
    const stats = scheduleInMonth.reduce((acc, s) => {
        const scheduleJudgeName = s.user?.username || "Không rõ";
        if (!acc[scheduleJudgeName]) {
            acc[scheduleJudgeName] = {
                done: 0,
                pending: 0,
                total: 0
            };
        }
        acc[scheduleJudgeName].total += 1;

        const scheduleDate = new Date(s.date);
        if (scheduleDate < today) {
            acc[scheduleJudgeName].done += 1;
        } else {
            acc[scheduleJudgeName].pending += 1;
        }

        return acc;
    }, {});

    // Hàm bỏ dấu tiếng Việt
const removeVietnameseTones = (str) => {
    return str
        .normalize("NFD") // tách dấu ra khỏi chữ
        .replace(/[\u0300-\u036f]/g, "") // xóa các dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

    // Lọc danh sách lịch theo từ khóa tìm kiếm
    const filteredSchedules = scheduleInMonth.filter(item => {
        const keyword = removeVietnameseTones(searchTerm.toLowerCase());

        const jurorsMatch = Array.isArray(item.jurors)
            ? item.jurors.some(juror =>
                removeVietnameseTones(juror.toLowerCase()).includes(keyword)
            )
            : removeVietnameseTones((item.jurors || "").toLowerCase()).includes(keyword);

        const matchKeyword =
            removeVietnameseTones(item.room?.toLowerCase() || "").includes(keyword) ||
            removeVietnameseTones(item.shift?.toLowerCase() || "").includes(keyword) ||
            removeVietnameseTones(item.note?.toLowerCase() || "").includes(keyword) ||
            removeVietnameseTones(item.start_time?.toLowerCase() || "").includes(keyword) ||
            removeVietnameseTones(item.end_time?.toLowerCase() || "").includes(keyword) ||
            removeVietnameseTones(item.user?.username?.toLowerCase() || "").includes(keyword) ||
            jurorsMatch ||
            removeVietnameseTones(item.date?.toLowerCase() || "").includes(keyword);

        return matchKeyword;
    });



       const openRegisterModal = (dateStr) => {
        setSelectedDate(dateStr);
        setSelectedRoom("");
        setSelectedShift("");
        setNote("");
        setEndTime("");
        setStartTime("");
        setSelectedJurors("");
        setIsModalOpen(true);
    };

    // Load lịch xét xử từ API
    useEffect(() => {
        if (sessionStorage.getItem("justLoggedIn") === "true") {
            toast.success("Đăng nhập thành công!");
            sessionStorage.removeItem("justLoggedIn");
        }
        const fetchSchedule = async () => {
            try {
                const res = await api.get("/schedule");
                setSchedule(res.data);
            } catch (err) {
                console.error("Lỗi tải lịch:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [currentDate]);

    useEffect(() => {
        setSelectedDate("");
        setIsModalOpen(false);
        }, [filterMonth, filterYear]);


    // Gửi đăng ký mới
    const handleRegister = async () => {
        if (!selectedRoom || !selectedShift || !selectedJurors || !selectedDate || !startTime || !endTime) {
            toast.warning("Vui lòng điền đầy đủ hội trường, buổi và hội thẩm.");
            return;
        }

        const count = schedule.filter(
            s => s.date === selectedDate && s.room === selectedRoom && s.shift === selectedShift
        ).length;

        if (count >= 2) {
            toast.warning("Mỗi buổi tại một hội trường chỉ được đăng ký tối đa 2 vụ xử!");
            return;
        }

        if (selectedJurors.length < 2) {
            toast.warning("Vui lòng chọn ít nhất 2 hội thẩm.");
            return;
        } 
        
        try {
            const res = await api.post("/schedule/", {
                date: selectedDate,
                room: selectedRoom,
                shift: selectedShift,
                jurors: selectedJurors,
                note: note,
                start_time: startTime,
                end_time: endTime,
            });

            setSchedule(prev => [...prev, res.data]);
            setIsModalOpen(false);
            setSelectedJurors("");
            setNote("");
            setStartTime("");
            setEndTime("");
            setSelectedRoom("");
            setSelectedShift("");
            setSelectedDate("");
            toast.success("Đăng ký lịch xét xử thành công!");
        } catch (err) {
            toast.warning("Lỗi khi đăng ký phiên xử!");
            if (err.response?.status === 400) {
                toast.warning(err.response.data.detail);
            }
            console.error(err);
        }
    };

    // 👉 Xoá lịch
    const handleDelete = async (item) => {
        const itemDate = new Date(item.date);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (itemDate < todayDate) {
            toast.warning("⛔ Không thể xoá lịch trong quá khứ!");
            return;
        }
        if (item.user?.username !== judgeName) return;
        const confirmed = window.confirm(`Bạn có chắc chắn muốn xoá lịch xử vào ngày ${item.date} không?`);
        if (!confirmed) return;
        try {
            await api.delete(`/schedule/${item.id}`);
            setSchedule(prev => prev.filter(s => s.id !== item.id));
            toast.success("Xoá lịch thành công!");
        } catch (err) {
            console.error("Lỗi xoá:", err);
            toast.warning("Không thể xoá lịch này!");
        }
    };

    const getDaySchedule = (dateStr) => {
        return scheduleInMonth.filter(s => s.date === dateStr);
    };

    const isToday = (day) => {
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };

    const changeMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(month + (direction === "next" ? 1 : -1));
        setCurrentDate(newDate);
    };

    const isPastDayOrToDay = (day) => {
        const date = new Date(year, month, day);
        const todayWithoutTime = new Date();
        return date < todayWithoutTime;
    };

    const handleLogout = () => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
        if (!confirmed) return;

        localStorage.removeItem("token");
        localStorage.removeItem("username");

        if (onLogoutPropsChange) {
            onLogoutPropsChange.setToken(null);
            onLogoutPropsChange.setUsername(null);
        }

        toast.success("Đăng xuất thành công!");
        navigate('/login');
    };

    return (
        <div style={{ maxWidth: "100%", margin: "0 auto", padding: "20px", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}>
            <h1 style={{ textAlign: "center", fontSize: "40px" }}>
                Lịch Đăng Ký Phiên Xét Xử - {MONTHS[filterMonth]} {filterYear}
            </h1>

            {/* Chọn tháng & năm lọc */}
            <div style={{ marginBottom: "10px", display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
            <label>Chọn tháng: </label>
            <select value={filterMonth} onChange={e => setFilterMonth(parseInt(e.target.value))} style={{ padding: "5px" }}>
                {MONTHS.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
            </select>

            <label>Chọn năm: </label>
            <select value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))} style={{ padding: "5px" }}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ marginRight: "10px" }}>👤 Xin chào, <strong>{judgeName?.toUpperCase()}</strong></span>
                <button
                    onClick={handleLogout}
                    style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                    Đăng xuất
                </button>
            </div>

            <div style={{ textAlign: "center", margin: "10px 0" }}>
                <button onClick={() => changeMonth("prev")}>⬅️</button>
                <button onClick={() => setCurrentDate(new Date())} style={{ margin: "0 10px" }}>Hôm nay</button>
                <button onClick={() => changeMonth("next")}>➡️</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: "bold" }}>
                {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {calendarDays.map((day, idx) => {
                    if (!day) return <div key={idx}></div>;
                    const dateStr = formatDate(day);
                    const dayEvents = getDaySchedule(dateStr);
                    return (
                        <div key={day}
                            style={{
                                border: "1px solid #ccc",
                                padding: "6px",
                                minHeight: "100px",
                                backgroundColor: isToday(day) ? "#4bd943ff" : isPastDayOrToDay(day) ? "#ddd" : "#a5c8ebff",
                                cursor: isPastDayOrToDay(day) ? "not-allowed" : "pointer"
                            }}
                            onClick={() => {
                                if (!isPastDayOrToDay(day)) openRegisterModal(dateStr);
                            }}
                        >
                            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{day}</div>
                            {dayEvents.map((ev, i) => (
                                <div key={i} style={{
                                    fontSize: "12px",
                                    backgroundColor: ev.user?.username === judgeName ? "#55d099ff" : "#bfc4b7ff",
                                    padding: "2px 4px",
                                    margin: "2px 0",
                                    borderRadius: "4px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <span>{ev.room} - {ev.shift}</span><br />
                                    <span style={{ fontStyle: "italic" }}>{ev.user?.username || "?"}</span>
                                    {ev.user?.username === judgeName && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(ev);
                                            }}
                                            style={{ float: "right", border: "none", background: "none", color: "red" }}
                                        >
                                            ❌
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "300px" }}>
                        <h3>Đăng ký phiên xử</h3>
                        <p><strong>Ngày xét xử:</strong> {selectedDate}</p>
                        <div>
                            <label>Hội trường xét xử:</label>
                            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} style={{ width: "100%" }}>
                                <option value="">Chọn hội trường xét xử</option>
                                {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div style={{ marginTop: "10px" }}>
                            <label>Buổi xét xử:</label>
                            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} style={{ width: "100%" }}>
                                <option value="">Chọn buổi xét xử</option>
                                {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="row mt-2">
                            <div className="col-md-6">
                                <label>Giờ bắt đầu:</label>
                                <input
                                type="time"
                                className="form-control"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label>Giờ kết thúc:</label>
                                <input
                                type="time"
                                className="form-control"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                            </div>

                       
                        <div style={{ marginTop: "10px" }}>
                            <label>Hội thẩm:</label>
                            <select
                                multiple
                                value={selectedJurors}
                                onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                    setSelectedJurors(values);
                                }}
                                style={{ width: "100%", height: "100px" }}
                            >
                                {JUROR.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Ghi chú:</label>
                            <textarea
                                className="form-control"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                        <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between" }}>
                            <button onClick={handleRegister}>Đăng ký</button>
                            <button onClick={() => setIsModalOpen(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: "40px" }}>
                <h3>📋 Danh sách lịch xét xử từng thẩm phán trong tháng</h3>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo thẩm phán"
                    value={searchJudgeTerm}
                    onChange={(e) => setSearchJudgeTerm(e.target.value)}
                    style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
                />
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#38b9ecff" }}>
                            <th style={thStyle}>Thẩm phán</th>
                            <th style={thStyle}>Đã hoàn thành</th>
                            <th style={thStyle}>Chưa hoàn thành</th>
                            <th style={thStyle}>Tổng đăng ký</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(stats)
                            .filter(([name]) => name.toLowerCase().includes(searchJudgeTerm.toLowerCase()))
                            .map(([name, data], idx) => (
                                <tr key={idx}>
                                    <td style={tdStyle}>{name}</td>
                                    <td style={tdStyle}>{data.done}</td>
                                    <td style={tdStyle}>{data.pending}</td>
                                    <td style={tdStyle}>{data.total}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: "40px" }}>
                <h3>📋 Danh sách lịch xét xử trong tháng</h3>
                <h5>🧾 Tổng số vụ xét xử trong tháng: {filteredSchedules.length} vụ</h5>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo thẩm phán, hội trường, hội thẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
                />
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#38b9ecff" }}>
                            <th style={thStyle}>Ngày</th>
                            <th style={thStyle}>Buổi</th>
                            <th style={thStyle}>Thời gian</th>
                            <th style={thStyle}>Hội trường</th>
                            <th style={thStyle}>Thẩm phán</th>
                            <th style={thStyle}>Hội thẩm</th>
                            <th style={thStyle}>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...filteredSchedules]
                            .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sắp tăng dần theo ngày
                            .map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid #ccc" }}>
                                    <td style={tdStyle}>{item.date}</td>
                                    <td style={tdStyle}>{item.shift}</td>
                                    <td style={tdStyle}>{item.start_time}-{item.end_time}</td>
                                    <td style={tdStyle}>{item.room}</td>
                                    <td style={tdStyle}>{item.user?.username}</td>
                                    <td style={tdStyle}>
                                        {Array.isArray(item.jurors) ? item.jurors.join(", ") : item.jurors}
                                    </td>
                                    <td style={tdStyle}>{item.note || ""}</td>
                                </tr>
                            ))}
                        {filteredSchedules.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
                                    Không có lịch phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
}
