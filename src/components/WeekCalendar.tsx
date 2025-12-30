import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Event } from '../utils/types';

interface Props {
    events: Event[];
    selectedDayISO?: Date;
    onDaySelect?: (dateISO: Date, eventsForDay: Event[]) => void;
    startHour?: number;
    endHour?: number;
}

function startOfWeekMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
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

export const WeekCalendar: React.FC<Props> = ({ events, selectedDayISO, onDaySelect, startHour = 0, endHour = 24 }) => {
    const { t, i18n } = useTranslation('common');

    const [anchor, setAnchor] = useState<Date>(() => startOfWeekMonday(new Date()));

    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(anchor);
            d.setDate(anchor.getDate() + i);
            return d;
        });
    }, [anchor]);

    const eventsByDay = useMemo(() => {
        const map = new Map<string, Event[]>();
        for (const ev of events) {
            const d = new Date(ev.eventDate);
            const hr = d.getHours();
            if (hr < startHour || hr >= endHour) continue;
            const key = toDayKeyISO(d);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(ev);
        }
        // optional: sort by time within day
        for (const [k, arr] of map) {
            arr.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
            map.set(k, arr);
        }
        return map;
    }, [events, startHour, endHour]);

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
        const currentLanguage = i18n.language || 'en';
        const intl = new Intl.DateTimeFormat(currentLanguage, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${intl.format(anchor)} – ${intl.format(end)}`;
    }, [anchor, i18n.language]);

    const weekdayAbbrKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekdayNames = weekdayAbbrKeys.map(key => t(`calendar.weekdayAbbr.${key}`));

    return (
        <div className="week-calendar">
            <div className="week-header">
                <button className="nav-btn" onClick={prevWeek} title={t('calendar.titlePrevWeek')}>❮</button>
                <h3 style={{ margin: 0 }}>{headerLabel}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn-sm" onClick={goToday} title={t('calendar.titleJumpToday')}>{t('calendar.buttonToday')}</button>
                    <button className="nav-btn" onClick={nextWeek} title={t('calendar.titleNextWeek')}>❯</button>
                </div>
            </div>
            <div className={selectedDayISO ? 'week-grid has-selection' : 'week-grid'}>
                {days.map((d, idx) => {
                    const key = d;
                    const dayEvents = eventsByDay.get(key.toDateString()) ?? [];
                    const isToday = new Date().toDateString() === d.toDateString();
                    const isSelected = selectedDayISO === key;
                    const className = `week-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`;

                    const dayTitle = dayEvents.length > 0 ? dayEvents.map(ev => ev.title).join(', ') : undefined;

                    return (
                        <div
                            key={key.toDateString()}
                            className={className}
                            title={dayTitle}
                            onClick={() => onDaySelect?.(key, dayEvents)}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            aria-current={isToday ? 'date' : undefined}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDaySelect?.(key, dayEvents); } }}
                        >
                            <div className="week-day-header">
                                <span className="weekday-name">{weekdayNames[idx]}</span>
                                <span className="weekday-date">{d.getDate()}</span>
                                {isToday && (
                                    <span className="day-chip today-chip" aria-hidden="true">{t('calendar.buttonToday')}</span>
                                )}
                                {isSelected && (
                                    <span className="day-chip selected-chip" aria-hidden="true">{t('calendar.chipSelected')}</span>
                                )}
                                {dayEvents.length > 0 && (
                                    <span className="badge">{dayEvents.length}</span>
                                )}
                            </div>
                            <div className="day-events">
                                {dayEvents.length === 0 ? (
                                    <div className="muted" style={{ fontSize: '0.85rem' }}>{t('calendar.labelNoEvents')}</div>
                                ) : (
                                    dayEvents.slice(0, 3).map(e => (
                                        <div key={e.id} className="event-chip" title={e.description}>
                                            <span className="event-time">{new Date(e.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="event-title">{e.title}</span>
                                        </div>
                                    ))
                                )}
                                {dayEvents.length > 3 && (
                                    <div className="muted more">{t('calendar.labelMoreEvents', { count: dayEvents.length - 3 })}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
