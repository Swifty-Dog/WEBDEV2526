import React, { useMemo, useState } from 'react';
import type { EventItem } from '../pages/AdminDashboard';

interface Props {
    events: EventItem[];
    onDaySelect?: (dateISO: string, eventsForDay: EventItem[]) => void;
}

function startOfWeekMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = (day === 0 ? -6 : 1 - day); // move to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function toDayKeyISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export const WeekCalendar: React.FC<Props> = ({ events, onDaySelect }) => {
    const [anchor, setAnchor] = useState<Date>(() => startOfWeekMonday(new Date()));

    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(anchor);
            d.setDate(anchor.getDate() + i);
            return d;
        });
    }, [anchor]);

    const eventsByDay = useMemo(() => {
        const map = new Map<string, EventItem[]>();
        for (const ev of events) {
            const d = new Date(ev.date);
            const key = toDayKeyISO(d);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(ev);
        }
        // optional: sort by time within day
        for (const [k, arr] of map) {
            arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            map.set(k, arr);
        }
        return map;
    }, [events]);

    const prevWeek = () => {
        const d = new Date(anchor);
        d.setDate(d.getDate() - 7);
        setAnchor(startOfWeekMonday(d));
    };
    const nextWeek = () => {
        const d = new Date(anchor);
        d.setDate(d.getDate() + 7);
        setAnchor(startOfWeekMonday(d));
    };
    const goToday = () => {
        setAnchor(startOfWeekMonday(new Date()));
    };

    const headerLabel = useMemo(() => {
        const end = new Date(anchor);
        end.setDate(anchor.getDate() + 6);
        const intl = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${intl.format(anchor)} – ${intl.format(end)}`;
    }, [anchor]);

    const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="week-calendar">
            <div className="week-header">
                <button className="nav-btn" onClick={prevWeek} title="Previous week">❮</button>
                <h3 style={{ margin: 0 }}>{headerLabel}</h3>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <button className="btn-sm" onClick={goToday} title="Jump to current week">Today</button>
                    <button className="nav-btn" onClick={nextWeek} title="Next week">❯</button>
                </div>
            </div>
            <div className="week-grid">
                {days.map((d, idx) => {
                    const key = toDayKeyISO(d);
                    const dayEvents = eventsByDay.get(key) ?? [];
                    const isToday = new Date().toDateString() === d.toDateString();
                    return (
                        <div key={key} className={`week-day${isToday ? ' today' : ''}`} onClick={() => onDaySelect?.(key, dayEvents)}>
                            <div className="week-day-header">
                                <span className="weekday-name">{weekdayNames[idx]}</span>
                                <span className="weekday-date">{d.getDate()}</span>
                                {dayEvents.length > 0 && (
                                    <span className="badge">{dayEvents.length}</span>
                                )}
                            </div>
                            <div className="day-events">
                                {dayEvents.length === 0 ? (
                                    <div className="muted" style={{ fontSize: '0.85rem' }}>No events</div>
                                ) : (
                                    dayEvents.slice(0, 3).map(e => (
                                        <div key={e.id} className="event-chip" title={e.description}>
                                            <span className="event-time">{new Date(e.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            <span className="event-title">{e.title}</span>
                                        </div>
                                    ))
                                )}
                                {dayEvents.length > 3 && (
                                    <div className="muted more">+{dayEvents.length - 3} more</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekCalendar;
