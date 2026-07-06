import React from 'react';

const WEEKDAYS_VN = [
    "Thứ 2 (T2)",
    "Thứ 3 (T3)",
    "Thứ 4 (T4)",
    "Thứ 5 (T5)",
    "Thứ 6 (T6)",
    "Thứ 7 (T7)",
    "Chủ Nhật (CN)"
];

const WEEKDAYS_MOBILE = [
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "CN"
];

const CalendarGrid = ({
    calendarDays,
    isToday,
    isPastDayOrToDay,
    formatDate,
    getDaySchedule,
    setSelectedDate,
    openRegisterModal,
    handleEdit,
    handleDelete,
    judgeName
}) => {
    return (
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-seal-silver overflow-hidden">
            
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-judicial-navy text-white py-3 lg:py-4 font-bold text-center border-b border-judicial-navy">
                {WEEKDAYS_VN.map((day, idx) => (
                    <div key={idx} className="text-xs lg:text-body-md font-semibold lg:font-bold">
                        <span className="hidden lg:inline">{day}</span>
                        <span className="inline lg:hidden">{WEEKDAYS_MOBILE[idx]}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="calendar-grid">
                {calendarDays.map((day, idx) => {
                    // Empty cells for padding days from previous/next months
                    if (!day) {
                        return (
                            <div 
                                key={`empty-${idx}`} 
                                className="calendar-cell bg-surface-container-low opacity-40"
                            ></div>
                        );
                    }

                    const dateStr = formatDate(day);
                    const dayEvents = getDaySchedule(dateStr);
                    const dayOfWeek = (idx % 7); // 0 = Mon, 1 = Tue, ..., 5 = Sat, 6 = Sun
                    const isWeekendVal = dayOfWeek === 5 || dayOfWeek === 6;
                    const isTodayVal = isToday(day);
                    const isPastVal = isPastDayOrToDay(day);

                    // Choose style classes based on day properties
                    let cellClasses = "calendar-cell p-1 lg:p-2 flex flex-col gap-1 relative cursor-pointer group transition-all ";
                    if (isTodayVal) {
                        cellClasses += "bg-primary-fixed/20 border-l-2 lg:border-l-4 border-judicial-navy ring-1 ring-judicial-navy/10";
                    } else if (isPastVal) {
                        cellClasses += "bg-slate-100/70 text-gray-400 opacity-60";
                    } else if (isWeekendVal) {
                        cellClasses += "bg-surface-container-low/30";
                    } else {
                        cellClasses += "bg-white";
                    }

                    return (
                        <div 
                            key={`day-${day}`}
                            className={cellClasses}
                            onClick={() => {
                                setSelectedDate(dateStr);
                                if (!isPastVal) {
                                    openRegisterModal(dateStr);
                                }
                            }}
                        >
                            {/* Day Number and Register Action */}
                            <div className="flex justify-between items-center mb-1">
                                <span 
                                    onClick={(e) => {
                                        if (!isPastVal) {
                                            e.stopPropagation();
                                            setSelectedDate(dateStr);
                                            openRegisterModal(dateStr);
                                        }
                                    }}
                                    className={`text-xs lg:text-body-md font-bold cursor-pointer transition-all ${
                                        isPastVal 
                                            ? "text-gray-400/80 hover:bg-gray-200/50 px-1.5 py-0.5 rounded" 
                                            : isTodayVal 
                                                ? "text-judicial-navy font-extrabold ring-1 lg:ring-2 ring-judicial-navy/20 rounded-full bg-white px-1 lg:px-1.5 py-0.5" 
                                                : isWeekendVal 
                                                    ? "text-outline hover:bg-judicial-navy/10 px-1.5 py-0.5 rounded" 
                                                    : "text-judicial-navy hover:bg-judicial-navy/10 px-1.5 py-0.5 rounded"
                                    }`}
                                    title={!isPastVal ? "Đăng ký phiên xử cho ngày này" : "Xem chi tiết"}
                                >
                                    {day}
                                </span>
                                {!isPastVal && (
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDate(dateStr);
                                            openRegisterModal(dateStr);
                                        }}
                                        className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity bg-judicial-navy/10 hover:bg-judicial-navy text-judicial-navy hover:text-white text-[10px] font-bold px-1.5 py-0.5 rounded items-center gap-0.5 border border-judicial-navy/25 cursor-pointer shadow-sm"
                                        title="Đăng ký phiên xử mới"
                                    >
                                        <span className="material-symbols-outlined text-[12px] font-bold">add</span>
                                        <span>Đăng ký</span>
                                    </div>
                                )}
                            </div>

                            {/* Schedule Items List (Desktop only) */}
                            <div className="hidden lg:flex flex-1 flex flex-col gap-1 overflow-y-auto max-h-[140px] scroll-custom">
                                {dayEvents.map((ev, i) => {
                                    const eventDate = new Date(ev.date);
                                    eventDate.setHours(0, 0, 0, 0);
                                    const now = new Date();
                                    now.setHours(0, 0, 0, 0);
                                    const isFuture = eventDate > now;
                                    const isOwnEvent = ev.user?.username === judgeName;

                                    return (
                                        <div 
                                            key={i} 
                                            className={`border rounded p-1.5 shadow-sm text-[11px] leading-tight flex flex-col gap-0.5 hover:shadow-md transition-shadow relative group/event ${
                                                isPastVal 
                                                    ? "bg-slate-50 border-slate-200 text-gray-400" 
                                                    : "bg-white border-seal-silver text-gray-700"
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Avoid triggering cell click notice
                                                if (isOwnEvent && isFuture) {
                                                    handleEdit(ev);
                                                }
                                            }}
                                        >
                                            <div className="flex justify-between items-start gap-1">
                                                <span className={`font-bold truncate ${
                                                    isPastVal 
                                                        ? "text-gray-400" 
                                                        : isOwnEvent ? "text-judicial-navy" : "text-gray-700"
                                                }`}>
                                                    {ev.room} - {ev.shift}
                                                </span>
                                                <span className={`italic truncate shrink-0 max-w-[60px] ${
                                                    isPastVal ? "text-gray-400" : "text-gavel-gold"
                                                }`}>
                                                    {ev.user?.username || "?"}
                                                </span>
                                            </div>
                                            
                                            {/* Start and end time */}
                                            <div className={`text-[9px] font-semibold ${isPastVal ? "text-gray-400" : "text-gray-500"}`}>
                                                {ev.start_time?.slice(0, 5)} - {ev.end_time?.slice(0, 5)}
                                            </div>

                                            {/* Hover action buttons */}
                                            {isOwnEvent && isFuture && (
                                                <div 
                                                    className="absolute right-0.5 bottom-0.5 opacity-0 group-hover/event:opacity-100 transition-opacity flex gap-0.5 bg-white/95 p-0.5 rounded shadow border border-seal-silver"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={() => handleEdit(ev)}
                                                        className="p-0.5 hover:bg-gray-100 text-blue-600 border-none bg-none cursor-pointer flex items-center rounded"
                                                        title="Sửa"
                                                    >
                                                        <span className="material-symbols-outlined text-[13px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ev)}
                                                        className="p-0.5 hover:bg-red-50 text-red-600 border-none bg-none cursor-pointer flex items-center rounded"
                                                        title="Xóa"
                                                    >
                                                        <span className="material-symbols-outlined text-[13px]">delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mobile Events Indicator (Dots - Mobile only) */}
                            <div className="flex lg:hidden flex-row gap-0.5 justify-center mt-1 flex-wrap">
                                {dayEvents.slice(0, 3).map((ev, i) => (
                                    <span 
                                        key={i} 
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            isPastVal
                                                ? "bg-slate-400"
                                                : ev.user?.username === judgeName 
                                                    ? "bg-judicial-navy" 
                                                    : "bg-gavel-gold"
                                        }`}
                                        title={`${ev.room} - ${ev.shift}`}
                                    ></span>
                                ))}
                                {dayEvents.length > 3 && (
                                    <span className="text-[8px] text-outline font-bold leading-none -mt-0.5">+</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarGrid;
