import { MagnifyingGlass } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

export default function CalendarSearchBar({ search, onSearchChange }) {
    const { t } = useTranslation();

    return (
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
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
