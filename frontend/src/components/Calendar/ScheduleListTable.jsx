import React from 'react';

const ScheduleListTable = ({
    filteredSchedules,
    searchTerm,
    setSearchTerm,
    onDownload
}) => {
    return (
        <div style={{ marginTop: "40px" }}>
            <h3>📋 Danh sách lịch xét xử trong tháng</h3>
            <button onClick={onDownload} style={{ marginBottom: "10px" }}>⬇️ Tải về bảng Excel</button>
            <h5>🧾 Tổng số vụ xét xử trong tháng: {filteredSchedules.length} vụ</h5>
            <input
                type="text"
                placeholder="🔍 Tìm kiếm theo thẩm phán, hội trường, hội thẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
            />
            <table className="schedule-list-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Ngày</th>
                        <th>Buổi</th>
                        <th>Thời gian</th>
                        <th>Hội trường</th>
                        <th>Đương sự</th>
                        <th>Quan hệ tranh chấp</th>
                        <th>Thẩm phán</th>
                        <th>Hội thẩm</th>
                        <th>Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {[...filteredSchedules]
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((item, idx) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid #ccc" }}>
                                <td>{idx + 1}</td>
                                <td>{new Date(item.date).toLocaleDateString("vi-VN")}</td>
                                <td>{item.shift}</td>
                                <td>{item.start_time}-{item.end_time}</td>
                                <td>{item.room}</td>
                                <td>{item.litigant}</td>
                                <td>{item.dispute_relationship}</td>
                                <td>{item.user?.username}</td>
                                <td>
                                    {Array.isArray(item.jurors) ? item.jurors.join(", ") : item.jurors}
                                </td>
                                <td>{item.note || ""}</td>
                            </tr>
                        ))}
                    {filteredSchedules.length === 0 && (
                        <tr>
                            <td colSpan="9" style={{ textAlign: "center", padding: "10px" }}>
                                Không có lịch phù hợp.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleListTable;
