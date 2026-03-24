import { Link } from '@inertiajs/react';

export default function MobileNavLink({ href, active, onClick, children }) {
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
