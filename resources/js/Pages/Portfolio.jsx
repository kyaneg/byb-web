import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Check, ArrowRight, ArrowLeft } from 'phosphor-react';
import PageHeader from '@/Components/PageHeader';
import CTABanner from '@/Components/CTABanner';
import AnimatedSection from '@/Components/AnimatedSection';
import AnimatedItem from '@/Components/AnimatedItem';
import { motion } from 'framer-motion';
import { useLanguage } from '@/Contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import PortfolioSection from '@/Components/welcome/PortfolioSection';

const CONSULTATION_BG_IMG = '/images/consultation_bg.png';

export default function Portfolio({ portfolios = [] }) {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();

    return (
        <PublicLayout>
            <Head title={t('portfolio.title')} />

            <PageHeader
                title={t('portfolio.pageTitle')}
                description={t('portfolio.description')}
            />

            {/* Content */}
            <PortfolioSection portfolios={portfolios} />

            {/* Call-to-Action Banner */}
            <CTABanner
                title={t('about.ctaTitle')}
                description={t('about.ctaDescription')}
                buttonText={t('about.ctaButton')}
                backgroundImage={CONSULTATION_BG_IMG}
            />
        </PublicLayout>
    );
}