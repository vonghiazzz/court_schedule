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
        <div 
            onClick={(e) => {
                if (e.target.id === 'modal-overlay') onClose();
            }}
            className="fixed inset-0 bg-judicial-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
            id="modal-overlay"
        >
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-seal-silver animate-in fade-in zoom-in duration-300 flex flex-col">
                
                {/* Modal Header */}
                <div className="bg-surface-container-low px-6 py-4 border-b border-seal-silver flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md text-judicial-navy font-bold flex items-center gap-2 margin-0">
                        <span className="material-symbols-outlined text-[24px]">vpn_key</span>
                        Đổi mật khẩu
                    </h3>
                    <button 
                        className="text-outline hover:text-error transition-colors border-none bg-transparent cursor-pointer flex items-center p-1 rounded-full hover:bg-black/5" 
                        onClick={onClose}
                        title="Đóng"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="px-6 py-6 space-y-4">
                    {/* Old Password */}
                    <div className="space-y-1">
                        <label className="font-label-md text-on-surface-variant font-bold text-xs">Mật khẩu cũ</label>
                        <input 
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                            placeholder="Nhập mật khẩu cũ..."
                        />
                    </div>
                    
                    {/* New Password */}
                    <div className="space-y-1">
                        <label className="font-label-md text-on-surface-variant font-bold text-xs">Mật khẩu mới</label>
                        <input 
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                            placeholder="Nhập mật khẩu mới..."
                        />
                    </div>
                    
                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label className="font-label-md text-on-surface-variant font-bold text-xs">Xác nhận mật khẩu mới</label>
                        <input 
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                            placeholder="Xác nhận lại mật khẩu mới..."
                        />
                    </div>
                </div>
                
                {/* Modal Footer (Actions) */}
                <div className="bg-surface-container-low px-6 py-4 border-t border-seal-silver flex justify-end items-center gap-3">
                    <button 
                        className="px-6 py-2 border border-seal-silver rounded-lg text-judicial-navy font-label-md hover:bg-white active:scale-95 transition-all cursor-pointer bg-transparent" 
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button 
                        className="px-8 py-2 bg-judicial-navy text-white rounded-lg font-label-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 border-none cursor-pointer font-bold"
                        onClick={submitChangePassword}
                    >
                        <span className="material-symbols-outlined text-sm">lock_reset</span>
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
