import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, MapPin, CaretLeft, CaretRight } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function CoLocatedEventsCarousel({
    colocatedEvents = [],
    onSelectEvent,
}) {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(3);

    // Handle responsive visible count
    useEffect(() => {
        const handleResize = () => {
            setVisibleCount(window.innerWidth < 640 ? 1 : 3);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Early return if no co-located events
    if (!colocatedEvents || colocatedEvents.length === 0) {
        return null;
    }

    const totalPages = Math.ceil(colocatedEvents.length / visibleCount);
    const currentPage = Math.floor(currentIndex / visibleCount);

    // Get current visible events
    const visibleEvents = useMemo(() => {
        const start = currentPage * visibleCount;
        return colocatedEvents.slice(start, start + visibleCount);
    }, [colocatedEvents, currentPage, visibleCount]);

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

    const handlePageDotClick = useCallback(
        (pageIndex) => {
            setCurrentIndex(pageIndex * visibleCount);
        },
        [visibleCount],
    );

    const canGoPrevious = currentIndex > 0;
    const canGoNext = currentPage < totalPages - 1;

    return (
        <div className="mt-4 rounded-2xl bg-brand-accent/5 px-4 py-3 ring-1 ring-brand-accent/20">
            {/* Header with title and navigation */}
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-accent">
                    <span>{t('common.coLocatedEvents')}</span>
                    <span className="rounded-full bg-brand-accent/10 px-2 py-0.5 text-[10px] font-bold">
                        {colocatedEvents.length}
                    </span>
                </div>

                {/* Navigation arrows - only show if more than 3 events */}
                {colocatedEvents.length > visibleCount && (
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
                        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                    >
                        {visibleEvents.map((eventItem) => {
                            const eventStart = eventItem.start_datetime
                                ? new Date(eventItem.start_datetime)
                                : null;

                            const eventHero =
                                Array.isArray(eventItem.images) &&
                                eventItem.images.length > 0
                                    ? eventItem.images[0]
                                    : null;

                            const eventHeroUrl =
                                (eventHero && (eventHero.url ?? eventHero)) ||
                                `https://placehold.co/600x400?text=Image+Not+Available`;

                            return (
                                <button
                                    key={eventItem.id}
                                    type="button"
                                    onClick={() => {
                                        if (typeof onSelectEvent === 'function') {
                                            onSelectEvent(eventItem);
                                        }
                                    }}
                                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-accent/30 bg-white text-start text-xs text-slate-800 transition hover:border-brand-accent hover:shadow-md"
                                >
                                    {eventHeroUrl && (
                                        <div className="relative h-20 w-full flex-shrink-0 overflow-hidden bg-slate-100">
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-brand-accent/5" />
                                            <img
                                                src={eventHeroUrl}
                                                alt={eventItem.title}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                    )}
                                    <div className="flex min-w-0 flex-1 flex-col px-2.5 py-2">
                                        <div className="mb-1 line-clamp-2 font-semibold text-slate-900">
                                            {eventItem.title}
                                        </div>
                                        {eventItem.event_type && (
                                            <span className="mb-1.5 inline-block rounded-full bg-brand-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-accent">
                                                {eventItem.event_type.name}
                                            </span>
                                        )}
                                        {eventStart && (
                                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="truncate">
                                                    {eventStart.toLocaleDateString(
                                                        language === 'ar'
                                                            ? 'ar-SA'
                                                            : 'en-US',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}{' '}
                                                    {eventStart.toLocaleTimeString(
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
                                        {eventItem.venue && (
                                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="truncate">
                                                    {eventItem.venue.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Page indicator */}
            {colocatedEvents.length > visibleCount && (
                <div className="mt-2 flex justify-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handlePageDotClick(i)}
                            className={`h-1.5 rounded-full transition-all ${
                                i === currentPage
                                    ? 'w-6 bg-brand-accent'
                                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                            aria-label={`Go to page ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
