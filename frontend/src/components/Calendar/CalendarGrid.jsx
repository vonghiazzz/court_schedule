import React from 'react';
import { WEEKDAYS } from '../../constants';

const CalendarGrid = ({
    calendarDays,
    isToday,
    isPastDayOrToDay,
    formatDate,
    getDaySchedule,
    openRegisterModal,
    handleEdit,
    handleDelete,
    judgeName
}) => {
    return (
        <div className="calendar-grid-wrapper">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: "bold" }}>
                {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`}></div>;
                    const dateStr = formatDate(day);
                    const dayEvents = getDaySchedule(dateStr);
                    return (
                        <div key={`day-${day}`}
                            style={{
                                border: "1px solid #ccc",
                                padding: "6px",
                                minHeight: "100px",
                                backgroundColor: isToday(day) ? "#4bd943ff" : isPastDayOrToDay(day) ? "#ddd" : "#a5c8ebff",
                                cursor: isPastDayOrToDay(day) ? "not-allowed" : "pointer"
                            }}
                            onClick={() => {
                                if (!isPastDayOrToDay(day)) openRegisterModal(dateStr);
                            }}
                        >
                            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{day}</div>
                            {dayEvents.map((ev, i) => {
                                const eventDate = new Date(ev.date);
                                eventDate.setHours(0, 0, 0, 0);
                                const now = new Date();
                                now.setHours(0, 0, 0, 0);
                                const isFuture = eventDate > now;

                                return (
                                    <div key={i} style={{
                                        fontSize: "12px",
                                        backgroundColor: ev.user?.username === judgeName ? "#55d099ff" : "#bfc4b7ff",
                                        padding: "2px 4px",
                                        margin: "2px 0",
                                        borderRadius: "4px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <span>{ev.room} - {ev.shift}</span><br />
                                        <span style={{ fontStyle: "italic" }}>{ev.user?.username || "?"}</span>
                                        {ev.user?.username === judgeName && isFuture && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(ev);
                                                    }}
                                                    style={{ float: "right", border: "none", background: "none", color: "blue" }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(ev);
                                                    }}
                                                    style={{ float: "right", border: "none", background: "none", color: "red" }}
                                                >
                                                    ❌
                                                </button>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarGrid;
