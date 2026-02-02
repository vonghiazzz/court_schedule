import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

export const formatDateForExcel = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
};

export const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.slice(0, 5); // lấy HH:mm, bỏ giây
};

export const downloadJudgeStats = (stats, searchJudgeTerm) => {
    const data = Object.entries(stats)
        .filter(([name]) => name.toLowerCase().includes(searchJudgeTerm.toLowerCase()))
        .map(([name, d], index) => ({
            "STT": index + 1,
            "Thẩm phán": name,
            "Đã hoàn thành": d.done,
            "Chưa hoàn thành": d.pending,
            "Tổng đăng ký": d.total
        }));

    if (data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(data);

    const colWidths = Object.keys(data[0]).map((key) => ({
        wch: Math.max(
            key.length,
            ...data.map((row) => (row[key] ? row[key].toString().length : 0))
        ) + 2
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "JudgeStats");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "JudgeStats.xlsx");
};

export const downloadSchedule = (filteredSchedules) => {
    const sortedData = [...filteredSchedules].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const data = sortedData.map((item, index) => ({
        "STT": index + 1,
        "Thời gian xét xử": `${formatDateForExcel(item.date)}\n${formatTime(item.start_time)} - ${formatTime(item.end_time)}`,
        "Đương sự": item.litigant,
        "Quan hệ tranh chấp": item.dispute_relationship,
        "Hội trường": item.room,
        "Hội thẩm nhân dân": Array.isArray(item.jurors) ? item.jurors.join("\n") : item.jurors,
        "Thẩm phán (Chủ tọa)": item.user?.username,
        "Ghi chú": item.note || ""
    }));

    if (data.length === 0) return false;

    const ws = XLSX.utils.json_to_sheet(data);

    Object.keys(ws).forEach((cell) => {
        if (cell[0] === "!") return;
        ws[cell].s = {
            alignment: {
                vertical: "center",
                horizontal: "center",
                wrapText: true
            },
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };
    });

    const colWidths = Object.keys(data[0]).map((key) => ({
        wch: Math.max(
            key.length,
            ...data.map((row) => (row[key] ? row[key].toString().length : 0))
        ) + 2
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "Schedule.xlsx");
    return true;
};
