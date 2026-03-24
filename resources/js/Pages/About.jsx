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

const CONSULTATION_BG_IMG = '/images/consultation_bg.png';

export default function About() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    
    return (
        <PublicLayout>
            <Head title={t('about.title')} />

            <PageHeader
                title={t('about.pageTitle')}
                subtitle={t('about.subtitle')}
                description={t('about.description')}
            />

            {/* Welcome To Build Your Booth Section */}
            <AnimatedSection className="py-20 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <AnimatedItem className="space-y-6">
                            <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">
                                {t('about.welcomeTitle')}
                            </h4>
                            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tighter">
                                {t('about.welcomeHeading')}
                            </h2>
                            <p className="text-lg font-medium text-slate-600 leading-relaxed">
                                {t('about.welcomeDescription')}
                            </p>
                            
                            {/* Feature Points */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                                        <Check size={24} weight="bold" className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('about.daysDelivery')}</h3>
                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                            {t('about.daysDeliveryDesc')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                                        <Check size={24} weight="bold" className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('about.premiumMaterials')}</h3>
                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                            {t('about.premiumMaterialsDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedItem>

                        {/* Right Image */}
                        <AnimatedItem className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-200 aspect-[4/5]">
                            <img
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
                                className="w-full h-full object-cover"
                                alt="Professional Exhibition Booth"
                            />
                            {/* Client Count Overlay */}
                            <div className="absolute bottom-6 start-6 end-6 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-xl">
                                <div className="text-3xl font-black mb-1">1450+</div>
                                <div className="text-sm font-bold uppercase tracking-wide">{t('about.trustedClients')}</div>
                            </div>
                        </AnimatedItem>
                    </div>
                </div>
            </AnimatedSection>

            {/* Why Choose Us Section */}
            <AnimatedSection className="py-20 lg:py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Image */}
                        <AnimatedItem className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-200 aspect-square">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                                className="w-full h-full object-cover"
                                alt="Team Collaboration"
                            />
                            {/* Optional Speech Bubble Overlay */}
                            <div className="absolute top-6 end-6 bg-white px-4 py-3 rounded-xl shadow-lg max-w-[200px]">
                                <p className="text-sm font-medium text-slate-700 mb-1">
                                    "Excellent service and quality!"
                                </p>
                                <p className="text-xs font-bold text-blue-600">Alan Alexander</p>
                            </div>
                        </AnimatedItem>

                        {/* Right Content */}
                        <AnimatedItem className="space-y-6">
                            <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">
                                {t('about.whyChooseUs')}
                            </h4>
                            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tighter">
                                {t('about.whyChooseUsHeading')}
                            </h2>
                            <p className="text-lg font-medium text-slate-600 leading-relaxed">
                                {t('about.whyChooseUsDescription')}
                            </p>
                            
                            {/* Feature Points */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                                        {isRTL ? (
                                            <ArrowLeft size={24} weight="bold" className="text-white" />
                                        ) : (
                                            <ArrowRight size={24} weight="bold" className="text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('about.ourVision')}</h3>
                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                            {t('about.ourVisionDesc')}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                                        <Check size={24} weight="bold" className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('about.ourMission')}</h3>
                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                            {t('about.ourMissionDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-4">
                                <Link href="/contact">
                                    <motion.div
                                        whileHover={{ backgroundColor: '#1d4ed8' }}
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-block bg-blue-600 text-white font-bold px-10 py-5 rounded-md text-sm uppercase tracking-wide"
                                    >
                                        {t('common.buildYourBooth')}
                                    </motion.div>
                                </Link>
                            </div>
                        </AnimatedItem>
                    </div>
                </div>
            </AnimatedSection>

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
