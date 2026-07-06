import React from 'react';

const JudgeStatsTable = ({ stats, searchJudgeTerm, setSearchJudgeTerm, onDownload }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-seal-silver mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="font-title-lg text-title-lg text-judicial-navy flex items-center gap-2 font-bold">
                        <span className="material-symbols-outlined">analytics</span>
                        Thống kê lịch xét xử từng thẩm phán trong tháng
                    </h3>
                    <p className="text-caption text-outline mt-1">Tổng số thẩm phán: {Object.keys(stats).length} thẩm phán</p>
                </div>
                
                <button 
                    onClick={onDownload} 
                    className="bg-judicial-navy text-white px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all text-xs border-none cursor-pointer"
                >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Tải về bảng Excel
                </button>
            </div>

            <div className="mb-4 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên thẩm phán..."
                    value={searchJudgeTerm}
                    onChange={(e) => setSearchJudgeTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-gavel-gold w-full max-w-md text-body-md outline-none"
                />
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-seal-silver">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low text-caption font-bold uppercase tracking-wider text-outline">
                            <th className="px-4 py-3 border-b border-seal-silver">STT</th>
                            <th className="px-4 py-3 border-b border-seal-silver">Thẩm phán</th>
                            <th className="px-4 py-3 border-b border-seal-silver text-status-completed">Đã hoàn thành</th>
                            <th className="px-4 py-3 border-b border-seal-silver text-status-pending">Chưa hoàn thành</th>
                            <th className="px-4 py-3 border-b border-seal-silver text-judicial-navy">Tổng đăng ký</th>
                        </tr>
                    </thead>
                    <tbody className="text-body-md">
                        {Object.entries(stats)
                            .filter(([name]) => name.toLowerCase().includes(searchJudgeTerm.toLowerCase()))
                            .map(([name, data], idx) => (
                                <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors border-b border-seal-silver last:border-none">
                                    <td className="px-4 py-3 font-semibold text-outline">{idx + 1}</td>
                                    <td className="px-4 py-3 font-bold text-judicial-navy">{name}</td>
                                    <td className="px-4 py-3 font-semibold text-status-completed">{data.done}</td>
                                    <td className="px-4 py-3 font-semibold text-status-pending">{data.pending}</td>
                                    <td className="px-4 py-3 font-bold text-judicial-navy">{data.total}</td>
                                </tr>
                             ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards list) */}
            <div className="block md:hidden space-y-3">
                {Object.entries(stats)
                    .filter(([name]) => name.toLowerCase().includes(searchJudgeTerm.toLowerCase()))
                    .map(([name, data], idx) => (
                        <div key={idx} className="bg-surface-container-lowest p-4 rounded-xl border border-seal-silver shadow-sm space-y-2 relative">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-sm font-bold text-judicial-navy">{name}</span>
                                <span className="text-xs font-semibold text-outline">Hạng {idx + 1}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="bg-green-50/50 p-2 rounded">
                                    <span className="block text-[10px] text-status-completed font-semibold">Đã xong</span>
                                    <span className="text-sm font-bold text-status-completed">{data.done}</span>
                                </div>
                                <div className="bg-orange-50/50 p-2 rounded">
                                    <span className="block text-[10px] text-status-pending font-semibold">Chưa xong</span>
                                    <span className="text-sm font-bold text-status-pending">{data.pending}</span>
                                </div>
                                <div className="bg-blue-50/50 p-2 rounded">
                                    <span className="block text-[10px] text-judicial-navy font-semibold">Tổng số</span>
                                    <span className="text-sm font-bold text-judicial-navy">{data.total}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                {Object.entries(stats).filter(([name]) => name.toLowerCase().includes(searchJudgeTerm.toLowerCase())).length === 0 && (
                    <div className="text-center py-6 text-outline bg-gray-50 font-semibold rounded-lg border border-dashed border-slate-300 text-sm">
                        Không tìm thấy thẩm phán phù hợp.
                    </div>
                )}
            </div>
        </div>
    );
};

export default JudgeStatsTable;
