import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CalendarBlank } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/Contexts/LanguageContext';
import EmptyState from '@/Components/EmptyState';

export default function EventListView({ events, initialMonth, initialYear, onEventSelect }) {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [hoveredEventId, setHoveredEventId] = useState(null);

    // De-duplicate events by ID and only show them once
    const uniqueEventsMap = new Map();
    events.forEach((event) => {
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
                        onClick={() => onEventSelect(event)}
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
                                    width: hoveredEventId === event.id ? 8 : 4,
                                }}
                                transition={{
                                    duration: 0.18,
                                    ease: [0.22, 0.61, 0.36, 1],
                                }}
                            />
                            <div className="ms-3 flex flex-col items-center justify-center text-slate-900">
                                <div className="flex items-baseline text-xl font-bold leading-none sm:text-2xl">
                                    <span>{startDay}</span>
                                    {endDay !== null && endDay !== startDay && (
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
                                                {event.industry?.name ? ', ' : ''}
                                                {event.tags
                                                    .map(
                                                        (tag) =>
                                                            tag.name ?? tag.slug,
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
}
