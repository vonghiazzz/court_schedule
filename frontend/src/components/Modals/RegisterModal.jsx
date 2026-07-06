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
        <div 
            onClick={(e) => {
                if (e.target.id === 'modal-overlay') onClose();
            }}
            className="fixed inset-0 bg-judicial-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
            id="modal-overlay"
        >
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-seal-silver animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="bg-surface-container-low px-6 py-4 border-b border-seal-silver flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md text-judicial-navy font-bold margin-0">Đăng ký phiên xét xử</h3>
                    <button 
                        className="text-outline hover:text-error transition-colors border-none bg-transparent cursor-pointer flex items-center p-1 rounded-full hover:bg-black/5" 
                        onClick={onClose}
                        title="Đóng"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                {/* Modal Content (Scrollable Form) */}
                <div className="overflow-y-auto px-6 py-6 space-y-4 flex-1">
                    
                    {/* Date (Read-only) */}
                    <div className="flex items-center justify-between p-3 bg-primary-fixed/20 rounded-lg border border-primary-fixed">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-judicial-navy">calendar_today</span>
                            <div>
                                <p className="text-caption text-on-surface-variant leading-none margin-0">Ngày xét xử</p>
                                <p className="font-body-lg text-body-lg font-bold text-judicial-navy margin-0">{selectedDate}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Venue Dropdown */}
                        <div className="space-y-1">
                            <label className="font-label-md text-on-surface-variant font-bold text-xs">Hội trường xét xử</label>
                            <select 
                                value={selectedRoom} 
                                onChange={(e) => setSelectedRoom(e.target.value)} 
                                className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none transition-all"
                            >
                                <option value="">Chọn hội trường xét xử</option>
                                {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {/* Session Dropdown */}
                        <div className="space-y-1">
                            <label className="font-label-md text-on-surface-variant font-bold text-xs">Buổi xét xử</label>
                            <select 
                                value={selectedShift} 
                                onChange={(e) => setSelectedShift(e.target.value)} 
                                className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none transition-all"
                            >
                                <option value="">Chọn buổi xét xử</option>
                                {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Time */}
                        <div className="space-y-1">
                            <label className="font-label-md text-on-surface-variant font-bold text-xs">Giờ bắt đầu</label>
                            <input 
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                            />
                        </div>
                        {/* End Time */}
                        <div className="space-y-1">
                            <label className="font-label-md text-on-surface-variant font-bold text-xs">Giờ kết thúc</label>
                            <input 
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none"
                            />
                        </div>
                    </div>
                    
                    {/* Council Selection (Custom List View) */}
                    <div className="space-y-1">
                        <label className="font-label-md text-on-surface-variant font-bold text-xs">Hội đồng xét xử</label>
                        <div className="border border-seal-silver rounded-lg bg-surface-container-lowest h-32 overflow-y-auto p-2">
                            <div className="flex flex-col gap-1">
                                {JUROR.map(juror => {
                                    const isSelected = selectedJurors.includes(juror);
                                    return (
                                        <div 
                                            key={juror}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedJurors(selectedJurors.filter(j => j !== juror));
                                                } else {
                                                    setSelectedJurors([...selectedJurors, juror]);
                                                }
                                            }}
                                            className={`p-2 cursor-pointer rounded text-body-md transition-all select-none ${
                                                isSelected 
                                                    ? "bg-primary-fixed/30 border-l-4 border-l-gavel-gold font-bold text-judicial-navy" 
                                                    : "hover:bg-surface-container-low text-gray-700 font-medium"
                                            }`}
                                        >
                                            {juror}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Litigants */}
                    <div className="space-y-1">
                        <label className="font-label-md text-on-surface-variant font-bold text-xs">Đương sự</label>
                        <textarea 
                            value={litigant}
                            onChange={(e) => setLitigant(e.target.value)}
                            className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none min-h-[80px]"
                            placeholder="Nhập tên đương sự..."
                        />
                    </div>
                    
                    {/* Dispute Relation */}
                    <div className="space-y-1">
                        <label className="font-label-md text-on-surface-variant font-bold text-xs">Quan hệ tranh chấp</label>
                        <textarea 
                            value={dispute_relationship}
                            onChange={(e) => setDispute_relationship(e.target.value)}
                            className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none min-h-[80px]"
                            placeholder="Nội dung tranh chấp..."
                        />
                    </div>
                    
                    {/* Note */}
                    <div className="space-y-1">
                        <label className="font-label-md text-on-surface-variant font-bold text-xs">Ghi chú</label>
                        <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full border border-seal-silver rounded-lg px-3 py-2 bg-white text-body-md focus:ring-2 focus:ring-gavel-gold outline-none min-h-[60px]"
                            placeholder="Ghi chú thêm..."
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
                        onClick={handleRegister}
                    >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
