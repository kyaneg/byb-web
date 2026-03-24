import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useTranslation } from 'react-i18next';
import CTABanner from '@/Components/CTABanner';
import HeroSection from '@/Components/welcome/HeroSection';
import ServicesSection from '@/Components/welcome/ServicesSection';
import PortfolioSection from '@/Components/welcome/PortfolioSection';
import StatisticsSection from '@/Components/welcome/StatisticsSection';
import WorkingProcessSection from '@/Components/welcome/WorkingProcessSection';

const CONSULTATION_BG_IMG = '/images/consultation_bg.png';

export default function Welcome() {
    const { t } = useTranslation();

    return (
        <PublicLayout>
            <Head title={t('welcome.title')} />

            <HeroSection />

            <ServicesSection />
            
            <StatisticsSection />

            <CTABanner
                title={t('welcome.consultationTitle')}
                description={t('welcome.consultationDescription')}
                buttonText={t('welcome.consultationButton')}
                backgroundImage={CONSULTATION_BG_IMG}
            />

            <WorkingProcessSection />
        </PublicLayout>
    );
}
