import { useTranslation } from 'react-i18next';
import AnimatedSection from '@/Components/AnimatedSection';
import AnimatedItem from '@/Components/AnimatedItem';
import ProcessStep from './ProcessStep';

export default function WorkingProcessSection() {
    const { t } = useTranslation();

    return (
        <AnimatedSection className="py-20 lg:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <AnimatedItem className="max-w-3xl mx-auto space-y-6 mb-16 lg:mb-24">
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">{t('welcome.howItWorks')}</h4>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter">{t('welcome.workingProcess')}</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed px-4 sm:px-10">
                        {t('welcome.workingProcessDesc')}
                    </p>
                </AnimatedItem>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[20%] left-[15%] right-[15%] h-[1px] bg-slate-100 -z-0" />

                    <AnimatedItem>
                        <ProcessStep
                            number="01"
                            title={t('welcome.step1Title')}
                            description={t('welcome.step1Desc')}
                        />
                    </AnimatedItem>
                    <AnimatedItem>
                        <ProcessStep
                            number="02"
                            title={t('welcome.step2Title')}
                            description={t('welcome.step2Desc')}
                        />
                    </AnimatedItem>
                    <AnimatedItem>
                        <ProcessStep
                            number="03"
                            title={t('welcome.step3Title')}
                            description={t('welcome.step3Desc')}
                        />
                    </AnimatedItem>
                </div>
            </div>
        </AnimatedSection>
    );
}
