import React from 'react';

const JudgeStatsTable = ({ stats, searchJudgeTerm, setSearchJudgeTerm, onDownload }) => {
    return (
        <div style={{ marginTop: "40px" }}>
            <h3>📋 Danh sách lịch xét xử từng thẩm phán trong tháng</h3>
            <button onClick={onDownload} style={{ marginBottom: "10px" }}>⬇️ Tải về bảng Excel</button>
            <input
                type="text"
                placeholder="🔍 Tìm kiếm theo thẩm phán"
                value={searchJudgeTerm}
                onChange={(e) => setSearchJudgeTerm(e.target.value)}
                style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
            />
            <table className="stats-table">
                <thead>
                    <tr>
                        <th>Thẩm phán</th>
                        <th>Đã hoàn thành</th>
                        <th>Chưa hoàn thành</th>
                        <th>Tổng đăng ký</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(stats)
                        .filter(([name]) => name.toLowerCase().includes(searchJudgeTerm.toLowerCase()))
                        .map(([name, data], idx) => (
                            <tr key={idx}>
                                <td>{name}</td>
                                <td>{data.done}</td>
                                <td>{data.pending}</td>
                                <td>{data.total}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default JudgeStatsTable;
