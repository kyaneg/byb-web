import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { MapPin, Phone, EnvelopeSimple, ChatCircleText, CheckCircle, WarningCircle } from 'phosphor-react';
import PageHeader from '@/Components/PageHeader';
import AnimatedSection from '@/Components/AnimatedSection';
import AnimatedItem from '@/Components/AnimatedItem';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { COUNTRIES } from '@/config/countries';
import { useEffect } from 'react';

const Input = ({ label, error, ...props }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        <input
            {...props}
            className={`w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 outline-none ${error ? 'ring-2 ring-red-500/20' : ''}`}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
);

export default function Contact() {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        email: '',
        country: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contact.send'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    // Clear errors when input changes
    useEffect(() => {
        if (recentlySuccessful) {
            const timer = setTimeout(() => {
                // Clear success message after 5 seconds
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [recentlySuccessful]);

    return (
        <PublicLayout>
            <Head title={t('contact.title')} />

            <PageHeader
                title={t('contact.pageTitle')}
                subtitle={t('contact.subtitle')}
                description={t('contact.description')}
            />

            <AnimatedSection className="py-20 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Contact Form */}
                        <AnimatedItem className="bg-white p-6 sm:p-12 rounded-3xl border border-gray-100">
                            <h3 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">{t('contact.sendMessage')}</h3>

                            {/* Success Message */}
                            {recentlySuccessful && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3"
                                >
                                    <CheckCircle size={24} weight="bold" className="text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-green-900">{t('contact.successTitle')}</p>
                                        <p className="text-sm text-green-700 mt-1">{t('contact.successMessage')}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Error Message */}
                            {Object.keys(errors).length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
                                >
                                    <WarningCircle size={24} weight="bold" className="text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-900">{t('contact.errorTitle')}</p>
                                        <p className="text-sm text-red-700 mt-1">{t('contact.errorMessage')}</p>
                                    </div>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        type="text"
                                        label={t('contact.fullName')}
                                        placeholder={t('contact.placeholders.fullName')}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                    />
                                    <Input
                                        type="email"
                                        label={t('contact.emailAddress')}
                                        placeholder={t('contact.placeholders.email')}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('contact.country')}</label>
                                    <select
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        className={`w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 outline-none ${errors.country ? 'ring-2 ring-red-500/20' : ''}`}
                                    >
                                        <option value="">{t('contact.placeholders.country')}</option>
                                        {COUNTRIES.map((country) => (
                                            <option key={country} value={country}>
                                                {t(`contact.countries.${country}`)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.country && <p className="text-xs text-red-500 font-medium">{errors.country}</p>}
                                </div>
                                <Input
                                    type="text"
                                    label={t('contact.subject')}
                                    placeholder={t('contact.projectInquiry')}
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    error={errors.subject}
                                />
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('contact.message')}</label>
                                    <textarea
                                        rows="5"
                                        placeholder={t('contact.tellUsAboutProject')}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className={`w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 outline-none resize-none ${errors.message ? 'ring-2 ring-red-500/20' : ''}`}
                                    ></textarea>
                                    {errors.message && <p className="text-xs text-red-500 font-medium">{errors.message}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                                >
                                    {processing ? t('contact.sendingButton') : t('contact.sendMessageButton')}
                                </button>
                            </form>
                        </AnimatedItem>

                        {/* Contact Info */}
                        <AnimatedItem className="flex flex-col">
                            <h3 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">{t('contact.information')}</h3>

                            <div className="space-y-6">
                                {/* KSA Office */}
                                <AnimatedItem>
                                    <motion.div
                                        whileHover={{ borderColor: '#dbeafe' }}
                                        className="flex gap-6 p-6 rounded-3xl border border-slate-50"
                                    >
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <MapPin size={28} weight="bold" className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-2">{t('contact.ksaOffice')}</h4>
                                            <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                                {t('contact.ksaAddress')}<br />
                                                {t('contact.ksaRegistration')}
                                            </p>
                                            <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm">
                                                <Phone size={18} weight="bold" />
                                                <a href="tel:+966547639806" className="hover:underline">(+966) 54 763 9806</a>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatedItem>

                                {/* Egypt Office */}
                                <AnimatedItem>
                                    <motion.div
                                        whileHover={{ borderColor: '#dbeafe' }}
                                        className="flex gap-6 p-6 rounded-3xl border border-slate-50"
                                    >
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <MapPin size={28} weight="bold" className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-2">{t('contact.egyptOffice')}</h4>
                                            <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                                {t('contact.egyptAddress')}<br />
                                                {t('contact.egyptHub')}
                                            </p>
                                            <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm">
                                                <Phone size={18} weight="bold" />
                                                <a href="tel:+201005003732" className="hover:underline">(+20) 100 500 3732</a>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatedItem>

                                {/* General Contact */}
                                <AnimatedItem>
                                    <motion.div
                                        whileHover={{ borderColor: '#dbeafe' }}
                                        className="flex gap-6 p-6 rounded-3xl border border-slate-50"
                                    >
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <EnvelopeSimple size={28} weight="bold" className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-2">{t('contact.emailWhatsApp')}</h4>
                                            <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                                {t('contact.responseTime')}
                                            </p>
                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                                                    <EnvelopeSimple size={18} weight="bold" />
                                                    <a href="mailto:hello@buildyourbooth.net" className="hover:underline">hello@buildyourbooth.net</a>
                                                </div>
                                                <a
                                                    href="https://api.whatsapp.com/send?phone=966547639806"
                                                    target="_blank"
                                                    className="flex items-center gap-2 text-green-600 font-bold text-sm hover:underline"
                                                >
                                                    <ChatCircleText size={18} weight="bold" />
                                                    <span>{t('common.chatOnWhatsApp')}</span>
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatedItem>
                            </div>
                        </AnimatedItem>
                    </div>
                </div>
            </AnimatedSection>
        </PublicLayout>
    );
}