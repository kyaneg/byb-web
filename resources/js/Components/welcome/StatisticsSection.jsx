import { CheckCircle, Users, Clock, ChartBar } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import AnimatedSection from '@/Components/AnimatedSection';
import AnimatedItem from '@/Components/AnimatedItem';
import StatCard from './StatCard';

export default function StatisticsSection() {
    const { t } = useTranslation();

    return (
        <AnimatedSection className="py-20 lg:py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedItem className="max-w-3xl mx-auto text-center space-y-6 mb-16 lg:mb-24">
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">{t('welcome.statisticsTitle')}</h4>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter">{t('welcome.statisticsSubtitle')}</h2>
                </AnimatedItem>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <AnimatedItem>
                        <StatCard
                            number={t('welcome.stat1Number')}
                            label={t('welcome.stat1Label')}
                            icon={CheckCircle}
                        />
                    </AnimatedItem>
                    <AnimatedItem>
                        <StatCard
                            number={t('welcome.stat2Number')}
                            label={t('welcome.stat2Label')}
                            icon={Users}
                        />
                    </AnimatedItem>
                    <AnimatedItem>
                        <StatCard
                            number={t('welcome.stat3Number')}
                            label={t('welcome.stat3Label')}
                            icon={Clock}
                        />
                    </AnimatedItem>
                    <AnimatedItem>
                        <StatCard
                            number={t('welcome.stat4Number')}
                            label={t('welcome.stat4Label')}
                            icon={ChartBar}
                        />
                    </AnimatedItem>
                </div>
            </div>
        </AnimatedSection>
    );
}
