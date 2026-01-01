import React, { useMemo } from 'react';
import type { EventApiDto } from '../utils/types';

interface Props {
    events: EventApiDto[];
    selectedDayISO?: string;
    onDaySelect?: (iso: string) => void;
}

const toDayKeyISO = (d: string | Date): string => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const combineDateAndTime = (date: string | Date, time: string | Date): Date => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const t = typeof time === 'string' ? new Date(time) : time;
    // if time is 'HH:MM' create ISO using date's date
    if (typeof time === 'string' && !time.includes('T')) {
        const [hh, mm] = time.split(':').map(Number);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0, 0);
    }

    return new Date(
        t.getFullYear(),
        t.getMonth(),
        t.getDate(),
        t.getHours(),
        t.getMinutes(),
        0,
        0
    );
};

const startOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay() || 7; // zondag = 7
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
};


export const WeekCalendar: React.FC<Props> = ({
    events,
    selectedDayISO,
    onDaySelect
}) => {

    const today = new Date();
    const weekStart = startOfWeek(today);

    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            return d;
        });
    }, [weekStart]);

    const eventsByDay = useMemo(() => {
        const map: Record<string, EventApiDto[]> = {};

        for (const ev of events) {
            const key = toDayKeyISO(ev.eventDate);
            if (!map[key]) map[key] = [];
            map[key].push(ev);
        }

        Object.values(map).forEach(list =>
            list.sort((a, b) =>

                combineDateAndTime(a.eventDate, a.startTime).getTime() -
                combineDateAndTime(b.eventDate, b.startTime).getTime()
            )

        );

        return map;
    }, [events]);

    return (
        <div className="week-calendar">
            <div className="week-grid">
                {days.map(day => {
                    const dayKey = toDayKeyISO(day);
                    const isSelected = dayKey === selectedDayISO;
                    const dayEvents = eventsByDay[dayKey] ?? [];

                    return (
                        <div
                            key={dayKey}
                            className={`week-day ${isSelected ? 'selected' : ''}`}
                            onClick={() => onDaySelect?.(dayKey)}
                        >
                            <div className="week-day-header">
                                <div>{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                <div>{day.getDate()}</div>
                            </div>

                            <div className="week-day-events">
                                {dayEvents.length === 0 && (
                                    <div className="muted">—</div>
                                )}

                                {dayEvents.map(ev => {
                                    const start = combineDateAndTime(ev.eventDate, ev.startTime);
                                    const end = combineDateAndTime(ev.eventDate, ev.endTime);

                                    return (
                                        <div key={ev.id} className="calendar-event">
                                            <div className="event-title">{ev.title}</div>
                                            <div className="event-time">
                                                {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {' – '}
                                                {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="muted">{ev.room?.roomName}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};