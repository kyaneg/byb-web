import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Clock,
    LinkSimple,
    ListBullets,
    MapPin,
    UserCircle,
    EnvelopeSimple,
    CalendarPlus,
    GoogleLogo,
    Bed,
    CaretLeft,
    CaretRight,
} from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/Contexts/LanguageContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useEventData } from '@/hooks/useEventData';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { truncate } from '@/utils/stringUtils';
import { buildStay22Src, buildGoogleCalendarUrl, downloadIcs } from '@/utils/calendarUtils';
import CoLocatedEventsCarousel from './CoLocatedEventsCarousel';

export default function EventDetailCard({ event, onClose }) {
    const { t } = useTranslation();
    const { language } = useLanguage();
    // Prevent background scrolling
    useScrollLock(!!event);

    // Process event data
    const { start, end, startDay, endDay, monthLabel, heroImage } = useEventData(
        event,
        language,
    );

    // Memoize calendar URLs and functions
    const stay22Src = useMemo(
        () => (event ? buildStay22Src(event) : null),
        [event],
    );

    const googleCalendarUrl = useMemo(
        () => (event ? buildGoogleCalendarUrl(event, truncate) : '#'),
        [event],
    );

    // Memoize event handlers
    const handleDownloadIcs = useCallback(() => {
        if (event) {
            downloadIcs(event, truncate);
        }
    }, [event]);

    const handleBackgroundClick = useCallback(
        (e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose],
    );

    const handleBackgroundWheel = useCallback((e) => {
        if (e.target === e.currentTarget) {
            e.preventDefault();
        }
    }, []);

    const handleBackgroundTouchMove = useCallback((e) => {
        if (e.target === e.currentTarget) {
            e.preventDefault();
        }
    }, []);

    const handleCardClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    const handleBodyWheel = useCallback((e) => {
        e.stopPropagation();
    }, []);

    const handleBodyTouchMove = useCallback((e) => {
        e.stopPropagation();
    }, []);

    // Format date/time helpers
    const formatDateLocal = useCallback(
        (date) => formatDate(date, language),
        [language],
    );

    const formatTimeLocal = useCallback(
        (date) => formatTime(date, language),
        [language],
    );

    // Early return after all hooks (Rules of Hooks)
    if (!event) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 py-6 sm:px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackgroundClick}
                onWheel={handleBackgroundWheel}
                onTouchMove={handleBackgroundTouchMove}
            >
                <motion.div
                    className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-brand-bg shadow-2xl"
                    style={{
                        maxHeight: '90vh',
                        height: '90vh',
                    }}
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                    onClick={handleCardClick}
                >
                    {/* Header */}
                    <div className="flex flex-shrink-0 items-start justify-between border-b border-brand-border bg-brand-surface px-6 py-4 sm:px-8">
                        <div className="flex min-w-0 items-start gap-4">
                            {/* Date block */}
                            <div className="flex items-center">
                                <div className="h-full w-1 rounded-full bg-brand-primary" />
                                <div className="ms-3 flex flex-col items-center justify-center text-slate-900">
                                    <div className="flex items-baseline text-xl font-black leading-none sm:text-2xl">
                                        {startDay !== null && <span>{startDay}</span>}
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
                                    <div className="mt-0.5 text-[10px] uppercase tracking-wide text-brand-muted">
                                        {start &&
                                            start.getFullYear() === end?.getFullYear() &&
                                            start.getFullYear()}
                                    </div>
                                </div>
                            </div>

                            {/* Title + meta */}
                            <div className="space-y-1 min-w-0">
                                <h2
                                    className="text-2xl font-bold uppercase tracking-tight text-slate-900 sm:text-xl"
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {event.title}
                                </h2>
                                <div className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
                                    <span>{event.type?.name ?? t('common.type')}</span>
                                </div>

                                {(event.industry || event.tags?.length > 0) && (
                                    <div className="text-[11px] text-brand-muted">
                                        <span className="font-semibold">
                                            {t('common.industry')}
                                        </span>{' '}
                                        <span className="text-slate-700">
                                            {event.industry?.name}
                                            {event.tags?.length > 0 && (
                                                <>
                                                    {event.industry?.name ? ', ' : ''}
                                                    {event.tags
                                                        .map((t) => t.name ?? t.slug)
                                                        .join(', ')}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {event.venue && (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                        <MapPin
                                            className="h-3.5 w-3.5 text-slate-400"
                                            weight="fill"
                                        />
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
                                    <div className="text-[11px] text-slate-500">
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
                        </div>

                        <div className="ms-4 flex-shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div
                        className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-5 pt-3 text-sm text-slate-700 sm:px-6"
                        style={{
                            minHeight: 0,
                            WebkitOverflowScrolling: 'touch',
                        }}
                        onWheel={handleBodyWheel}
                        onTouchMove={handleBodyTouchMove}
                    >
                        {/* Hero image */}
                        {heroImage && (
                            <div className="overflow-hidden rounded-2xl bg-slate-200">
                                <img
                                    src={heroImage.url ?? heroImage}
                                    alt={heroImage.alt ?? event.title}
                                    className="h-64 w-full object-cover object-top sm:h-80"
                                />
                            </div>
                        )}

                        {/* Event details text */}
                        {event.description && (
                            <div className="rounded-2xl bg-brand-surface px-4 py-3 ring-1 ring-brand-border/70">
                                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                                    <ListBullets
                                        className="h-4 w-4 text-slate-400"
                                        weight="fill"
                                    />
                                    <span>{t('common.eventDetails')}</span>
                                </div>
                                <div
                                    className="prose prose-sm mt-1 max-w-none text-slate-800 prose-headings:text-slate-900 prose-a:text-brand-primary hover:prose-a:text-brand-primary-dark prose-strong:text-slate-900 prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-brand-muted"
                                    dangerouslySetInnerHTML={{
                                        __html: event.description,
                                    }}
                                />
                            </div>
                        )}

                        {/* Time & Location row */}
                        {(start || end || event.venue) && (
                            <div className="grid gap-3 rounded-2xl bg-white p-4 text-sm text-slate-800 ring-1 ring-slate-100 sm:grid-cols-2">
                                <div>
                                    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                                        <Clock
                                            className="h-4 w-4 text-slate-400"
                                            weight="fill"
                                        />
                                        <span>{t('common.time')}</span>
                                    </div>
                                    <div className="mt-1 text-sm text-slate-800">
                                        {start && (
                                            <span>
                                                {formatDateLocal(start)}{' '}
                                                {formatTimeLocal(start)}
                                            </span>
                                        )}
                                        {end && (
                                            <>
                                                {' '}
                                                –{' '}
                                                <span>
                                                    {formatDateLocal(end)}{' '}
                                                    {formatTimeLocal(end)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {event.venue && (
                                    <div>
                                        <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            <MapPin
                                                className="h-4 w-4 text-slate-400"
                                                weight="fill"
                                            />
                                            <span>{t('common.location')}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-800">
                                            {event.venue.name}
                                            {event.country?.name && (
                                                <>
                                                    {', '}
                                                    {event.country.name}
                                                </>
                                            )}
                                        </div>
                                        {event.googleMapsUrl && (
                                            <a
                                                href={event.googleMapsUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-flex text-xs font-semibold text-brand-primary hover:text-brand-primary-dark"
                                            >
                                                {t('common.viewOnGoogleMaps')}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Accommodation (Stay22) */}
                        {event.isAccommodationAvailable && stay22Src && (
                            <div className="rounded-2xl bg-brand-surface px-4 py-3 ring-1 ring-brand-border/70">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <Bed
                                            className="h-4 w-4 text-brand-muted"
                                            weight="fill"
                                        />
                                        <span>{t('common.nearbyStays')}</span>
                                    </div>
                                </div>
                                <div className="mt-2 overflow-hidden rounded-2xl border border-brand-border bg-brand-bg">
                                    <iframe
                                        title="Nearby accommodations"
                                        src={stay22Src}
                                        width="100%"
                                        height="380"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="block"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Organizers Carousel */}
                        {event.organizers && event.organizers.length > 0 && (
                            <OrganizersCarousel organizers={event.organizers} t={t} />
                        )}

                        {/* Tags */}
                        {event.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {event.tags.map((tag) => (
                                    <span
                                        key={tag.id ?? tag.slug}
                                        className="tag-pill"
                                    >
                                        #{tag.name ?? tag.slug}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Co-located events carousel - manually linked events */}
                        {event.colocatedEvents && event.colocatedEvents.length > 0 && (
                            <CoLocatedEventsCarousel
                                colocatedEvents={event.colocatedEvents}
                                onSelectEvent={(colocatedEvent) => {
                                    if (typeof event.onSelectRelated === 'function') {
                                        event.onSelectRelated(colocatedEvent);
                                    }
                                }}
                            />
                        )}

                        {/* Related events */}
                        {event.relatedEvents && event.relatedEvents.length > 0 && (
                            <div className="mt-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        {t('common.relatedEvents')}
                                    </div>
                                    {event.relatedEvents.length > 3 && (
                                        <div className="text-[11px] text-slate-400">
                                            {t('common.showing')} 3 {t('common.of')}{' '}
                                            {event.relatedEvents.length}
                                        </div>
                                    )}
                                </div>
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {event.relatedEvents.slice(0, 3).map((related) => {
                                        const relatedStart = related.startDateTime
                                            ? new Date(related.startDateTime)
                                            : null;

                                        const relatedHero =
                                            Array.isArray(related.images) &&
                                            related.images.length > 0
                                                ? related.images[0]
                                                : null;

                                        const relatedHeroUrl =
                                            (relatedHero &&
                                                (relatedHero.url ?? relatedHero)) ||
                                            `https://placehold.co/600x400?text=Image+Not+Available`;

                                        return (
                                            <button
                                                key={related.id}
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        typeof event.onSelectRelated ===
                                                        'function'
                                                    ) {
                                                        event.onSelectRelated(related);
                                                    }
                                                }}
                                                className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 text-start text-xs text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-50"
                                            >
                                                {relatedHeroUrl && (
                                                    <div className="h-20 w-full flex-shrink-0 overflow-hidden bg-slate-200">
                                                        <img
                                                            src={relatedHeroUrl}
                                                            alt={related.title}
                                                            className="h-full w-full object-cover object-center"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex min-w-0 flex-1 flex-col px-2.5 py-2">
                                                    <div className="mb-1 flex items-start justify-between gap-2">
                                                        <span className="line-clamp-2 font-semibold text-slate-900">
                                                            {related.title}
                                                        </span>
                                                        {related.type && (
                                                            <span className="whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                                                {related.type.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {relatedStart && (
                                                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className="truncate">
                                                                {relatedStart.toLocaleDateString(
                                                                    language === 'ar'
                                                                        ? 'ar-SA'
                                                                        : 'en-US',
                                                                    {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    },
                                                                )}{' '}
                                                                {relatedStart.toLocaleTimeString(
                                                                    language === 'ar'
                                                                        ? 'ar-SA'
                                                                        : 'en-US',
                                                                    {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {related.venue && (
                                                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className="truncate">
                                                                {related.venue.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Actions: external link + calendar buttons */}
                        {(event.externalLink || event.startDateTime) && (
                            <div className="flex flex-col gap-2 border-t border-brand-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                {event.externalLink && (
                                    <a
                                        href={event.externalLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-primary px-4 py-1.5 text-xs"
                                    >
                                        <LinkSimple
                                            className="me-1.5 h-4 w-4"
                                            weight="fill"
                                        />
                                        <span>{t('common.learnMore')}</span>
                                    </a>
                                )}

                                {event.startDateTime && (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDownloadIcs}
                                            className="inline-flex items-center justify-center rounded-button border border-brand-border bg-brand-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700 hover:bg-brand-primary-soft"
                                        >
                                            <CalendarPlus
                                                className="me-1.5 h-4 w-4 text-brand-muted"
                                                weight="fill"
                                            />
                                            {t('common.addToCalendar')}
                                        </button>
                                        <a
                                            href={googleCalendarUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-outline px-3 py-1.5 text-[11px]"
                                        >
                                            <GoogleLogo
                                                className="me-1.5 h-4 w-4"
                                                weight="fill"
                                            />
                                            {t('common.addToGoogleCalendar')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Organizers Carousel Component
 * Displays multiple organizers in a responsive carousel (2 on desktop, 1 on mobile)
 */
function OrganizersCarousel({ organizers, t }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(2);

    // Handle responsive visible count
    useEffect(() => {
        const handleResize = () => {
            setVisibleCount(window.innerWidth < 640 ? 1 : 2);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalPages = Math.ceil(organizers.length / visibleCount);
    const currentPage = Math.floor(currentIndex / visibleCount);

    // Get current visible organizers
    const visibleOrganizers = useMemo(() => {
        const start = currentPage * visibleCount;
        return organizers.slice(start, start + visibleCount);
    }, [organizers, currentPage, visibleCount]);

    // Navigation handlers
    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => {
            const newPage = Math.max(0, currentPage - 1);
            return newPage * visibleCount;
        });
    }, [currentPage, visibleCount]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => {
            const newPage = Math.min(totalPages - 1, currentPage + 1);
            return newPage * visibleCount;
        });
    }, [currentPage, totalPages, visibleCount]);

    const handlePageDotClick = useCallback((pageIndex) => {
        setCurrentIndex(pageIndex * visibleCount);
    }, [visibleCount]);

    const canGoPrevious = currentIndex > 0;
    const canGoNext = currentPage < totalPages - 1;

    return (
        <section
            className="rounded-2xl bg-brand-surface px-4 py-3 ring-1 ring-brand-border/70"
            aria-label="Event organizers"
        >
            {/* Header with title and navigation */}
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    <span>{t('common.organizers')}</span>
                    <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                        {organizers.length}
                    </span>
                </div>

                {/* Navigation arrows - only show if more than visible count */}
                {organizers.length > visibleCount && (
                    <div className="flex items-center gap-1 z-10">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handlePrevious();
                            }}
                            disabled={!canGoPrevious}
                            className="relative z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-brand-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600"
                            aria-label={t('common.previous')}
                        >
                            <CaretLeft className="h-3.5 w-3.5 pointer-events-none" weight="bold" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleNext();
                            }}
                            disabled={!canGoNext}
                            className="relative z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-brand-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600"
                            aria-label={t('common.next')}
                        >
                            <CaretRight className="h-3.5 w-3.5 pointer-events-none" weight="bold" />
                        </button>
                    </div>
                )}
            </div>

            {/* Carousel content with animation */}
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                        {visibleOrganizers.map((organizer) => {
                            const organizerImage = organizer.image || organizer.logo_url || organizer.logo;

                            return (
                                <div
                                    key={organizer.id}
                                    className="flex items-start gap-3 rounded-xl border border-brand-border/50 bg-white p-3"
                                >
                                    {/* Organizer image - 80x80 */}
                                    {organizerImage ? (
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-brand-bg">
                                            <img
                                                src={organizerImage}
                                                alt={organizer.name}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-brand-bg">
                                            <UserCircle
                                                className="h-10 w-10 text-brand-muted"
                                                weight="fill"
                                            />
                                        </div>
                                    )}

                                    {/* Organizer content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-slate-900">
                                            {organizer.name}
                                        </div>
                                        
                                        {organizer.description && (
                                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                                                {organizer.description}
                                            </p>
                                        )}

                                        {/* Contact links */}
                                        {(organizer.website_url || organizer.email || organizer.phone) && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {organizer.website_url && (
                                                    <a
                                                        href={organizer.website_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center rounded-md bg-brand-primary px-2 py-0.5 text-[10px] font-semibold text-white hover:text-white hover:bg-brand-primary-dark"
                                                    >
                                                        <LinkSimple className="me-1 h-3 w-3" weight="fill" />
                                                        {t('common.website')}
                                                    </a>
                                                )}
                                                {organizer.email && (
                                                    <a
                                                        href={`mailto:${organizer.email}`}
                                                        className="inline-flex items-center rounded-md border border-brand-border bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-brand-primary-soft"
                                                    >
                                                        <EnvelopeSimple className="me-1 h-3 w-3 text-brand-muted" weight="fill" />
                                                        <span className="max-w-[120px] truncate">
                                                            {organizer.email}
                                                        </span>
                                                    </a>
                                                )}
                                                {organizer.phone && (
                                                    <a
                                                        href={`tel:${organizer.phone}`}
                                                        className="inline-flex items-center rounded-md border border-brand-border bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-brand-primary-soft"
                                                    >
                                                        <span className="truncate">
                                                            {organizer.phone}
                                                        </span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Page dots indicator */}
            {organizers.length > visibleCount && (
                <div className="mt-3 flex justify-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handlePageDotClick(i)}
                            className={`h-1.5 rounded-full transition-all ${
                                i === currentPage
                                    ? 'w-6 bg-brand-primary'
                                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                            aria-label={`Go to page ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
