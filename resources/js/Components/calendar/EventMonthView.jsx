import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/Contexts/LanguageContext';

function buildMonthGrid(month, year, events) {
    const firstOfMonth = new Date(year, month - 1, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = 0; i < startWeekday; i++) {
        const date = new Date(year, month - 1, 1 - (startWeekday - i));
        days.push({ date, isCurrentMonth: false, events: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        days.push({ date, isCurrentMonth: true, events: [] });
    }

    while (days.length < 35) {
        const last = days[days.length - 1].date;
        const date = new Date(
            last.getFullYear(),
            last.getMonth(),
            last.getDate() + 1,
        );
        days.push({ date, isCurrentMonth: false, events: [] });
    }

    const byDayKey = (date) =>
        date.toISOString().slice(0, 10);

    const eventInstances = events.map((event) => {
        const start = event.startDateTime
            ? new Date(event.startDateTime)
            : null;
        const end = event.endDateTime
            ? new Date(event.endDateTime)
            : start;

        if (!start || !end) return null;

        const instances = [];
        const cursor = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
        );
        const endDate = new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate(),
        );

        while (cursor <= endDate) {
            instances.push({
                dateKey: byDayKey(cursor),
                event,
            });
            cursor.setDate(cursor.getDate() + 1);
        }

        return instances;
    });

    const flatInstances = eventInstances
        .filter(Boolean)
        .flat();

    const eventsByDay = flatInstances.reduce((acc, inst) => {
        acc[inst.dateKey] = acc[inst.dateKey] || [];
        acc[inst.dateKey].push(inst.event);
        return acc;
    }, {});

    return days.map((day) => {
        const key = byDayKey(day.date);
        return {
            ...day,
            events: eventsByDay[key] || [],
        };
    });
}

export default function EventMonthView({ events, initialMonth, initialYear, onEventSelect }) {
    const { t } = useTranslation();
    const { language } = useLanguage();

    const grid = useMemo(
        () => buildMonthGrid(initialMonth, initialYear, events),
        [initialMonth, initialYear, events],
    );

    const todayKey = new Date().toISOString().slice(0, 10);

    const renderDayCell = (day, index) => {
        const dateKey = day.date.toISOString().slice(0, 10);
        const isToday = dateKey === todayKey;
        const maxVisible = 3;
        const visibleEvents = day.events.slice(0, maxVisible);
        const extraCount = day.events.length - visibleEvents.length;

        return (
            <div
                key={dateKey + index}
                className={`relative flex flex-col border border-brand-border/60 bg-brand-surface p-1.5 text-xs ${day.isCurrentMonth
                    ? ''
                    : 'bg-brand-bg text-brand-muted'
                    }`}
            >
                <div className="mb-1 flex items-center justify-between">
                    <div
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${isToday
                            ? 'bg-brand-primary text-white'
                            : 'text-slate-600'
                            }`}
                    >
                        {day.date.getDate()}
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                    {visibleEvents.map((event) => (
                        <button
                            key={event.id + dateKey}
                            type="button"
                            onClick={() => onEventSelect(event)}
                            className="inline-flex w-full items-center rounded-full bg-brand-primary-soft px-2 py-0.5 text-start text-[11px] font-medium text-brand-primary hover:bg-brand-primary/10"
                        >
                            <span className="me-1 h-2 w-1 rounded-full bg-brand-primary" />
                            <span className="truncate">
                                {event.title}
                            </span>
                        </button>
                    ))}
                    {extraCount > 0 && (
                        <div className="mt-0.5 text-[11px] font-medium text-brand-muted">
                            +{extraCount} {t('common.more')}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const weekdayLabels = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(2024, 0, i + 7); // Use a Sunday as base
        weekdayLabels.push(
            date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' }).toUpperCase()
        );
    }

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-7 border-b border-brand-border/60 bg-brand-bg text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                {weekdayLabels.map((label, idx) => (
                    <div
                        key={idx}
                        className="px-2 py-2 text-center"
                    >
                        {label}
                    </div>
                ))}
            </div>
            <div className="grid min-h-[420px] grid-cols-7 bg-brand-bg">
                {grid.map((day, idx) => renderDayCell(day, idx))}
            </div>
        </div>
    );
}
