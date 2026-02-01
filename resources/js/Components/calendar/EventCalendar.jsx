import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { MapPin, MagnifyingGlass, CalendarBlank } from 'phosphor-react';
import CalendarHeader from './CalendarHeader';
import FilterBar from './FilterBar';
import EventDetailCard from './EventDetailCard';
import ErrorState from '@/Components/ErrorState';
import LoadingState from '@/Components/LoadingState';
import EmptyState from '@/Components/EmptyState';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/Contexts/LanguageContext';

// Weekday labels will be generated dynamically based on locale

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

export default function EventCalendar({
    initialMonth,
    initialYear,
    events = [],
    filters,
    initialSearch = '',
    showJumpMonths = true,
}) {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [hoveredEventId, setHoveredEventId] = useState(null);
    const [search, setSearch] = useState(initialSearch ?? '');
    const [isFirstRender, setIsFirstRender] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Keep local search state in sync if the server sends a new value
    useEffect(() => {
        setSearch(initialSearch ?? '');
    }, [initialSearch]);

    useEffect(() => {
        setIsFirstRender(false);
    }, []);

    // Debounced search that updates only the `search` param and preserves other query params
    useEffect(() => {
        if (isFirstRender) return;

        const handle = setTimeout(() => {
            const searchParams = new URLSearchParams(
                window.location.search ?? '',
            );

            if (search && search.trim().length > 0) {
                searchParams.set('search', search.trim());
            } else {
                searchParams.delete('search');
            }

            const data = Object.fromEntries(searchParams.entries());
            // Ensure locale is included from localStorage
            const locale = localStorage.getItem('app_language') || 'en';
            const dataWithLocale = { ...data, locale };

            router.get(route('calendar.index'), dataWithLocale, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [
                    'events',
                    'filters',
                    'meta',
                    'initialMonth',
                    'initialYear',
                    'locale',
                ],
            });
        }, 400);

        return () => clearTimeout(handle);
    }, [search, isFirstRender]);

    // Ensure events is an array
    const safeEvents = Array.isArray(events) ? events : [];

    // Create a map of events by ID for efficient lookup when selecting related events
    // This recursively includes ALL nested events (related and co-located) at all levels
    // Events with more complete data (having related/co-located events) take precedence
    const eventsById = useMemo(() => {
        const map = new Map();
        const processed = new Set(); // Track processed event IDs to avoid infinite loops
        
        // Recursive function to add an event and all its nested events to the map
        const addEventRecursively = (event) => {
            if (!event || !event.id || processed.has(event.id)) {
                return;
            }
            
            processed.add(event.id);
            
            // Check if we already have this event in the map
            const existing = map.get(event.id);
            
            // If we don't have it, or if the new one has more complete data (has related/co-located events),
            // add/update it in the map
            if (!existing || 
                (!existing.relatedEvents?.length && !existing.colocatedEvents?.length) &&
                (event.relatedEvents?.length || event.colocatedEvents?.length)) {
                map.set(event.id, event);
            }
            
            // Recursively process nested events
            if (event.relatedEvents && Array.isArray(event.relatedEvents)) {
                event.relatedEvents.forEach((related) => {
                    addEventRecursively(related);
                });
            }
            if (event.colocatedEvents && Array.isArray(event.colocatedEvents)) {
                event.colocatedEvents.forEach((colocated) => {
                    addEventRecursively(colocated);
                });
            }
        };
        
        // Start with all main events
        safeEvents.forEach((event) => {
            addEventRecursively(event);
        });
        
        return map;
    }, [safeEvents]);

    const grid = useMemo(
        () => buildMonthGrid(initialMonth, initialYear, safeEvents),
        [initialMonth, initialYear, safeEvents],
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
                            onClick={() => setSelectedEvent(event)}
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

    const renderMonthView = () => {
        // Generate weekday labels based on locale
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
    };

    const renderListView = () => {
        // De-duplicate events by ID and only show them once
        const uniqueEventsMap = new Map();
        safeEvents.forEach((event) => {
            if (!event || !event.startDateTime) return;
            if (!uniqueEventsMap.has(event.id)) {
                uniqueEventsMap.set(event.id, event);
            }
        });

        const listEvents = Array.from(uniqueEventsMap.values())
            .map((event) => {
                const start = new Date(event.startDateTime);
                const end = event.endDateTime
                    ? new Date(event.endDateTime)
                    : null;

                return { event, start, end };
            })
            .filter(({ start }) => {
                if (!start) return false;

                // Only show events whose start date is in the current visible month
                return (
                    start.getMonth() === initialMonth - 1 &&
                    start.getFullYear() === initialYear
                );
            })
            .sort((a, b) => a.start - b.start);

        if (!listEvents.length) {
            return (
                <EmptyState
                    icon={CalendarBlank}
                    title={t('common.noEventsFound')}
                    message={t('common.noEventsForMonth')}
                />
            );
        }

        return (
            <div className="divide-y divide-brand-border">
                {listEvents.map(({ event, start, end }) => {
                    const startDay = start.getDate();
                    const endDay = end ? end.getDate() : null;
                    const monthLabel = start
                        .toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                            month: 'short',
                        })
                        .toUpperCase();

                    return (
                        <motion.button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedEvent(event)}
                            className="flex w-full items-stretch gap-4 px-4 py-4 text-start sm:px-6"
                            transition={{
                                duration: 0.18,
                                ease: [0.22, 0.61, 0.36, 1],
                            }}
                            onHoverStart={() => setHoveredEventId(event.id)}
                            onHoverEnd={() => setHoveredEventId(null)}
                        >
                            {/* Date block */}
                            <div className="flex w-28 flex-shrink-0 items-center">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        backgroundColor:
                                            event.industryColor ||
                                            event.industry?.color ||
                                            'var(--color-brand-primary)',
                                    }}
                                    animate={{
                                        width:
                                            hoveredEventId === event.id
                                                ? 8
                                                : 4,
                                    }}
                                    transition={{
                                        duration: 0.18,
                                        ease: [0.22, 0.61, 0.36, 1],
                                    }}
                                />
                                <div className="ms-3 flex flex-col items-center justify-center text-slate-900">
                                    <div className="flex items-baseline text-xl font-bold leading-none sm:text-2xl">
                                        <span>{startDay}</span>
                                        {endDay !== null &&
                                            endDay !== startDay && (
                                                <>
                                                    <span className="mx-0.5 text-sm font-semibold">
                                                        –
                                                    </span>
                                                    <span>{endDay}</span>
                                                </>
                                            )}
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                                        {monthLabel}
                                    </div>
                                </div>
                            </div>

                            {/* Content block */}
                            <div className="flex min-w-0 flex-1 flex-col justify-center">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-base uppercase font-bold text-slate-900 sm:text-lg">
                                        {event.title}
                                    </h3>
                                    {event.type && (
                                        <span className="tag-pill">
                                            {event.type.name}
                                        </span>
                                    )}
                                </div>

                                    {(event.industry || event.tags?.length > 0) && (
                                    <div className="mt-1 text-[11px] text-brand-muted">
                                        <span className="font-semibold">
                                            {t('common.industry')}
                                        </span>{' '}
                                        <span className="text-slate-700">
                                            {event.industry?.name}
                                            {event.tags?.length > 0 && (
                                                <>
                                                    {event.industry?.name
                                                        ? ', '
                                                        : ''}
                                                    {event.tags
                                                        .map(
                                                            (tag) =>
                                                                tag.name ??
                                                                tag.slug,
                                                        )
                                                        .join(', ')}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {event.venue && (
                                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600">
                                        <MapPin className="h-3.5 w-3.5 text-brand-muted" />
                                        <span>
                                            {event.venue.name}
                                            {event.country?.name && (
                                                <>
                                                    {', '}
                                                    {event.country.name}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {event.organizers && event.organizers.length > 0 && (
                                    <div className="mt-1 text-[11px] text-brand-muted">
                                        <span className="font-semibold">
                                            {t('common.eventOrganizedBy')}
                                        </span>{' '}
                                        <span className="text-slate-700">
                                            {event.organizers.map((org, i) => (
                                                <span key={org.id}>
                                                    {org.name}
                                                    {i < event.organizers.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative overflow-hidden card-surface bg-brand-bg">
            <CalendarHeader
                currentMonth={initialMonth}
                currentYear={initialYear}
                showJumpMonths={showJumpMonths}
            />
            <FilterBar />
            <div className="border-b border-brand-border bg-gradient-to-r from-brand-bg to-brand-bg px-4 py-3 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-brand-muted sm:hidden">
                        {t('calendar.searchAndFilters')}
                    </div>
                    <div className="flex w-full">
                        <div className="relative w-full">
                            <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-brand-muted">
                                <MagnifyingGlass className="h-4 w-4" weight="bold" />
                            </span>
                            <input
                                type="search"
                                placeholder={t('calendar.searchPlaceholder')}
                                className="w-full rounded-full border border-brand-border bg-brand-surface py-3 ps-9 pe-3 text-xs text-slate-700 outline-none ring-0 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-b from-brand-bg to-brand-bg">
                {renderListView()}
            </div>
            <EventDetailCard
                event={
                    selectedEvent && {
                        ...selectedEvent,
                        onSelectRelated: (related) => {
                            if (!related?.id) {
                                setSelectedEvent(related);
                                return;
                            }

                            // Get the event from the map (which now includes all nested events recursively)
                            let fullEvent = eventsById.get(related.id);

                            // If event doesn't have related/co-located events, build them from the current selected event
                            // Co-located events are bidirectional - if A is co-located with B, then B should show A and other co-located events
                            if (fullEvent && (!fullEvent.relatedEvents?.length && !fullEvent.colocatedEvents?.length) && selectedEvent) {
                                // Find all events that are co-located with the current selected event
                                const currentColocatedEvents = selectedEvent.colocatedEvents || [];
                                const currentRelatedEvents = selectedEvent.relatedEvents || [];
                                
                                // Build co-located events list: all other co-located events from the current event, plus the current event itself
                                const newColocatedEvents = currentColocatedEvents
                                    .filter((e) => e.id !== related.id) // Exclude the clicked event
                                    .map((e) => eventsById.get(e.id) || e); // Get full event data if available
                                
                                // Add the current selected event to the co-located list (bidirectional relationship)
                                if (selectedEvent.id && selectedEvent.id !== related.id) {
                                    newColocatedEvents.push(selectedEvent);
                                }
                                
                                // Build related events list similarly
                                const newRelatedEvents = currentRelatedEvents
                                    .filter((e) => e.id !== related.id)
                                    .map((e) => eventsById.get(e.id) || e);
                                
                                if (newColocatedEvents.length > 0 || newRelatedEvents.length > 0) {
                                    fullEvent = {
                                        ...fullEvent,
                                        colocatedEvents: newColocatedEvents,
                                        relatedEvents: newRelatedEvents,
                                    };
                                }
                            }

                            if (fullEvent) {
                                // Merge the related event's data with the full event object
                                // This preserves any additional data from the related event
                                // while ensuring we have the full event's relatedEvents and colocatedEvents
                                const mergedEvent = {
                                    ...fullEvent,
                                    ...related,
                                    // Ensure we use the full event's related/co-located events if they exist
                                    relatedEvents: fullEvent.relatedEvents || related.relatedEvents,
                                    colocatedEvents: fullEvent.colocatedEvents || related.colocatedEvents,
                                };
                                
                                setSelectedEvent(mergedEvent);
                            } else {
                                // If not found in map, use the related event as-is
                                setSelectedEvent(related);
                            }
                        },
                    }
                }
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
}

