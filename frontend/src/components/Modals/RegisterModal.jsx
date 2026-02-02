import React from 'react';
import { ROOMS, SHIFTS, JUROR } from '../../constants';

const RegisterModal = ({
    isOpen,
    selectedDate,
    selectedRoom,
    setSelectedRoom,
    selectedShift,
    setSelectedShift,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    selectedJurors,
    setSelectedJurors,
    litigant,
    setLitigant,
    dispute_relationship,
    setDispute_relationship,
    note,
    setNote,
    handleRegister,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "350px", maxHeight: "90vh", overflowY: "auto" }}>
                <h3>Đăng ký phiên xử</h3>
                <p><strong>Ngày xét xử:</strong> {selectedDate}</p>

                <div style={{ marginBottom: "10px" }}>
                    <label>Hội trường xét xử:</label>
                    <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} style={{ width: "100%", padding: "6px" }}>
                        <option value="">Chọn hội trường xét xử</option>
                        {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Buổi xét xử:</label>
                    <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} style={{ width: "100%", padding: "6px" }}>
                        <option value="">Chọn buổi xét xử</option>
                        {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="row mt-2" style={{ marginBottom: "10px" }}>
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

                <div style={{ marginBottom: "10px" }}>
                    <label>Hội thẩm:</label>
                    <select
                        multiple
                        value={selectedJurors}
                        onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => option.value);
                            setSelectedJurors(values);
                        }}
                        style={{ width: "100%", height: "100px", padding: "6px" }}
                    >
                        {JUROR.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group" style={{ marginBottom: "10px" }}>
                    <label>Đương sự:</label>
                    <textarea
                        className="form-control"
                        value={litigant}
                        onChange={(e) => setLitigant(e.target.value)}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: "10px" }}>
                    <label>Quan hệ tranh chấp:</label>
                    <textarea
                        className="form-control"
                        value={dispute_relationship}
                        onChange={(e) => setDispute_relationship(e.target.value)}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: "10px" }}>
                    <label>Ghi chú:</label>
                    <textarea
                        className="form-control"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between" }}>
                    <button
                        onClick={handleRegister}
                        style={{ backgroundColor: "#4caf50", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px" }}
                    >
                        Đăng ký
                    </button>
                    <button
                        onClick={onClose}
                        style={{ backgroundColor: "#ccc", border: "none", padding: "8px 16px", borderRadius: "4px" }}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
