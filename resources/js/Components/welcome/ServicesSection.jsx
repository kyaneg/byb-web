import { PaintBrush, Wrench, ChartBar } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import AnimatedSection from '@/Components/AnimatedSection';
import AnimatedItem from '@/Components/AnimatedItem';
import ServiceCard from './ServiceCard';

export default function ServicesSection() {
    const { t } = useTranslation();

    return (
        <AnimatedSection className="py-20 lg:py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedItem className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
                    <div className="space-y-4 max-w-2xl">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">{t('welcome.servicesTitle')}</h4>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter">{t('welcome.servicesSubtitle')}</h2>
                    </div>
                    <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed pb-2">
                        {t('welcome.servicesDescription')}
                    </p>
                </AnimatedItem>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatedItem>
                        <ServiceCard
                            icon={PaintBrush}
                            title={t('welcome.boothDesign')}
                            description={t('welcome.boothDesignDesc')}
                        />
                    </AnimatedItem>
                    <AnimatedItem>
                        <ServiceCard
                            icon={Wrench}
                            title={t('welcome.boothBuild')}
                            description={t('welcome.boothBuildDesc')}
                            highlighted
                        />
                    </AnimatedItem>
                    <AnimatedItem>
                        <ServiceCard
                            icon={ChartBar}
                            title={t('welcome.performanceReport')}
                            description={t('welcome.performanceReportDesc')}
                        />
                    </AnimatedItem>
                </div>
            </div>
        </AnimatedSection>
    );
}
