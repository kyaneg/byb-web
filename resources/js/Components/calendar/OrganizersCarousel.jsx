import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LinkSimple,
    UserCircle,
    EnvelopeSimple,
    CaretLeft,
    CaretRight,
} from 'phosphor-react';

/**
 * Organizers Carousel Component
 * Displays multiple organizers in a responsive carousel (2 on desktop, 1 on mobile)
 */
export default function OrganizersCarousel({ organizers, t }) {
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
