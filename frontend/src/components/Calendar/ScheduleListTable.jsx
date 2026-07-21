import React, { useState, useEffect, useMemo } from 'react';

const ScheduleListTable = ({
    filteredSchedules,
    searchTerm,
    setSearchTerm,
    onDownload
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Sort schedules by date
    const sortedSchedules = useMemo(() => {
        return [...filteredSchedules].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [filteredSchedules]);

    const totalItems = sortedSchedules.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    // Reset current page when filters or searches change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, totalItems]);

    // Paginated subset
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
    
    const paginatedSchedules = useMemo(() => {
        return sortedSchedules.slice(startIndex, endIndex);
    }, [sortedSchedules, startIndex, endIndex]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-seal-silver mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="font-title-lg text-title-lg text-judicial-navy flex items-center gap-2 font-bold">
                        <span className="material-symbols-outlined">gavel</span>
                        Danh sách tất cả lịch xét xử trong tháng
                    </h3>
                    <p className="text-caption text-outline mt-1">Tổng số vụ xét xử: {filteredSchedules.length} vụ</p>
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
                    placeholder="Tìm kiếm theo thẩm phán, hội trường, hội thẩm, đương sự..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-gavel-gold w-full max-w-md text-body-md outline-none"
                />
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-seal-silver">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface-container-low text-caption font-bold uppercase tracking-wider text-outline whitespace-nowrap">
                            <th className="px-3 py-3 border-b border-seal-silver w-12 text-center">STT</th>
                            <th className="px-3 py-3 border-b border-seal-silver w-24">Ngày</th>
                            <th className="px-3 py-3 border-b border-seal-silver w-20 text-center">Buổi</th>
                            <th className="px-3 py-3 border-b border-seal-silver w-28">Thời gian</th>
                            <th className="px-3 py-3 border-b border-seal-silver w-28">Hội trường</th>
                            <th className="px-3 py-3 border-b border-seal-silver max-w-[180px]">Đương sự</th>
                            <th className="px-3 py-3 border-b border-seal-silver max-w-[200px]">Quan hệ tranh chấp</th>
                            <th className="px-3 py-3 border-b border-seal-silver w-36">Thẩm phán</th>
                            <th className="px-3 py-3 border-b border-seal-silver max-w-[180px]">Hội thẩm</th>
                            <th className="px-3 py-3 border-b border-seal-silver max-w-[150px]">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody className="text-body-md">
                        {paginatedSchedules.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors border-b border-seal-silver last:border-none">
                                <td className="px-3 py-3 font-semibold text-outline text-center">{startIndex + idx + 1}</td>
                                <td className="px-3 py-3 font-semibold text-judicial-navy whitespace-nowrap">
                                    {new Date(item.date).toLocaleDateString("vi-VN")}
                                </td>
                                <td className="px-3 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                                        item.shift === 'Sáng' 
                                            ? 'bg-green-50 text-status-completed border border-status-completed/20' 
                                            : item.shift === 'Chiều'
                                                ? 'bg-orange-50 text-status-pending border border-status-pending/20'
                                                : 'bg-blue-50 text-status-scheduled border border-status-scheduled/20'
                                    }`}>
                                        {item.shift}
                                    </span>
                                </td>
                                <td className="px-3 py-3 font-semibold text-gray-700 whitespace-nowrap">{item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}</td>
                                <td className="px-3 py-3 font-bold text-judicial-navy whitespace-nowrap">{item.room}</td>
                                <td className="px-3 py-3 text-gray-700 font-medium max-w-[180px] break-words">{item.litigant}</td>
                                <td className="px-3 py-3 text-gray-600 max-w-[200px] break-words">{item.dispute_relationship}</td>
                                <td className="px-3 py-3 font-bold text-judicial-navy max-w-[150px] break-words">{item.user?.username}</td>
                                <td className="px-3 py-3 text-gray-600 max-w-[180px] break-words">
                                    {Array.isArray(item.jurors) ? item.jurors.join(", ") : item.jurors}
                                </td>
                                <td className="px-3 py-3 text-gray-500 italic max-w-[150px] truncate" title={item.note}>
                                    {item.note || ""}
                                </td>
                            </tr>
                        ))}
                        {totalItems === 0 && (
                            <tr>
                                <td colSpan="10" className="text-center py-6 text-outline bg-gray-50 font-semibold">
                                    Không có lịch phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards list) */}
            <div className="block md:hidden space-y-4">
                {paginatedSchedules.map((item, idx) => (
                    <div key={item.id} className="bg-surface-container-lowest p-4 rounded-xl border border-seal-silver shadow-sm space-y-3">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-outline">STT: {startIndex + idx + 1}</span>
                                <span className="text-sm font-bold text-judicial-navy">
                                    {new Date(item.date).toLocaleDateString("vi-VN")} ({item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)})
                                </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.shift === 'Sáng' 
                                    ? 'bg-green-50 text-status-completed border border-status-completed/20' 
                                    : item.shift === 'Chiều'
                                        ? 'bg-orange-50 text-status-pending border border-status-pending/20'
                                        : 'bg-blue-50 text-status-scheduled border border-status-scheduled/20'
                            }`}>
                                {item.shift}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="block text-outline text-[10px] uppercase font-bold">Thẩm phán</span>
                                <span className="font-bold text-gray-800">{item.user?.username}</span>
                            </div>
                            <div>
                                <span className="block text-outline text-[10px] uppercase font-bold">Hội trường</span>
                                <span className="font-bold text-judicial-navy">{item.room}</span>
                            </div>
                        </div>
                        <div className="text-xs">
                            <span className="block text-outline text-[10px] uppercase font-bold">Đương sự</span>
                            <span className="font-semibold text-gray-800">{item.litigant}</span>
                        </div>
                        <div className="text-xs">
                            <span className="block text-outline text-[10px] uppercase font-bold">Quan hệ tranh chấp</span>
                            <span className="text-gray-700">{item.dispute_relationship}</span>
                        </div>
                        <div className="text-xs">
                            <span className="block text-outline text-[10px] uppercase font-bold">Hội thẩm</span>
                            <span className="text-gray-700">{Array.isArray(item.jurors) ? item.jurors.join(", ") : item.jurors}</span>
                        </div>
                        {item.note && (
                            <div className="text-xs italic text-gray-500 bg-gray-50 p-2 rounded">
                                * {item.note}
                            </div>
                        )}
                    </div>
                ))}
                {totalItems === 0 && (
                    <div className="text-center py-6 text-outline bg-gray-50 font-semibold rounded-lg border border-dashed border-slate-300 text-sm">
                        Không có lịch xét xử nào trong tháng.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-seal-silver">
                    <span className="text-caption text-outline font-medium">
                        Hiển thị {startIndex + 1} - {endIndex} trong số {totalItems} phiên xét xử
                    </span>
                    <div className="flex items-center gap-1">
                        {/* First page button */}
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(1)}
                            className="w-8 h-8 rounded border border-seal-silver bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                            title="Trang đầu"
                        >
                            <span className="material-symbols-outlined text-[18px]">first_page</span>
                        </button>
                        {/* Previous button */}
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="w-8 h-8 rounded border border-seal-silver bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                            title="Trang trước"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        
                        {/* Numbered pages with Ellipsis */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                            .map((page, index, array) => {
                                const showEllipsisBefore = page > 2 && array[index - 1] !== page - 1;
                                return (
                                    <React.Fragment key={page}>
                                        {showEllipsisBefore && <span className="px-1.5 text-outline text-xs">...</span>}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded text-xs font-bold border transition-all cursor-pointer ${
                                                currentPage === page
                                                    ? 'bg-judicial-navy border-judicial-navy text-white shadow-sm'
                                                    : 'border-seal-silver bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                );
                            })
                        }
                        
                        {/* Next button */}
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="w-8 h-8 rounded border border-seal-silver bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                            title="Trang sau"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                        {/* Last page button */}
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8 rounded border border-seal-silver bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                            title="Trang cuối"
                        >
                            <span className="material-symbols-outlined text-[18px]">last_page</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleListTable;
