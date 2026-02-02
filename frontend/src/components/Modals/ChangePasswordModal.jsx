import React from 'react';

const ChangePasswordModal = ({
    isOpen,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    submitChangePassword,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "400px" }}>
                <h3>🔑 Đổi mật khẩu</h3>
                <div style={{ marginBottom: "10px" }}>
                    <label>Mật khẩu cũ:</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>Mật khẩu mới:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>Xác nhận mật khẩu mới:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                    <button onClick={submitChangePassword} style={{ backgroundColor: "#2196f3", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px" }}>
                        Đổi mật khẩu
                    </button>
                    <button onClick={onClose} style={{ backgroundColor: "#ccc", border: "none", padding: "6px 12px", borderRadius: "4px" }}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
