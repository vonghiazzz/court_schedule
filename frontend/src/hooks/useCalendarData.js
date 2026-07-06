import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const removeVietnameseTones = (str) => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

export const useCalendarData = (currentDate, filterMonth, filterYear, searchTerm) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSchedule = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get("/schedule", {
                params: {
                    month: filterMonth + 1,
                    year: filterYear
                }
            });
            setSchedule(res.data);
        } catch (err) {
            console.error("Lỗi tải lịch:", err);
            if (!silent) toast.error("Không thể tải dữ liệu lịch!");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [filterMonth, filterYear]);

    useEffect(() => {
        fetchSchedule(); // Initial load (not silent)
    }, [fetchSchedule]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchSchedule(true); // Background update (silent)
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchSchedule]);

    const scheduleInMonth = useMemo(() => {
        const currentMonthPrefix = `${filterYear}-${String(filterMonth + 1).padStart(2, '0')}`;
        return schedule.filter(item => item.date && item.date.startsWith(currentMonthPrefix));
    }, [schedule, filterMonth, filterYear]);

    const filteredSchedules = useMemo(() => {
        const keyword = removeVietnameseTones(searchTerm.toLowerCase());
        return scheduleInMonth.filter(item => {
            const jurorsMatch = Array.isArray(item.jurors)
                ? item.jurors.some(juror => removeVietnameseTones(juror.toLowerCase()).includes(keyword))
                : removeVietnameseTones((item.jurors || "").toLowerCase()).includes(keyword);

            return (
                removeVietnameseTones(item.room?.toLowerCase() || "").includes(keyword) ||
                removeVietnameseTones(item.shift?.toLowerCase() || "").includes(keyword) ||
                removeVietnameseTones(item.note?.toLowerCase() || "").includes(keyword) ||
                removeVietnameseTones(item.dispute_relationship?.toLowerCase() || "").includes(keyword) ||
                removeVietnameseTones(item.litigant?.toLowerCase() || "").includes(keyword) ||
                removeVietnameseTones(item.start_time?.toLowerCase() || "").includes(keyword) ||
                removeVietnameseTones(item.end_time?.toLowerCase() || "").includes(keyword) ||
                removeVietnameseTones(item.user?.username?.toLowerCase() || "").includes(keyword) ||
                jurorsMatch ||
                removeVietnameseTones(item.date?.toLowerCase() || "").includes(keyword)
            );
        });
    }, [scheduleInMonth, searchTerm]);

    const stats = useMemo(() => {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        return scheduleInMonth.reduce((acc, s) => {
            const name = s.user?.username || "Không rõ";
            if (!acc[name]) acc[name] = { done: 0, pending: 0, total: 0 };
            acc[name].total += 1;
            if (new Date(s.date) < todayDate) acc[name].done += 1;
            else acc[name].pending += 1;
            return acc;
        }, {});
    }, [scheduleInMonth]);

    return { schedule, filteredSchedules, stats, fetchSchedule, loading };
};
