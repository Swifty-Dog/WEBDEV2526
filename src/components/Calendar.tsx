import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/calendar.css';

interface Events {
    [key: string]: string[];
}

interface CalendarProps {
    events: Events;
    onDaySelect: (dateString: string, dayEvents: string[] | undefined) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onDaySelect }) => {
    const { t, i18n } = useTranslation('common');

    const today = useMemo(() => new Date(), []);
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDateString, setSelectedDateString] = useState<string | null>(null);

    const weekdayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekdayNames = weekdayKeys.map(key => t(`calendar.weekdayAbbr.${key}`));

    const updateMonthYear = useCallback((month: number, year: number) => {
        setCurrentMonth(month);
        setCurrentYear(year);
    }, []);

    const previousMonth = useCallback(() => {
        updateMonthYear(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
        setSelectedDateString(null);
    }, [currentMonth, currentYear, updateMonthYear]);

    const nextMonth = useCallback(() => {
        updateMonthYear(currentMonth === 11 ? 0 : currentMonth + 1, currentMonth === 11 ? currentYear + 1 : currentYear);
        setSelectedDateString(null);
    }, [currentMonth, currentYear, updateMonthYear]);

    const getCalendarDays = useCallback(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

        const days: { day: number, isOtherMonth: boolean, dateString: string }[] = [];

        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                day: daysInPrevMonth - i,
                isOtherMonth: true,
                dateString: ''
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push({
                day,
                isOtherMonth: false,
                dateString
            });
        }

        // Next month days
        const totalCellsUsed = startDay + daysInMonth;
        const remainingCells = totalCellsUsed <= 35 ? (35 - totalCellsUsed) : (42 - totalCellsUsed);

        for (let day = 1; day <= remainingCells; day++) {
            days.push({
                day,
                isOtherMonth: true,
                dateString: ''
            });
        }

        return days;
    }, [currentYear, currentMonth]);

    const calendarDays = useMemo(() => getCalendarDays(), [getCalendarDays]);

    useEffect(() => {
        if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
            const todayDateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            // If today has events, select it and show them
            if (events[todayDateString]) {
                setSelectedDateString(todayDateString);
                onDaySelect(todayDateString, events[todayDateString]);
            }
        }
    }, [currentYear, currentMonth, today, events, onDaySelect]);


    const handleDayClick = (dayData: (typeof calendarDays)[0]) => {
        if (dayData.isOtherMonth) return;

        const newDateString = dayData.dateString;

        setSelectedDateString(newDateString);
        onDaySelect(newDateString, events[newDateString]);
    };

    const monthYearTitle = useMemo(() => {
        const date = new Date(currentYear, currentMonth);
        const currentLanguage = i18n.language || 'en';

        const formatter = new Intl.DateTimeFormat(currentLanguage, { month: 'long', year: 'numeric' });
        return formatter.format(date);
    }, [currentYear, currentMonth, i18n.language]);

    const subtitle = t('calendar.subtitle');

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button id="prevMonth" className="button-secondary" title={t('calendar.titlePrevMonth')} onClick={previousMonth}>
                    <span>❮</span>
                </button>
                <div className="month-year-container">
                    <h3 id="monthYear">{monthYearTitle}</h3>
                    <div className="calendar-subtitle">{subtitle}</div>
                </div>
                <button id="nextMonth" className="button-secondary" title={t('calendar.titleNextMonth')} onClick={nextMonth}>
                    <span>❯</span>
                </button>
            </div>

            <div className="calendar-weekdays">
                {weekdayNames.map(name => (
                    <div key={name} className="weekday-names">{name}</div>
                ))}
            </div>

            <div className="calendar-days" id="calendarDays">
                {calendarDays.map((dayData, index) => {
                    const { day, isOtherMonth, dateString } = dayData;
                    const isToday = currentYear === today.getFullYear() &&
                        currentMonth === today.getMonth() &&
                        day === today.getDate() &&
                        !isOtherMonth;
                    const hasEvent = !isOtherMonth && events[dateString];
                    const isSelected = !isOtherMonth && dateString === selectedDateString;

                    let className = 'calendar-day';
                    if (isOtherMonth) className += ' other-month';
                    if (isToday) className += ' today';
                    if (hasEvent) className += ' has-event';
                    if (isSelected) className += ' selected';

                    const titleText = hasEvent ? t('calendar.titleEvents', { events: events[dateString].join(', ') }) : undefined;

                    return (
                        <div
                            key={index}
                            className={className}
                            title={titleText}
                            onClick={() => handleDayClick(dayData)}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
