import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ZaloSupportWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const zaloPhone = "0919366392";
    const managerName = "Anh Tấn Thành";
    const zaloLink = `https://zalo.me/${zaloPhone}`;

    const handleCopyPhone = () => {
        navigator.clipboard.writeText(zaloPhone);
        toast.success(`Đã sao chép số Zalo: ${zaloPhone}`);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-body-md select-none">
            {/* Expanded Support Card */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl border border-seal-silver w-80 sm:w-96 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Card Header */}
                    <div className="bg-judicial-navy text-white px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-inner">
                                <span className="material-symbols-outlined text-[24px]">support_agent</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-base m-0 leading-tight">Hỗ Trợ & Liên Hệ</h4>
                                <p className="text-xs text-blue-200 m-0">Ban Quản Lý Website</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full border-none bg-transparent cursor-pointer transition-colors flex items-center justify-center"
                            title="Đóng"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4 bg-surface-container-lowest text-on-surface">
                        {/* Manager Profile Box */}
                        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-judicial-navy text-gavel-gold font-bold text-lg flex items-center justify-center shadow-sm border-2 border-gavel-gold/40">
                                N
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Quản lý website</div>
                                <div className="text-base font-bold text-judicial-navy">{managerName}</div>
                                <div className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                                    <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                                    Zalo: <span className="font-bold">{zaloPhone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Request Note */}
                        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5 flex-shrink-0">
                                info
                            </span>
                            <p className="text-xs text-amber-900 leading-relaxed m-0 font-medium">
                                Quý đồng chí / người dùng có bất kỳ yêu cầu, thắc mắc hoặc cần hỗ trợ kỹ thuật trên hệ thống, vui lòng gửi tin nhắn trực tiếp qua <strong>Zalo</strong>.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <a
                                href={zaloLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 no-underline shadow-md transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                Gửi yêu cầu qua Zalo
                            </a>
                            <button
                                onClick={handleCopyPhone}
                                className="bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-gray-300 transition-all cursor-pointer"
                                title="Sao chép số điện thoại Zalo"
                            >
                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                Copy SĐT
                            </button>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-gray-50 px-5 py-2.5 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                        <span>Trực tuyến hỗ trợ 24/7</span>
                        <span className="font-semibold text-blue-600">Hotline: {zaloPhone}</span>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-judicial-navy hover:from-blue-700 hover:to-primary text-white font-bold px-4 py-3 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300 border border-white/30 cursor-pointer"
                title="Hỗ trợ qua Zalo"
            >
                <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <span className="text-sm font-bold tracking-wide pr-1">Hỗ trợ Zalo ({managerName})</span>
            </button>
        </div>
    );
}
