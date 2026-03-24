import { useTranslation } from 'react-i18next';
import { FolderOpen } from 'phosphor-react';
import AnimatedSection, { AnimatedItem } from '@/Components/AnimatedSection';
import PortfolioCard from './PortfolioCard';
import EmptyState from '@/Components/EmptyState';

export default function PortfolioSection({ portfolios = [] }) {
    const { t } = useTranslation();

    // Debug: Log portfolios
    console.log('PortfolioSection - Portfolios received:', portfolios, 'Count:', portfolios.length);

    return (
        <AnimatedSection id="portfolio" className="py-20 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* <AnimatedItem className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
                    <div className="space-y-4 max-w-2xl">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">{t('welcome.portfolioTitle')}</h4>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter">{t('welcome.portfolioSubtitle')}</h2>
                    </div>
                    <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed pb-2">
                        {t('welcome.portfolioDescription')}
                    </p>
                </AnimatedItem> */}

                {portfolios && portfolios.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {portfolios.map((portfolio) => (
                            <AnimatedItem key={portfolio.id}>
                                <PortfolioCard portfolio={portfolio} />
                            </AnimatedItem>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={FolderOpen}
                        title={t('welcome.noPortfolios', 'No portfolios available')}
                        message=""
                    />
                )}
            </div>
        </AnimatedSection>
    );
}
