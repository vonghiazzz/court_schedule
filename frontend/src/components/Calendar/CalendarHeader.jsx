import React from 'react';
import { MONTHS, YEARS } from '../../constants';

const CalendarHeader = ({
    filterMonth, setFilterMonth,
    filterYear, setFilterYear,
    judgeName,
    onLogout,
    onChangePassword
}) => {
    return (
        <div className="calendar-header-wrapper">
            <h1 style={{ textAlign: "center", fontSize: "40px" }}>
                Lịch Đăng Ký Phiên Xét Xử - {MONTHS[filterMonth]} {filterYear}
            </h1>

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
                    onClick={onChangePassword}
                    style={{ backgroundColor: "#2196f3", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", marginRight: "8px" }}>
                    Đổi mật khẩu
                </button>
                <button
                    onClick={onLogout}
                    style={{ backgroundColor: "#f44336", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default CalendarHeader;
