import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { MapPin, Phone, EnvelopeSimple, WhatsappLogo, List, X, CaretUp } from 'phosphor-react';
import { useEffect } from 'react';
import PageTransition from '@/Components/PageTransition';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

// Import Lenis hook to access smooth scroll functionality
// useLenis: Hook that provides access to the Lenis instance
// This allows us to use Lenis's smooth scroll methods instead of native browser scrolling
import { useLenis } from 'lenis/react';

/**
 * PublicLayout Component
 * 
 * Main layout component for public-facing pages.
 * Includes navigation, footer, and scroll-to-top functionality.
 * 
 * Features:
 * - Responsive navigation with mobile menu
 * - Smooth scroll to top button (using Lenis)
 * - Language switcher
 * - Footer with contact information
 */
export default function PublicLayout({ children }) {
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    /**
     * Performance Optimization: Use ref to track previous state
     * 
     * Why use useRef here?
     * - Prevents unnecessary re-renders by only updating state when value actually changes
     * - The callback runs on every scroll frame (60fps), so we want to minimize state updates
     * - Only call setState when the visibility state actually needs to change
     */
    const prevShowScrollTop = useRef(false);

    /**
     * Get Lenis instance using the useLenis hook
     * 
     * Why use useLenis?
     * - Provides access to Lenis's smooth scroll methods
     * - Allows programmatic control of scroll position
     * - Works seamlessly with the LenisProvider in app.jsx
     * 
     * Performance Note:
     * - This callback runs on every scroll frame (~60fps during scrolling)
     * - We use useRef to track previous state and only update when value changes
     * - This prevents unnecessary re-renders and improves performance
     * 
     * The callback function receives scroll data on every scroll event
     * We can use this to track scroll position for UI updates (like showing/hiding scroll-to-top button)
     */
    const lenis = useLenis(({ scroll, velocity, direction }) => {
        /**
         * This callback runs on every scroll event
         * 
         * Parameters:
         * - scroll: Current scroll position in pixels
         * - velocity: Current scroll velocity
         * - direction: Scroll direction (1 = down, -1 = up)
         * 
         * Performance Optimization:
         * - Calculate the new state value
         * - Only call setState if the value actually changed
         * - This prevents unnecessary re-renders (important since this runs ~60fps)
         */
        const shouldShow = scroll > 400;

        // Only update state if the value actually changed
        // This prevents unnecessary re-renders during scrolling
        if (shouldShow !== prevShowScrollTop.current) {
            prevShowScrollTop.current = shouldShow;
            setShowScrollTop(shouldShow);
        }
    });

    /**
     * Scroll to Top Function
     * 
     * Smoothly scrolls the page back to the top using Lenis.
     * 
     * Why use Lenis instead of window.scrollTo?
     * - Lenis provides smoother, more performant scrolling
     * - Consistent with the smooth scroll behavior throughout the app
     * - Better integration with Framer Motion animations
     * - More control over scroll animation (duration, easing, etc.)
     * 
     * Options:
     * - immediate: false - Use smooth scroll animation (not instant)
     * - duration: 1.2 - Animation duration (uses Lenis default)
     */
    const scrollToTop = () => {
        if (lenis) {
            // Use Lenis's scrollTo method for smooth scrolling
            lenis.scrollTo(0, {
                immediate: false, // Smooth scroll animation
            });
        }
    };
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Navigation */}
            <nav className="top-0 z-40 relative bg-[#f6f4ef]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-24">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center">
                                <ApplicationLogo className="h-10 lg:h-14 w-auto" />
                            </Link>

                        </div>
                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-4">
                            <NavLink href="/" active={route().current('welcome')}>{t('common.home')}</NavLink>
                            <NavLink href="/calendar" active={route().current('calendar.index')}>{t('common.exhibitionsCalendar')}</NavLink>
                            <NavLink href="/about" active={route().current('about')}>{t('common.about')}</NavLink>
                            <NavLink href="/portfolio" active={route().current('portfolio')}>{t('common.portfolio')}</NavLink>
                            <NavLink href="/contact" active={route().current('contact')}>{t('common.contact')}</NavLink>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-6">
                            <LanguageSwitcher />
                            <a
                                href="https://api.whatsapp.com/send?phone=966547639806"
                                target="_blank"
                                className="hidden xl:flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="p-2 bg-white rounded-full">
                                    <WhatsappLogo size={20} weight="fill" className="text-green-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{t('common.whatsapp')}</span>
                                    <span className="text-sm font-medium text-slate-900 leading-tight">{t('common.freeConsultation')}</span>
                                </div>
                            </a>
                            <a href='/contact' className="bg-blue-600 text-white hover:text-white font-medium px-6 py-3 rounded-md text-xs transition-all uppercase tracking-wide">
                                {t('common.buildYourBooth')}
                            </a>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden flex items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                {mobileMenuOpen ? (
                                    <X size={24} weight="bold" />
                                ) : (
                                    <List size={24} weight="bold" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white transition-all duration-300">
                        <div className="px-4 py-8 space-y-6">
                            <MobileNavLink href="/" active={route().current('welcome')} onClick={() => setMobileMenuOpen(false)}>{t('common.home')}</MobileNavLink>
                            <MobileNavLink href="/calendar" active={route().current('calendar.index')} onClick={() => setMobileMenuOpen(false)}>{t('common.exhibitionsCalendar')}</MobileNavLink>
                            <MobileNavLink href="/about" active={route().current('about')} onClick={() => setMobileMenuOpen(false)}>{t('common.aboutUs')}</MobileNavLink>
                            <MobileNavLink href="/portfolio" active={route().current('portfolio')} onClick={() => setMobileMenuOpen(false)}>{t('common.portfolio')}</MobileNavLink>
                            <MobileNavLink href="/contact" active={route().current('contact')} onClick={() => setMobileMenuOpen(false)}>{t('common.contact')}</MobileNavLink>
                            <div className="px-4">
                                <LanguageSwitcher />
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-4">
                                <a
                                    href="https://api.whatsapp.com/send?phone=966547639806"
                                    target="_blank"
                                    className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl"
                                >
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                        <WhatsappLogo size={24} weight="fill" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-none">{t('common.whatsapp')}</span>
                                        <span className="text-sm font-medium text-slate-800 leading-tight">{t('common.freeConsultation')}</span>
                                    </div>
                                </a>
                                <button className="w-full bg-blue-600 text-white font-medium py-4 rounded-2xl text-[13px] uppercase tracking-wide">
                                    {t('common.buildYourBooth')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Page Content */}
            <main>
                <PageTransition>
                    {children}
                </PageTransition>
            </main>

            {/* Footer */}
            <footer className="bg-black text-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-20">
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-16 w-auto" variant="white" />
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                                {t('footer.description')}
                            </p>
                            <div className="space-y-4">
                                <ContactItem icon={MapPin} text={t('footer.ksaLocation')} />
                                <ContactItem icon={Phone} text="(+966) 54 763 9806" href="tel:+966547639806" />
                                <ContactItem icon={MapPin} text={t('footer.egyptLocation')} />
                                <ContactItem icon={Phone} text="(+20) 100 500 3732" href="tel:+201005003732" />
                                <ContactItem icon={EnvelopeSimple} text={t('footer.email')} href="mailto:hello@buildyourbooth.net" />
                            </div>
                        </div>

                        <div>
                            <div className="mb-8 lg:mb-10">
                                <h4 className="font-bold text-lg mb-3 text-white">{t('common.quickLinks')}</h4>
                                <div className="w-12 h-[2px] bg-indigo-500"></div>
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                                <FooterLink href="/calendar">{t('common.exhibitionsCalendar')}</FooterLink>
                                <FooterLink href="/portfolio">{t('common.portfolio')}</FooterLink>
                                <FooterLink href="/about">{t('common.aboutUs')}</FooterLink>
                                <FooterLink href="/contact">{t('common.contactUs')}</FooterLink>
                            </ul>
                        </div>

                        <div>
                            <div className="mb-8 lg:mb-10">
                                <h4 className="font-bold text-lg mb-3 text-white">{t('common.quickLinks')}</h4>
                                <div className="w-12 h-[2px] bg-indigo-500"></div>
                            </div>
                            <ul className="space-y-5">
                                <FooterLink href="https://www.scega.gov.sa">{t('footer.scega')}</FooterLink>
                                <FooterLink href="http://www.eeca.gov.eg">{t('footer.eeca')}</FooterLink>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-10 text-center">
                        <p className="text-slate-500 text-xs font-medium">
                            {t('common.copyright')} © {new Date().getFullYear()}. {t('common.allRightsReserved')}
                        </p>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 end-8 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1 focus:outline-none ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
                    }`}
                aria-label={t('common.scrollToTop')}
            >
                <CaretUp size={24} weight="bold" />
            </button>
        </div>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center text-center text-base font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${active
                ? 'text-blue-600 lg:bg-blue-600/10 lg:px-3 lg:py-2 lg:rounded-md transition-all ease-in-out'
                : 'text-slate-600 hover:text-blue-600 lg:px-3'
                }`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, active, onClick, children }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`block py-3 px-4 rounded-xl text-sm font-medium uppercase tracking-wide transition-colors ${active
                ? 'bg-blue-600 text-white hover:text-white'
                : 'text-slate-600 hover:bg-gray-50'
                }`}
        >
            {children}
        </Link>
    );
}

function ContactItem({ icon: Icon, text, href }) {
    return (
        <div className="flex items-start gap-3 text-slate-400 group cursor-default">
            <Icon size={18} weight="bold" className="text-blue-600 mt-0.5 shrink-0" />
            {href ? (
                <a href={href} className="leading-tight text-slate-300 hover:text-blue-400 transition-colors">
                    {text}
                </a>
            ) : (
                <span className="leading-tight text-slate-300">{text}</span>
            )}
        </div>
    );
}

function FooterLink({ href, className = "", children }) {
    const isExternal = href.startsWith('http');
    const classes = `text-white hover:text-indigo-400 text-md font-medium transition-colors ${className}`;

    return (
        <li>
            {isExternal ? (
                <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            ) : (
                <Link href={href} className={classes}>
                    {children}
                </Link>
            )}
        </li>
    );
}
